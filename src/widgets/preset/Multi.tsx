import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import {
  ActionIcon,
  Group,
  InputLabel,
  NumberInput,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  Textarea,
  TextInput,
  Tooltip
} from '@mantine/core';
import { v4 as uuidv4 } from 'uuid';

import ColorPickerComponent from '@/components/ColorPickerComponent';
import ComponentContainer from '@/components/ComponentContainer';
import DisplayLabel from '@/components/DisplayLabel';
import ImageUpload from '@/components/ImageUpload';
import { Information } from '@/components/Information';
import SelectableDropdown from '@/components/SelectableDropdown';
import StatusBar, { StatusBarRef } from '@/components/StatusBar';
import { EditIcon, LinkIcon, UnlinkIcon, XIcon } from '@/icons/icons';
import { useBoundStore } from '@/store/boundStore';
import {
  BooleanComponent,
  Component,
  ComponentBaseColors,
  ComponentType,
  FadeComponent,
  FlyToComponent,
  isMultiOption,
  MultiComponent,
  MultiOption,
  multiOptions as MultiOptions,
  SetFocusComponent,
  TriggerComponent
} from '@/types/components';
import { getCopy } from '@/utils/copyHelpers';
import ComponentModal from '@/widgets/ComponentModal';

import { BoolGUIComponent } from '../property/Boolean';
import { TriggerGUIComponent } from '../property/Trigger';

import { FadeGUIComponent } from './Fade';
import { FlyToGUIComponent } from './FlyTo';
import { FocusComponent } from './Focus';

// One entry in a Multi's ordered list of chained/parallel sub-components
interface MultiType {
  component: MultiOption['id'];
  buffer: number;
  chained: boolean;
  endTime: number;
  startTime: number;
  id: string;
}

interface MultiModalProps {
  component: MultiComponent | null;
  handleComponentData: (data: Partial<MultiComponent>) => void;
}

