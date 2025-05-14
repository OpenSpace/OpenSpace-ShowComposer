import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import { Edit2, Link, Unlink, XIcon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import ButtonLabel from '@/components/common/ButtonLabel';
import ColorPickerComponent from '@/components/common/ColorPickerComponent';
import ComponentContainer from '@/components/common/ComponentContainer';
import ImageUpload from '@/components/common/ImageUpload';
import Information from '@/components/common/Information';
import SelectableDropdown from '@/components/common/SelectableDropdown';
import ComponentModal from '@/components/ComponentModal';
import StatusBar, { StatusBarRef } from '@/components/StatusBar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Toggle } from '@/components/ui/toggle';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useBoundStore } from '@/store/boundStore';
import {
  BooleanComponent,
  Component,
  ComponentType,
  FadeComponent,
  FlyToComponent,
  isMultiOption,
  MultiComponent,
  MultiOption,
  multiOptions as MultiOptions,
  SetFocusComponent,
  TriggerComponent
} from '@/store/ComponentTypes';
import { ComponentBaseColors } from '@/store/ComponentTypes';
import { getCopy } from '@/utils/copyHelpers';

import { BoolGUIComponent } from '../property/Boolean';
import { TriggerGUIComponent } from '../property/Trigger';

import { FadeGUIComponent } from './Fade';
import { FlyToGUIComponent } from './FlyTo';
import { FocusComponent } from './Focus';
// // Define the type for list items
// set up chained v paralell data handling
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
// MultiModal Component
const MultiModal: React.FC<MultiModalProps> = ({ component, handleComponentData }) => {
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
  const [gui_name, setGuiName] = useState<string>(component?.gui_name || '');
  const [gui_description, setGuiDescription] = useState<string>(
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
  const [initalData, setInitialData] = useState<Partial<MultiOption>>({
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
    // let totalDelay = 0;
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
        // lastStartTime = lastStartTime ;
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
  // console.log(items);

  useEffect(() => {
    const newItems = Array.from(items);
    recalculateOffsets(newItems);
    setItems(newItems);
  }, [items]);
  useEffect(() => {
    setAvailableOptions(
      multiOptions.filter(
        (component) =>
          // getComponentById(component)?.isMulti != 'false' &&
          !items.some((item) => item.id === component)
      )
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
      gui_description,
      gui_name,
      color
    });
  }, [items, backgroundImage, gui_name, gui_description, color]);

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
      // Placeholder component
      // delay: 0, // Default delay of 1 second
      buffer: 0,
      startTime: 0,
      endTime: 0,
      // totalOffset: 0,
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
    // updateComponent(id, {
    //   isMulti: 'pendingDelete',
    // });
  };
  return (
    <Tabs defaultValue={'multi'} className={'w-auto'}>
      <TabsList className={'mb-4'}>
        <TabsTrigger value={'multi'}>{getCopy('Multi', 'multi_settings')}</TabsTrigger>
        <TabsTrigger value={'visual'}>{getCopy('Multi', 'visual_settings')}</TabsTrigger>
      </TabsList>
      <TabsContent value={'multi'}>
        <div className={'grid grid-cols-1 gap-4'}>
          <div className={'grid grid-cols-2 gap-4'}>
            <div className={'grid gap-2'}>
              {/* <Label>Add Existing Component</Label> */}
              <SelectableDropdown
                placeholder={'Add Existing Component'}
                shouldClear={true}
                options={availableOptions.map((component) => ({
                  value: component,
                  label: getComponentById(component)?.gui_name
                }))}
                selected={undefined}
                setSelected={(id: string) => {
                  addItem(id);
                }}
              />
            </div>
            <div className={'grid gap-2'}>
              {/* <Label>Add New Component</Label> */}

              <SelectableDropdown
                placeholder={'Add New Component'}
                options={MultiOptions}
                selected={undefined}
                shouldClear={true}
                setSelected={(type: string) => handleAddComponent(type as ComponentType)}
              />
            </div>
          </div>
          {/* {availableOptions.map((component, index) => (
           <button key={index} onClick={() => addItem(component)}>
           Add {getComponentById(component).type}
           </button>
           ))} */}
          <p className={'text-sm text-slate-500 dark:text-slate-400'}>
            <b>{getCopy('Multi', 'delay:')}</b>
            {getCopy('Multi', 'delay_copy')}
          </p>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId={'droppable'}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  //   className="flex flex-row"
                >
                  {items.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={
                            'mb-2 flex items-center justify-between gap-2 overflow-hidden rounded border px-4 py-2'
                          }
                        >
                          <div className={'w-[40%] overflow-hidden whitespace-nowrap'}>
                            {getComponentById(item.id)?.gui_name}
                          </div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Toggle
                                disabled={index == 0}
                                pressed={item.chained}
                                onPressedChange={(pressed) => {
                                  const newItems = Array.from(items);
                                  newItems[index].chained = pressed;
                                  recalculateOffsets(newItems);
                                  setItems(newItems);
                                }}
                                className={'p-1'}
                              >
                                {item.chained ? <Link size={20} /> : <Unlink size={20} />}
                              </Toggle>
                            </TooltipTrigger>
                            <TooltipContent className={'w-[200px] bg-white'}>
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
                            </TooltipContent>
                          </Tooltip>
                          <div className={'flex items-center gap-1'}>
                            <Label>{getCopy('Multi', 'delay')}</Label>
                            <Input
                              type={'number'}
                              className={'w-20'}
                              name={'delay'}
                              min={'0'}
                              max={'20'}
                              step={'0.2'}
                              value={item.buffer}
                              onChange={(e: React.FormEvent<HTMLInputElement>) => {
                                const { value } = e.currentTarget;
                                const newItems = Array.from(items);
                                newItems[index].buffer = parseFloat(value);
                                setItems(newItems);
                              }}
                            />
                          </div>
                          <div className={'flex-0 grid grid-cols-2 gap-2'}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Toggle
                                  pressed={undefined}
                                  onPressedChange={(_pressed: boolean) => {
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
                                  className={'p-1'}
                                >
                                  <Edit2
                                    size={20} // Adjust size as needed
                                    onClick={() => {
                                      // Your edit action here
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
                                    style={{
                                      cursor: 'pointer'
                                    }} // Makes the icon behave like a button
                                  />
                                </Toggle>
                              </TooltipTrigger>
                              <TooltipContent className={'bg-white'}>
                                {getCopy('Multi', 'edit_component')}
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Toggle
                                  pressed={undefined}
                                  onClick={() => removeItem(item.id)}
                                  className={'p-1'}
                                >
                                  <XIcon
                                    size={20} // Adjust size as needed
                                  />
                                </Toggle>
                              </TooltipTrigger>
                              <TooltipContent className={'bg-white'}>
                                {getCopy('Multi', 'remove_from_component')}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </TabsContent>
      <TabsContent value={'visual'}>
        <div className={'grid grid-cols-1 gap-4'}>
          <div className={'grid grid-cols-1 gap-4'}>
            <div className={'grid gap-2'}>
              <Label htmlFor={'gioname'}>{getCopy('Multi', 'component_name')}</Label>
              <Input
                id={'guiname'}
                placeholder={'Name of Component'}
                type={'text'}
                value={gui_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setGuiName(e.target.value)
                }
              />
            </div>
          </div>
          <div className={'grid grid-cols-1 gap-4'}>
            <div className={'grid gap-2'}>
              <Label htmlFor={'description'}>Background Color</Label>
              <div className={'flex flex-row gap-2'}>
                <ColorPickerComponent color={color} setColor={setColor} />
              </div>
            </div>
            <div className={'grid gap-2'}>
              <Label htmlFor={'description'}>
                {getCopy('Multi', 'background_image')}
              </Label>
              <ImageUpload
                value={backgroundImage}
                onChange={(v) => setBackgroundImage(v)}
              />
            </div>
            <div className={'grid gap-2'}>
              <Label htmlFor={'description'}>{getCopy('Multi', 'gui_description')}</Label>
              <Textarea
                className={'w-full'}
                id={'description'}
                value={gui_description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setGuiDescription(e.target.value)
                }
                placeholder={'Type your message here.'}
              />
            </div>
          </div>
        </div>
      </TabsContent>

      <ComponentModal
        isOpen={isModalOpen}
        onClose={() => {
          // recalculateOffsets(items);
          const newItems = Array.from(items);
          recalculateOffsets(newItems);
          setItems(newItems);
          setIsModalOpen(false);
        }}
        onCancel={cancelCallback}
        componentId={currentComponentId}
        initialData={initalData}
        type={currentComponentType}
      />
    </Tabs>
  );
};
function renderByType(component: MultiOption) {
  let content;
  switch (component?.type) {
    case 'flyto':
      content = (
        <FlyToGUIComponent
          key={component.id}
          component={component as FlyToComponent}
          shouldRender={false}
        />
      );
      break;
    case 'fade':
      content = (
        <FadeGUIComponent
          key={component.id}
          component={component as FadeComponent}
          shouldRender={false}
        />
      );
      break;
    case 'setfocus':
      content = (
        <FocusComponent
          key={component.id}
          component={component as SetFocusComponent}
          shouldRender={false}
        />
      );
      break;
    case 'boolean':
      content = (
        <BoolGUIComponent
          key={component.id}
          component={component as BooleanComponent}
          shouldRender={false}
        />
      );
      break;
    case 'trigger':
      content = (
        <TriggerGUIComponent
          key={component.id}
          component={component as TriggerComponent}
          shouldRender={false}
        />
      );
      break;
    default:
      content = null;
      break;
  }
  return content;
}
interface MultiGUIComponentProps {
  component: MultiComponent;
}

// MultiGUIComponent
const MultiGUIComponent: React.FC<MultiGUIComponentProps> = ({ component }) => {
  // const items = component.components;
  const getComponentById = useBoundStore((state) => state.getComponentById);
  const fadeOutDuration = 400; // 1 second fade out
  const statusBarRef = useRef<StatusBarRef>(null);
  const triggerAnimation = () => {
    statusBarRef.current?.triggerAnimation();
  };
  // useEffect(() => {
  //   if (component.components.length == 0) {
  //     return;
  //   }
  // }, [component]);

  const totalDelay = useMemo(() => {
    return component.components[component.components.length - 1]?.endTime || 0;
  }, [component.components]);
  const [currentItems, setCurrentItems] = useState<string[]>([]);
  // const [currentDelay, setCurrentDelay] = useState(0);
  const [_trigger, setTrigger] = useState(false);
  const timeoutIds = useRef<ReturnType<typeof setTimeout>[]>([]);

  const triggerComponents = useCallback(() => {
    setTrigger(true);
    component.components.forEach((item, index) => {
      const triggerComponent = () => {
        const tempComponent = getComponentById(item.component) as MultiOption | undefined;
        if (tempComponent) {
          // console.log(
          //   `Triggering ${tempComponent.gui_name} after ${item.startTime} seconds`,
          // );
          setCurrentItems((items) => [...items, tempComponent.gui_name || '']);
          tempComponent.triggerAction?.();
          if (item.endTime) {
            const intDurationTimeoutId = setTimeout(
              () => {
                // console.log(
                //   `Removing ${tempComponent.gui_name} after ${item.endTime} seconds`,
                // );
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
        // component.triggerAction?.();
        triggerComponents();
        triggerAnimation();
      }}
    >
      <StatusBar
        ref={statusBarRef}
        duration={totalDelay}
        fadeOutDuration={fadeOutDuration}
      />
      <ButtonLabel>
        <div className={'flex flex-col gap-2'}>
          <p>{component.gui_name}</p>
          {currentItems.length > 0 && (
            <div className={'grid-rows grid gap-1'}>
              <Label>{getCopy('Multi', 'current_items:')}</Label>
              {currentItems.map((v) => (
                <Label key={v}>{v}</Label>
              ))}
            </div>
          )}
          <Information content={component?.gui_description} />
        </div>
      </ButtonLabel>

      {/* add none rendered versions of components to dom to register their actions and subscriptions */}
      {component?.components.map((v, _i) => {
        return renderByType(getComponentById(v.component) as MultiOption);
      })}
    </ComponentContainer>
  );
};
export { MultiGUIComponent, MultiModal };
