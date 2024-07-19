import { useCallback, useEffect, useMemo, useState } from 'react';

import ComponentModal from '@/components/ComponentModal';
import SelectableDropdown from '@/components/common/SelectableDropdown';
import { Button } from '@/components/ui/button';
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
} from 'react-beautiful-dnd';
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
import { Tooltip, TooltipContent } from '@/components/ui/tooltip';
import { TooltipTrigger } from '@radix-ui/react-tooltip';

// // Define the type for list items
// set up chained v paralell data handling
interface MultiType {
  component: MultiOption['id'];
  delay: number;
  buffer: number;
  chained: boolean;
  totalOffset: number;
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
  const [itemOrder, setItemOrder] = useState<string[]>(items.map((v) => v.id));
  const handleAddComponent = (type: ComponentType) => {
    const newId = uuidv4();
    setInitialData({ isMulti: 'pendingSave' });
    setCurrentComponentType(type);
    setCurrentComponentId(newId);
    addItem(newId);
    setIsModalOpen(true);
    setCancelCallback(() => () => {
      setItems(items.filter((item) => item.id !== newId));
      //   updateComponent(newId, {
      //     isMulti: 'pendingDelete',
      //   });
    });
  };

  // make copy of multiotions and remove items as tehy are added to items

  function recalculateOffsets(tempItems: MultiType[]) {
    let totalDelay = 0;
    for (let i = 0; i < tempItems.length; i++) {
      if (i == 0) {
        tempItems[i].chained = false;
      }
      tempItems[i].delay = tempItems[i].chained ? totalDelay : 0;
      tempItems[i].totalOffset =
        tempItems[i].buffer + (tempItems[i].chained ? tempItems[i].delay : 0);
      const component = getComponentById(tempItems[i].component);
      totalDelay =
        tempItems[i].buffer + (component ? component?.intDuration || 0 : 0);
    }
  }
  console.log(items);

  useEffect(() => {
    setAvailableOptions(
      multiOptions.filter(
        (component) => !items.some((item) => item.id === component),
      ),
    );
    if (itemOrder != items.map((v) => v.id)) {
      recalculateOffsets(items);
    }
    setItemOrder(items.map((v) => v.id));

    handleComponentData({
      components: items.map((v) => ({
        component: v.component,
        delay: v.delay,
        buffer: v.buffer,
        totalOffset: v.totalOffset,
        chained: false,
      })),
    });
  }, [items]);

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
      delay: 0, // Default delay of 1 second
      buffer: 0,
      totalOffset: 0,
      chained: items.length > 0 ? true : false,
    };
    setItems([...items, newItem]);
    updateComponent(component, { isMulti: 'pendingSave' });
  };

  const removeItem = (id: string) => {
    const newList = items.filter((item) => item.id !== id);
    setItems(newList);
    console.log('removeItem', id);
    // console.log(multiOptions.find((v) => v == id)?.isMulti);
    updateComponent(id, {
      isMulti: 'pendingDelete',
    });
  };

  return (
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
        delay is from the start the beginning of the workflow or the start time
        of the previous item.
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
                <Draggable key={item.id} draggableId={item.id} index={index}>
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
                          {/* <ToggleGroup
                            type="single"
                            // onChange={}
                            value={item.chained ? 'chained' : 'unchained'}
                            onValueChange={(value) => {
                              const newItems = Array.from(items);
                              newItems[index].chained = value === 'chained';
                              recalculateOffsets(newItems);
                              setItems(newItems);
                            }}
                          >
                            <ToggleGroupItem
                              disabled={index == 0}
                              value="chained"
                            >
                              <Link size={20} />
                            </ToggleGroupItem>
                            <ToggleGroupItem value="unchained">
                              <Unlink size={20} />
                              {/* <ArrowsUpFromLine
                                size={20}
                                className="rotate-90"
                              /> 
                            </ToggleGroupItem> 
                        </ToggleGroup> */}
                        </TooltipTrigger>
                        <TooltipContent className="w-[200px] bg-white">
                          <b>Chained Items:</b> These items start their
                          operation after the previous item has completed its
                          duration.
                          <br />
                          <b>Unchained Items:</b> These run concurrently with
                          the previous item, not waiting for the previous
                          operations to complete.
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
                          onChange={(e: React.FormEvent<HTMLInputElement>) => {
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
      <ComponentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCancel={cancelCallback}
        componentId={currentComponentId}
        initialData={initalData}
        type={currentComponentType}
      />
    </div>
  );
};

//component that takes a progress, currentProgress and triggers the animation over a certain amount of time as a prop
const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <div
      //   className="transition-[width] duration-300"
      style={{
        // width: '100%',
        animation: `slide ${progress}s linear`,
        height: '100%',
        backgroundColor: 'green',
      }}
    ></div>
  );
};