function MultiModal({ component, handleComponentData }: MultiModalProps) {
  const [items, setItems] = useState<MultiType[]>(
    component
      ? component.components.map((v) => ({
          ...v,
          id: v.component
        }))
      : []
  );
  const [backgroundImage, setBackgroundImage] = useState<string>(
    component?.backgroundImage || ''
  );
  const handleImageChange = useCallback(
    (image: string) => setBackgroundImage(image),
    [setBackgroundImage]
  );
  const [availableOptions, setAvailableOptions] = useState<Component['id'][]>([]);
  const updateComponent = useBoundStore((state) => state.updateComponent);
  const getComponentById = useBoundStore((state) => state.getComponentById);
  const copyComponent = useBoundStore((state) => state.copyComponent);
  const removeComponent = useBoundStore((state) => state.removeComponent);
  // only return components that can be type MultiOption
  const multiOptions: Component['id'][] = useBoundStore((state) =>
    Object.keys(state.components).filter((c: Component['id']) =>
      isMultiOption(getComponentById(c))
    )
  );
  const [guiName, setGuiName] = useState<string>(component?.gui_name || '');
  const [guiDescription, setGuiDescription] = useState<string>(
    component?.gui_description || ''
  );
  const [color, setColor] = useState<string>(
    component?.color || ComponentBaseColors.multi
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentComponentId, setCurrentComponentId] = useState('');
  const [currentComponentType, setCurrentComponentType] = useState<ComponentType | ''>(
    ''
  );
  const [cancelCallback, setCancelCallback] = useState<() => void>(() => () => {});
  const [initialData, setInitialData] = useState<Partial<MultiOption>>({
    isMulti: 'pendingSave'
  });

  const handleAddComponent = (type: ComponentType) => {
    const newId = uuidv4();
    setInitialData({
      isMulti: 'pendingSave'
    });
    setCurrentComponentType(type);
    setCurrentComponentId(newId);
    addItem(newId);
    setIsModalOpen(true);
    setCancelCallback(() => () => {
      setItems(items.filter((item) => item.id !== newId));
    });
  };

  function sortAdjacentUnchainedItems(tempItems: MultiType[]) {
    // Identify and sort unchained items that are adjacent to other unchained items
    const unchainedGroups: MultiType[][] = [];
    let currentGroup: MultiType[] = [];
    for (let i = 0; i < tempItems.length; i++) {
      if (!tempItems[i].chained) {
        currentGroup.push(tempItems[i]);
      } else {
        if (currentGroup.length > 1) {
          unchainedGroups.push([...currentGroup]);
        }
        currentGroup = [];
      }
    }
    if (currentGroup.length > 1) {
      unchainedGroups.push([...currentGroup]);
    }

    // Sort each group by intDuration + buffer
    unchainedGroups.forEach((group) => {
      group.sort((a, b) => {
        const componentA = getComponentById(a.component) ?? {
          intDuration: 0
        };
        const componentB = getComponentById(b.component) ?? {
          intDuration: 0
        };
        //@ts-ignore
        const durationA = (componentA.intDuration || 0) + a.buffer;
        //@ts-ignore
        const durationB = (componentB.intDuration || 0) + b.buffer;
        return durationA - durationB;
      });
    });

    // Reinsert sorted groups back into tempItems
    let sortedIndex = 0;
    for (let i = 0; i < tempItems.length; i++) {
      if (!tempItems[i].chained && sortedIndex < unchainedGroups.length) {
        const group = unchainedGroups[sortedIndex];
        for (let j = 0; j < group.length; j++) {
          tempItems[i + j] = group[j];
        }
        i += group.length - 1;
        sortedIndex++;
      }
    }
  }

  function recalculateOffsets(tempItems: MultiType[]) {
    const originalOrder = tempItems.map((v) => v.id);
    sortAdjacentUnchainedItems(tempItems);
    let lastStartTime = 0;
    let lastEndTime = 0;
    for (let i = 0; i < tempItems.length; i++) {
      if (i == 0) {
        tempItems[i].chained = false;
      }
      if (!tempItems[i].chained) {
        tempItems[i].startTime = lastStartTime + tempItems[i].buffer;
      } else {
        tempItems[i].startTime = lastEndTime + tempItems[i].buffer;
        lastStartTime = tempItems[i].startTime;
      }
      tempItems[i].endTime =
        tempItems[i].startTime +
        //@ts-ignore
        (getComponentById(tempItems[i].component)?.intDuration || 1.0);
      lastEndTime = tempItems[i].endTime;
    }
    //put back in original order
    tempItems.sort((a, b) => {
      return originalOrder.indexOf(a.id) - originalOrder.indexOf(b.id);
    });
  }

  useEffect(() => {
    const newItems = Array.from(items);
    recalculateOffsets(newItems);
    setItems(newItems);
  }, [items]);

  useEffect(() => {
    setAvailableOptions(
      multiOptions.filter((component) => !items.some((item) => item.id === component))
    );
    handleComponentData({
      components: items.map((v) => ({
        component: v.component,
        startTime: v.startTime,
        endTime: v.endTime,
        buffer: v.buffer,
        chained: v.chained
      })),
      backgroundImage,
      gui_description: guiDescription,
      gui_name: guiName,
      color
    });
  }, [items, backgroundImage, guiName, guiDescription, color]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newList = Array.from(items);
    const [reorderedItem] = newList.splice(result.source.index, 1);
    newList.splice(result.destination.index, 0, reorderedItem);
    setItems(newList);
  };

  const addItem = (component: MultiOption['id']) => {
    const newComponent = copyComponent(component, true);

    if (!newComponent) return;
    const newItem: MultiType = {
      id: newComponent,
      component: newComponent,
      buffer: 0,
      startTime: 0,
      endTime: 0,
      chained: items.length > 0 ? true : false
    };
    setItems([...items, newItem]);
    updateComponent(newComponent, {
      isMulti: 'pendingSave'
    });
  };

  const removeItem = (id: string) => {
    const newList = items.filter((item) => item.id !== id);
    setItems(newList);
    removeComponent(id);
  };

  return (
    <Tabs defaultValue={'multi'}>
      <Tabs.List>
        <Tabs.Tab value={'multi'}>{getCopy('Multi', 'multi_settings')}</Tabs.Tab>
        <Tabs.Tab value={'visual'}>{getCopy('Multi', 'visual_settings')}</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value={'multi'}>
        <Stack gap={'md'}>
          <SimpleGrid cols={2}>
            <SelectableDropdown
              placeholder={'Add Existing Component'}
              options={availableOptions.map((component) => ({
                value: component,
                label: getComponentById(component)?.gui_name
              }))}
              selected={undefined}
              setSelected={(id: string) => {
                addItem(id);
              }}
            />
            <SelectableDropdown
              placeholder={'Add New Component'}
              options={MultiOptions}
              selected={undefined}
              setSelected={(type: string) => handleAddComponent(type as ComponentType)}
            />
          </SimpleGrid>
          <Text size={'sm'} c={'dimmed'}>
            <b>{getCopy('Multi', 'delay:')}</b>
            {getCopy('Multi', 'delay_copy')}
          </Text>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId={'droppable'}>
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {items.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <Group
                            justify={'space-between'}
                            wrap={'nowrap'}
                            gap={'xs'}
                            mb={'xs'}
                            px={'md'}
                            py={'xs'}
                            style={{
                              overflow: 'hidden',
                              border: '1px solid var(--mantine-color-default-border)',
                              borderRadius: 'var(--mantine-radius-sm)'
                            }}
                          >
                            <Text w={'40%'} truncate>
                              {getComponentById(item.id)?.gui_name}
                            </Text>
                            <Tooltip
                              maw={200}
                              label={
                                <>
                                  <b>{getCopy('Multi', 'chained_items:')}</b>
                                  {getCopy(
                                    'Multi',
                                    'these_items_start_their_operation_after_the_previous_item_has_completed_its_duration.'
                                  )}
                                  <br />
                                  <b>{getCopy('Multi', 'unchained_items:')}</b>
                                  {getCopy(
                                    'Multi',
                                    'these_run_concurrently_with_the_previous_item,_not_waiting_for_the_previous_operations_to_complete.'
                                  )}
                                </>
                              }
                            >
                              <ActionIcon
                                disabled={index === 0}
                                variant={item.chained ? 'filled' : 'subtle'}
                                onClick={() => {
                                  const newItems = Array.from(items);
                                  newItems[index].chained = !item.chained;
                                  recalculateOffsets(newItems);
                                  setItems(newItems);
                                }}
                              >
                                {item.chained ? (
                                  <LinkIcon size={20} />
                                ) : (
                                  <UnlinkIcon size={20} />
                                )}
                              </ActionIcon>
                            </Tooltip>
                            <Group gap={'xs'} wrap={'nowrap'}>
                              <InputLabel>{getCopy('Multi', 'delay')}</InputLabel>
                              <NumberInput
                                w={80}
                                name={'delay'}
                                min={0}
                                max={20}
                                step={0.2}
                                value={item.buffer}
                                onChange={(value) => {
                                  const newItems = Array.from(items);
                                  newItems[index].buffer =
                                    typeof value === 'number' ? value : parseFloat(value);
                                  setItems(newItems);
                                }}
                              />
                            </Group>
                            <Group gap={'xs'} wrap={'nowrap'}>
                              <Tooltip label={getCopy('Multi', 'edit_component')}>
                                <ActionIcon
                                  variant={'subtle'}
                                  onClick={() => {
                                    setInitialData({});
                                    setCurrentComponentId(item.id);
                                    setCurrentComponentType(
                                      getComponentById(item.id)?.type
                                    );
                                    setCancelCallback(() => () => {
                                      setItems(items);
                                    });
                                    setIsModalOpen(true);
                                  }}
                                >
                                  <EditIcon size={20} />
                                </ActionIcon>
                              </Tooltip>
                              <Tooltip label={getCopy('Multi', 'remove_from_component')}>
                                <ActionIcon
                                  variant={'subtle'}
                                  onClick={() => removeItem(item.id)}
                                >
                                  <XIcon size={20} />
                                </ActionIcon>
                              </Tooltip>
                            </Group>
                          </Group>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </Stack>
      </Tabs.Panel>
      <Tabs.Panel value={'visual'}>
        <Stack gap={'md'}>
          <TextInput
            id={'guiname'}
            label={getCopy('Multi', 'component_name')}
            placeholder={'Name of Component'}
            value={guiName}
            onChange={(e) => setGuiName(e.currentTarget.value)}
          />
          <Stack gap={'xs'}>
            <InputLabel>Background Color</InputLabel>
            <ColorPickerComponent color={color} setColor={setColor} />
          </Stack>
          <Stack gap={'xs'}>
            <InputLabel>{getCopy('Multi', 'background_image')}</InputLabel>
            <ImageUpload value={backgroundImage} onChange={handleImageChange} />
          </Stack>
          <Textarea
            id={'description'}
            label={getCopy('Multi', 'gui_description')}
            value={guiDescription}
            onChange={(e) => setGuiDescription(e.currentTarget.value)}
            placeholder={'Type your message here.'}
          />
        </Stack>
      </Tabs.Panel>

      <ComponentModal
        isOpen={isModalOpen}
        onClose={() => {
          const newItems = Array.from(items);
          recalculateOffsets(newItems);
          setItems(newItems);
          setIsModalOpen(false);
        }}
        onCancel={cancelCallback}
        componentId={currentComponentId}
        initialData={initialData}
        type={currentComponentType}
      />
    </Tabs>
  );
}

// Mounts each sub-component's GUI with shouldRender={false} so it registers its
// triggerAction/subscriptions in the store without drawing anything
function renderByType(component: MultiOption) {
  switch (component?.type) {
    case 'flyto':
      return (
        <FlyToGUIComponent
          key={component.id}
          component={component as FlyToComponent}
          shouldRender={false}
        />
      );
    case 'fade':
      return (
        <FadeGUIComponent
          key={component.id}
          component={component as FadeComponent}
          shouldRender={false}
        />
      );
    case 'setfocus':
      return (
        <FocusComponent
          key={component.id}
          component={component as SetFocusComponent}
          shouldRender={false}
        />
      );
    case 'boolean':
      return (
        <BoolGUIComponent
          key={component.id}
          component={component as BooleanComponent}
          shouldRender={false}
        />
      );
    case 'trigger':
      return (
        <TriggerGUIComponent
          key={component.id}
          component={component as TriggerComponent}
          shouldRender={false}
        />
      );
    default:
      return null;
  }
}

interface MultiGUIComponentProps {
  component: MultiComponent;
}

function MultiGUIComponent({ component }: MultiGUIComponentProps) {
  const getComponentById = useBoundStore((state) => state.getComponentById);
  const fadeOutDuration = 400; // 1 second fade out
  const statusBarRef = useRef<StatusBarRef>(null);
  const triggerAnimation = () => {
    statusBarRef.current?.triggerAnimation();
  };

  const totalDelay = useMemo(() => {
    return component.components[component.components.length - 1]?.endTime || 0;
  }, [component.components]);
  const [currentItems, setCurrentItems] = useState<string[]>([]);
  const [_trigger, setTrigger] = useState(false);
  const timeoutIds = useRef<ReturnType<typeof setTimeout>[]>([]);

  const triggerComponents = useCallback(() => {
    setTrigger(true);
    component.components.forEach((item, index) => {
      const triggerComponent = () => {
        const tempComponent = getComponentById(item.component) as MultiOption | undefined;
        if (tempComponent) {
          setCurrentItems((items) => [...items, tempComponent.gui_name || '']);
          tempComponent.triggerAction?.();
          if (item.endTime) {
            const intDurationTimeoutId = setTimeout(
              () => {
                setCurrentItems((items) =>
                  items.filter((i) => i !== tempComponent.gui_name)
                );
              },
              ((item.endTime == 0 ? 0.5 : item.endTime) - item.startTime) * 1000
            );
            timeoutIds.current.push(intDurationTimeoutId);
          }
          triggerAnimation();
        }
        if (index === component.components.length - 1) {
          const finalDelayTimeoutId = setTimeout(() => {
            setTrigger(false);
            setCurrentItems([]);
          }, item.endTime * 1000);
          timeoutIds.current.push(finalDelayTimeoutId);
        }
      };
      const totalOffsetTimeoutId = setTimeout(triggerComponent, item.startTime * 1000);
      timeoutIds.current.push(totalOffsetTimeoutId);
    });
  }, [component.components]);

  useEffect(() => {
    return () => {
      timeoutIds.current.forEach(clearTimeout);
      timeoutIds.current = [];
    };
  }, []);

  return (
    <ComponentContainer
      backgroundImage={component.backgroundImage}
      backgroundColor={component.color}
      onClick={() => {
        triggerComponents();
        triggerAnimation();
      }}
    >
      <StatusBar
        ref={statusBarRef}
        duration={totalDelay}
        fadeOutDuration={fadeOutDuration}
      />
      <DisplayLabel>
        <Stack gap={'xs'}>
          <Text>{component.gui_name}</Text>
          {currentItems.length > 0 && (
            <Stack gap={4}>
              <InputLabel>{getCopy('Multi', 'current_items:')}</InputLabel>
              {currentItems.map((v) => (
                <InputLabel key={v}>{v}</InputLabel>
              ))}
            </Stack>
          )}
          <Information content={component?.gui_description} />
        </Stack>
      </DisplayLabel>

      {/* add none rendered versions of components to dom to register their actions and subscriptions */}
      {component?.components.map((v) => {
        return renderByType(getComponentById(v.component) as MultiOption);
      })}
    </ComponentContainer>
  );
}

export { MultiGUIComponent, MultiModal };
