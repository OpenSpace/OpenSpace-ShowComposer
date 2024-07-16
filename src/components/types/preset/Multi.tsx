import { useCallback, useEffect, useMemo, useState } from 'react';

import ComponentModal from '@/components/ComponentModal';
import SelectableDropdown from '@/components/common/SelectableDropdown';
import ControlledInput from '@/components/inputs/ControlledInput';
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

// // Define the type for list items
// set up chained v paralell data handling
interface MultiType {
  component: MultiOption['id'];
  delay: number;
  //   buffer?: number;
  //   chain: boolean;
  id: string;
}
interface MultiModalProps {
  component: MultiComponent | null;
  handleComponentData: (data: Partial<MultiComponent>) => void;
  isOpen: boolean;
}
// MultiModal Component
const MultiModal: React.FC<MultiModalProps> = ({
  component,
  handleComponentData,
  isOpen,
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

  const handleAddComponent = (type: ComponentType) => {
    const newId = uuidv4();
    setCurrentComponentType(type);
    setCurrentComponentId(newId);
    addItem(newId);
    setIsModalOpen(true);
  };
  // make copy of multiotions and remove items as tehy are added to items
  useEffect(() => {
    setAvailableOptions(
      multiOptions.filter(
        (component) => !items.some((item) => item.id === component),
      ),
    );
    handleComponentData({
      components: items.map((v) => ({
        component: v.component,
        delay: v.delay,
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

  function getPreviousDuration() {
    //get last item of items
    const lastItem = items[items.length - 1];
    if (lastItem) {
      return 1000 * (getComponentById(lastItem.component)?.intDuration || 0);
    }
  }
  // Add a new item to the list (simplified for demonstration)
  const addItem = (component: MultiOption['id']) => {
    const newItem: MultiType = {
      id: component,
      component: component, // Placeholder component
      delay: getPreviousDuration() || 1000, // Default delay of 1 second
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
    <div>
      {/* <button onClick={addItem}>Add Component</button> */}
      <SelectableDropdown
        options={availableOptions.map((component) => ({
          value: component,
          label: getComponentById(component)?.gui_name,
        }))}
        selected={''}
        setSelected={(id: string) => addItem(id)}
      />
      <SelectableDropdown
        options={MultiOptions}
        selected={''}
        setSelected={(type: string) =>
          handleAddComponent(type as ComponentType)
        }
      />
      {/* {availableOptions.map((component, index) => (
        <button key={index} onClick={() => addItem(component)}>
          Add {getComponentById(component).type}
        </button>
      ))} */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
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
                      {item.id} {getComponentById(item.id)?.gui_name}
                      {/* {item.component} */}
                      {/* Display and allow editing of delay here */}
                      <Button onClick={() => removeItem(item.id)}>
                        Remove
                      </Button>
                      <Button
                        onClick={() => {
                          // Open the modal with the component's data
                          // set currentComponentId and currentComponentType
                          // to the current component's id and type
                          // respectively
                          setCurrentComponentId(item.id);
                          setCurrentComponentType(
                            getComponentById(item.id)?.type,
                          );
                          setIsModalOpen(true);
                        }}
                      >
                        Edit Component
                      </Button>
                      <ControlledInput
                        className="w-auto !flex-row justify-between gap-2"
                        label="Delay"
                        type="number"
                        value={item.delay}
                        onChange={(value: number | string) => {
                          const newItems = Array.from(items);
                          newItems[index].delay =
                            parseInt(value as string) || (value as number);
                          setItems(newItems);
                        }}
                        placeholder={''}
                      />
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
        componentId={currentComponentId}
        initialData={{
          isMulti: 'pendingSave',
        }}
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

  const totalDelay = useMemo(() => {
    return (
      component.components
        .map((v) => v.delay)
        .reduce((acc, item) => acc + item / 1000, 0) + finalDelay
    );
  }, [component.components, finalDelay]);

  console.log(finalDelay, totalDelay);

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
        }, item.delay),
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
