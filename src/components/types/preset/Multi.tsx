import { useCallback, useEffect, useMemo, useState, useRef } from 'react';

import ComponentModal from '@/components/ComponentModal';
import SelectableDropdown from '@/components/common/SelectableDropdown';
import { useComponentStore } from '@/store';
import {
  MultiOption,
  isMultiOption,
  Component,
  MultiComponent,
  ComponentType,
  multiOptions as MultiOptions,
  TriggerComponent,
  FlyToComponent,
  FadeComponent,
  SetFocusComponent,
  BooleanComponent,
} from '@/store/componentsStore';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';

import { v4 as uuidv4 } from 'uuid';
import { FlyToGUIComponent } from './FlyTo';
import { FadeGUIComponent } from './Fade';
import { FocusComponent } from './Focus';
import { BoolGUIComponent } from '../property/Boolean';
import { TriggerGUIComponent } from '../property/Trigger';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Edit2, XIcon, Link, Unlink } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import ImageUpload from '@/components/common/ImageUpload';
import ButtonLabel from '@/components/common/ButtonLabel';
import StatusBar, { StatusBarRef } from '@/components/StatusBar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Information from '@/components/common/Information';

// // Define the type for list items
// set up chained v paralell data handling
interface MultiType {
  component: MultiOption['id'];
  // delay: number;
  buffer: number;
  chained: boolean;
  // totalOffset: number;
  endTime: number;
  startTime: number;
  id: string;
}
interface MultiModalProps {
  component: MultiComponent | null;
  handleComponentData: (data: Partial<MultiComponent>) => void;
}
// MultiModal Component
const MultiModal: React.FC<MultiModalProps> = ({
  component,
  handleComponentData,
}) => {
  const [items, setItems] = useState<MultiType[]>(
    component
      ? component.components.map((v) => ({ ...v, id: v.component }))
      : [],
  );
  const [backgroundImage, setBackgroundImage] = useState<string>(
    component?.backgroundImage || '',
  );
  const [availableOptions, setAvailableOptions] = useState<Component['id'][]>(
    [],
  );
  const updateComponent = useComponentStore((state) => state.updateComponent);
  const getComponentById = useComponentStore((state) => state.getComponentById);

  // only return components that can be type MultiOption
  const multiOptions: Component['id'][] = useComponentStore((state) =>
    Object.keys(state.components).filter((c: Component['id']) =>
      isMultiOption(getComponentById(c)),
    ),
  );
  const [gui_name, setGuiName] = useState<string>(component?.gui_name || '');
  const [gui_description, setGuiDescription] = useState<string>(
    component?.gui_description || '',
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentComponentId, setCurrentComponentId] = useState('');
  const [currentComponentType, setCurrentComponentType] = useState<
    ComponentType | ''
  >('');
  const [cancelCallback, setCancelCallback] = useState<() => void>(
    () => () => {},
  );
  const [initalData, setInitialData] = useState<Partial<MultiOption>>({
    isMulti: 'pendingSave',
  });
  const handleAddComponent = (type: ComponentType) => {
    const newId = uuidv4();
    setInitialData({ isMulti: 'pendingSave' });
    setCurrentComponentType(type);
    setCurrentComponentId(newId);
    addItem(newId);
    setIsModalOpen(true);
    setCancelCallback(() => () => {
      setItems(items.filter((item) => item.id !== newId));
    });
  };

  // make copy of multiotions and remove items as tehy are added to items
  // find last longest delay + duration

  // item a : [
  //   startTime
  //   endTime
  // ]

  // if there a gro

  function sortAdjacentUnchainedItems(tempItems: MultiType[]) {
    // Identify and sort unchained items that are adjacent to other unchained items
    let unchainedGroups: MultiType[][] = [];
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
        const componentA = getComponentById(a.component) ?? { intDuration: 0 };
        const componentB = getComponentById(b.component) ?? { intDuration: 0 };
        const durationA = componentA.intDuration || 0 + a.buffer;
        const durationB = componentB.intDuration || 0 + b.buffer;
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
    let originalOrder = tempItems.map((v) => v.id);
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
        (component) => !items.some((item) => item.id === component),
      ),
    );

    handleComponentData({
      components: items.map((v) => ({
        component: v.component,
        // delay: v.delay,
        startTime: v.startTime,
        endTime: v.endTime,
        buffer: v.buffer,
        // totalOffset: v.totalOffset,
        chained: v.chained,
      })),
      backgroundImage,
      gui_description,
      gui_name,
    });
  }, [items, backgroundImage, gui_name, gui_description]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newList = Array.from(items);
    const [reorderedItem] = newList.splice(result.source.index, 1);
    newList.splice(result.destination.index, 0, reorderedItem);
    setItems(newList);
  };

  // Add a new item to the list (simplified for demonstration)
  const addItem = (component: MultiOption['id']) => {
    const newItem: MultiType = {
      id: component,
      component: component, // Placeholder component
      // delay: 0, // Default delay of 1 second
      buffer: 0,
      startTime: 0,
      endTime: 0,
      // totalOffset: 0,
      chained: items.length > 0 ? true : false,
    };
    setItems([...items, newItem]);
    updateComponent(component, { isMulti: 'pendingSave' });
  };

  const removeItem = (id: string) => {
    const newList = items.filter((item) => item.id !== id);
    setItems(newList);
    updateComponent(id, {
      isMulti: 'pendingDelete',
    });
  };

  return (
    <Tabs defaultValue="multi" className="w-auto">
      <TabsList className="mb-4">
        <TabsTrigger value="multi">Multi Settings</TabsTrigger>
        <TabsTrigger value="visual">Visual Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="multi">
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              {/* <Label>Add Existing Component</Label> */}
              <SelectableDropdown
                placeholder="Add Existing Component"
                shouldClear={true}
                options={availableOptions.map((component) => ({
                  value: component,
                  label: getComponentById(component)?.gui_name,
                }))}
                selected={undefined}
                setSelected={(id: string) => {
                  addItem(id);
                }}
              />
            </div>
            <div className="grid gap-2">
              {/* <Label>Add New Component</Label> */}

              <SelectableDropdown
                placeholder="Add New Component"
                options={MultiOptions}
                selected={undefined}
                shouldClear={true}
                setSelected={(type: string) =>
                  handleAddComponent(type as ComponentType)
                }
              />
            </div>
          </div>
          {/* {availableOptions.map((component, index) => (
        <button key={index} onClick={() => addItem(component)}>
          Add {getComponentById(component).type}
        </button>
      ))} */}
          <p className="text-sm text-slate-500 dark:text-slate-400">
            <b>Delay:</b> This delay is applied differently based on the item's
            chaining status: For chained items, the delay is added after the
            completion of the previous item's duration. For unchained items, the
            delay is from the start the beginning of the workflow or the start
            time of the previous item.
          </p>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  //   className="flex flex-row"
                >
                  {items.map((item, index) => (
                    <Draggable
                      key={item.id}
                      draggableId={item.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="mb-2 flex items-center justify-between gap-2 overflow-hidden rounded border px-4 py-2"
                        >
                          <div className="w-[40%] overflow-hidden whitespace-nowrap">
                            {getComponentById(item.id)?.gui_name}
                          </div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Toggle
                                disabled={index == 0}
                                pressed={item.chained}
                                onPressedChange={(pressed) => {
                                  const newItems = Array.from(items);
                                  console.log(pressed);
                                  newItems[index].chained = pressed;
                                  recalculateOffsets(newItems);
                                  setItems(newItems);
                                }}
                                className="p-1"
                              >
                                {item.chained ? (
                                  <Link size={20} />
                                ) : (
                                  <Unlink size={20} />
                                )}
                              </Toggle>
                            </TooltipTrigger>
                            <TooltipContent className="w-[200px] bg-white">
                              <b>Chained Items:</b> These items start their
                              operation after the previous item has completed
                              its duration.
                              <br />
                              <b>Unchained Items:</b> These run concurrently
                              with the previous item, not waiting for the
                              previous operations to complete.
                            </TooltipContent>
                          </Tooltip>
                          <div className="flex items-center gap-1">
                            <Label> Delay</Label>
                            <Input
                              type="number"
                              className="w-20"
                              name="delay"
                              min="0"
                              max="20"
                              step="0.2"
                              value={item.buffer}
                              onChange={(
                                e: React.FormEvent<HTMLInputElement>,
                              ) => {
                                const value = e.currentTarget.value;
                                const newItems = Array.from(items);
                                newItems[index].buffer = parseFloat(value);
                                console.log(value);
                                setItems(newItems);
                              }}
                            />
                          </div>
                          <div className="flex-0 grid grid-cols-2 gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Toggle
                                  pressed={undefined}
                                  onPressedChange={(_pressed: boolean) => {
                                    setInitialData({});
                                    setCurrentComponentId(item.id);
                                    setCurrentComponentType(
                                      getComponentById(item.id)?.type,
                                    );
                                    setCancelCallback(() => () => {
                                      setItems(items);
                                    });

                                    setIsModalOpen(true);
                                  }}
                                  className="p-1"
                                >
                                  <Edit2
                                    size={20} // Adjust size as needed
                                    onClick={() => {
                                      // Your edit action here
                                      setInitialData({});
                                      setCurrentComponentId(item.id);
                                      setCurrentComponentType(
                                        getComponentById(item.id)?.type,
                                      );
                                      setCancelCallback(() => () => {
                                        setItems(items);
                                      });

                                      setIsModalOpen(true);
                                    }}
                                    style={{ cursor: 'pointer' }} // Makes the icon behave like a button
                                  />
                                </Toggle>
                              </TooltipTrigger>
                              <TooltipContent className="bg-white">
                                Edit Component
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Toggle
                                  pressed={undefined}
                                  onClick={() => removeItem(item.id)}
                                  className="p-1"
                                >
                                  <XIcon
                                    size={20} // Adjust size as needed
                                  />
                                </Toggle>
                              </TooltipTrigger>
                              <TooltipContent className="bg-white">
                                Remove from Component
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
      <TabsContent value="visual">
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="gioname">Component Name</Label>
              <Input
                id="guiname"
                placeholder="Name of Component"
                type="text"
                value={gui_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setGuiName(e.target.value)
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="description"> Background Image</Label>
              <ImageUpload
                value={backgroundImage}
                onChange={(v) => setBackgroundImage(v)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description"> Gui Description</Label>
              <Textarea
                className="w-full"
                id="description"
                value={gui_description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setGuiDescription(e.target.value)
                }
                placeholder="Type your message here."
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
  const getComponentById = useComponentStore((state) => state.getComponentById);
  const fadeOutDuration = 400; // 1 second fade out
  const statusBarRef = useRef<StatusBarRef>(null);
  const triggerAnimation = () => {
    statusBarRef.current?.triggerAnimation();
  };

  useEffect(() => {
    if (component.components.length == 0) {
      return;
    }
    console.log(component.components);
  }, [component]);

  // const finalDelay = useMemo(() => {
  //   return (
  //     getComponentById(
  //       component.components[component.components.length - 1]?.component,
  //     )?.intDuration || 0
  //   );
  // }, [component.components]);
  // const finalDelay = useMemo(() => {
  //   return Math.max(
  //     ...component.components.map((item) => {
  //       const tempComponent = getComponentById(item.component);
  //       return item.totalOffset + (tempComponent?.intDuration || 0);
  //     }),
  //     0,
  //   );
  // }, [component.components]);

  // console.log(component.components);

  const totalDelay = useMemo(() => {
    return component.components[component.components.length - 1]?.endTime || 0;
  }, [component.components]);

  const [currentItems, setCurrentItems] = useState<string[]>([]);
  // const [currentDelay, setCurrentDelay] = useState(0);
  const [trigger, setTrigger] = useState(false);
  const timeoutIds = useRef<ReturnType<typeof setTimeout>[]>([]);

  const triggerComponents = useCallback(() => {
    setTrigger(true);
    component.components.forEach((item, index) => {
      const triggerComponent = () => {
        const tempComponent = getComponentById(item.component) as
          | MultiOption
          | undefined;
        if (tempComponent) {
          console.log(
            `Triggering ${tempComponent.gui_name} after ${item.startTime} seconds`,
          );
          setCurrentItems((items) => [...items, tempComponent.gui_name || '']);
          tempComponent.triggerAction?.();

          if (item.endTime) {
            const intDurationTimeoutId = setTimeout(
              () => {
                console.log(
                  `Removing ${tempComponent.gui_name} after ${item.endTime} seconds`,
                );
                setCurrentItems((items) =>
                  items.filter((i) => i !== tempComponent.gui_name),
                );
              },
              ((item.endTime == 0 ? 0.5 : item.endTime) - item.startTime) *
                1000,
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

      const totalOffsetTimeoutId = setTimeout(
        triggerComponent,
        item.startTime * 1000,
      );
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
    <div
      className="absolute right-0 top-0 flex h-full w-full items-center justify-center hover:cursor-pointer"
      style={{
        //cover and center the background image
        pointerEvents: trigger ? 'none' : 'auto',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundImage: `url(${component.backgroundImage})`,
      }}
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
      <ButtonLabel>
        <div className="flex flex-col gap-2">
          <p>{component.gui_name}</p>
          {currentItems.length > 0 && (
            <div className="grid-rows grid gap-1">
              <Label>Current Items:</Label>
              {currentItems.map((v) => (
                <Label>{v}</Label>
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
    </div>
  );
};

export { MultiModal, MultiGUIComponent };