function renderByType(component: MultiOption) {
  let content;
  switch (component?.type) {
    case 'flyto':
      content = (
        <FlyToGUIComponent
          component={component as FlyToComponent}
          shouldRender={false}
        />
      );
      break;
    case 'fade':
      content = (
        <FadeGUIComponent
          component={component as FadeComponent}
          shouldRender={false}
        />
      );
      break;
    case 'setfocus':
      content = (
        <FocusComponent
          component={component as SetFocusComponent}
          shouldRender={false}
        />
      );
      break;
    case 'boolean':
      content = (
        <BoolGUIComponent
          component={component as BooleanComponent}
          shouldRender={false}
        />
      );
      break;
    case 'trigger':
      content = (
        <TriggerGUIComponent
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
// have a mini gui item for each component - shows relevant state and Property/gui name
// have that item appear and disappear based on the delay
// have status bar representing total amount of delay as it oges through the sequence

// MultiGUIComponent
const MultiGUIComponent: React.FC<MultiGUIComponentProps> = ({ component }) => {
  // const items = component.components;
  const getComponentById = useComponentStore((state) => state.getComponentById);

  const finalDelay = useMemo(() => {
    return (
      getComponentById(
        component.components[component.components.length - 1]?.component,
      )?.intDuration || 0
    );
  }, [component.components]);

  console.log(component.components);
  const totalDelay = useMemo(() => {
    return (
      component.components
        .map((v) => v.totalOffset)
        .reduce((acc, item) => acc + item, 0) + finalDelay
    );
  }, [component.components, finalDelay]);

  const [currentItem, setCurrentItem] = useState('');
  const [trigger, setTrigger] = useState(false);

  const triggerComponents = useCallback(async () => {
    //trigger the start of status until total delay
    setTrigger(true);
    for (const item of component.components) {
      await new Promise((resolve) =>
        setTimeout(() => {
          console.log(
            `Triggering ${(getComponentById(item.component) as MultiOption)
              ?.gui_name} after ${item.delay}`,
          );
          setCurrentItem(
            (getComponentById(item.component) as MultiOption)?.gui_name || '',
          );
          (getComponentById(item.component) as MultiOption).triggerAction?.();
          //if last item, set trigger to false
          if (item === component.components[component.components.length - 1]) {
            setTimeout(() => {
              setTrigger(false);
              setCurrentItem('');
              resolve('done');
            }, finalDelay * 1000);
          } else {
            resolve('done');
          }

          //
        }, item.delay * 1000),
      );
    }
  }, [component.components, finalDelay]);

  return (
    <div className="w-full">
      <div className="flex flex-col items-center justify-center gap-2">
        <Button onClick={triggerComponents}>Trigger Components</Button>
        CurrentItem: {currentItem}
      </div>
      <div className="h-4 border-2 border-black">
        {trigger && <ProgressBar progress={totalDelay} />}
      </div>
      {component?.components.map((v, _i) => {
        return renderByType(getComponentById(v.component) as MultiOption);
      })}
    </div>
  );
};

export { MultiModal, MultiGUIComponent };
