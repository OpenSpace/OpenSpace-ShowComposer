// DraggableComponent.tsx
import React, { useState } from 'react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { Rnd } from 'react-rnd';
import {
  useComponentStore,
  Component,
  TitleComponent,
  useSettingsStore,
  SetTimeComponent as SetTimeType,
} from '@/store';
import { roundToNearest } from '@/utils/math';
import { TitleGUIComponent } from './types/static/Title';
import DropdownMenuComponent from './DropdownMenu';
import TimeDatePicker from './types/static/TimeDatePicker';
import { SetTimeComponent } from './types/preset/SetTime';
import FlightControlPanel from './types/static/FlightControlPanel';
// import SimulationIncrement from './timepicker/SimulationIncrement';

interface DraggableComponentProps {
  component: Component;
  onEdit: () => void;
  onDelete: () => void;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({
  component,
  onEdit,
  onDelete,
}) => {
  // const [] = useOpenSpaceApi;

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const isPresentMode = useSettingsStore((state) => state.presentMode); // Get the global state

  const updateComponent = useComponentStore((state) => state.updateComponent);
  const checkOverlap = useComponentStore((state) => state.checkOverlap);
  const overlappedComponents = useComponentStore(
    (state) => state.overlappedComponents,
  );
  const selectedComponents = useComponentStore(
    (state) => state.selectedComponents,
  );
  const selectComponent = useComponentStore((state) => state.selectComponent);
  const deselectComponent = useComponentStore(
    (state) => state.deselectComponent,
  );
  const components = useComponentStore((state) => state.components);

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    onDelete();
    setIsDeleteModalOpen(false);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
  };

  const handleDragStop = (e: any, d: any) => {
    setIsDragging(false);
    if (selectedComponents.includes(component.id)) {
      const deltaX = d.x - component.x;
      const deltaY = d.y - component.y;
      selectedComponents.forEach((id) => {
        const comp = components.find((c) => c.id === id);
        if (comp) {
          updateComponent(id, {
            x: roundToNearest(comp.x + deltaX, 25),
            y: roundToNearest(comp.y + deltaY, 25),
          });
        }
      });
    } else {
      updateComponent(component.id, {
        x: roundToNearest(d.x, 25),
        y: roundToNearest(d.y, 25),
      });
    }
    checkOverlap({ ...component, x: d.x, y: d.y });
  };

  const handleClick = (e: React.MouseEvent) => {
    // if (isDragging) return;
    if (e.shiftKey) {
      if (selectedComponents.includes(component.id)) {
        deselectComponent(component.id);
      } else {
        selectComponent(component.id);
      }
    }
    // else {
    //   selectComponent(component.id);
    // }
  };

  let content;
  switch (component.type) {
    case 'title':
      content = <TitleGUIComponent component={component as TitleComponent} />;
      break;
    case 'timepanel':
      content = <TimeDatePicker />;
      // content = <SimulationIncrement />;
      // content = <div>Unknown component type</div>;

      break;
    case 'settime':
      content = <SetTimeComponent component={component as SetTimeType} />;
      break;
    // case 'video':
    //   content = <VideoComponent component={component} />;
    //   break;
    case 'navpanel':
      content = <FlightControlPanel />;
      break;
    // case 'video':
    //   content = <VideoComponent component={component} />;
    //   break;
    default:
      content = <div>Unknown component type</div>;
  }
  const isOverlapped = overlappedComponents[component.id]?.length > 0;
  const isSelected = selectedComponents.includes(component.id);

  return (
    <>
      <Rnd
        dragHandleClassName={isSelected ? '' : 'drag-handle'}
        default={{
          x: component.x,
          y: component.y,
          width: component.width,
          height: component.height,
        }}
        position={{ x: component.x, y: component.y }}
        onDragStart={() => {
          setIsDragging(true);
        }}
        onDrag={(_e, d) => {
          if (selectedComponents.includes(component.id)) {
            const deltaX = d.x - component.x;
            const deltaY = d.y - component.y;
            selectedComponents.forEach((id) => {
              const comp = components.find((c) => c.id === id);
              if (comp) {
                updateComponent(id, { x: comp.x + deltaX, y: comp.y + deltaY });
              }
            });
          }
          // checkOverlap({
          //   ...component,
          //   x: d.x,
          //   y: d.y,
          // });
        }}
        onDragStop={handleDragStop}
        onResizeStop={(_e, _direction, ref, _delta, position) => {
          updateComponent(component.id, {
            width: parseInt(ref.style.width),
            height: parseInt(ref.style.height),
            x: position.x,
            y: position.y,
          });
          checkOverlap({ ...component, x: position.x, y: position.y });
        }}
        disableDragging={isPresentMode} // Conditionally disable dragging
        enableResizing={!isPresentMode ? undefined : false} // Conditionally disable resizing
        resizeGrid={[25, 25]}
        minHeight={100}
        minWidth={100}
        // bounds="parent"
        onClick={handleClick}
        className={`
          ${
            isPresentMode
              ? 'border-0 bg-opacity-0'
              : 'border bg-gray-300 bg-opacity-70'
          }
          absolute cursor-move rounded${
            isDragging || isSelected ? 'z-50 border-blue-500 shadow-lg ' : ''
          } ${
            isOverlapped ? 'border-red-500 bg-red-200' : ''
          } transition-colors duration-300
          `}
      >
        {!isPresentMode && (
          <div className="drag-handle group absolute z-[99] flex h-[30px] w-full cursor-move items-center justify-end bg-gray-400 px-4 ">
            <div className="absolute flex w-full flex-col items-center gap-1">
              <div className="flex gap-2">
                {[...Array(3)].map((_, index) => (
                  <span
                    className={`bg-gray-500 transition-colors duration-300 group-hover:bg-white ${
                      isSelected ? 'bg-white' : ''
                    } `}
                    key={index}
                    style={{
                      height: '4px',
                      width: '4px',
                      borderRadius: '50%',

                      // background: '#333',
                    }}
                  ></span>
                ))}
              </div>
              <div className="flex gap-2">
                {[...Array(3)].map((_, index) => (
                  <span
                    key={index}
                    className={`bg-gray-500 transition-colors duration-300 group-hover:bg-white ${
                      isSelected ? 'bg-white' : ''
                    } `}
                    style={{
                      height: '4px',
                      width: '4px',
                      borderRadius: '50%',
                      // background: '#333',
                    }}
                  ></span>
                ))}
              </div>
            </div>
            <DropdownMenuComponent
              className="grow-0"
              items={[
                { name: 'Edit', action: onEdit },
                { name: 'Delete', action: handleDeleteClick },
              ]}
            />
          </div>
        )}
        <div className="relative top-0 z-0 flex h-full flex-col items-center justify-center p-4">
          {content}

          {!isPresentMode && (
            <div className="absolute bottom-0 left-0 w-full p-2 text-xs">
              <p>
                ID: <span className="text-xs font-bold">{component.id}</span>
              </p>
            </div>
          )}
        </div>
      </Rnd>
      <div
        className="relative left-0 top-0 h-full w-full"
        style={{ pointerEvents: isDeleteModalOpen ? 'all' : 'none' }}
      >
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          message={`Are you sure you want to delete the component "${component.gui_name}"?`}
        />
      </div>
    </>
  );
};

export default DraggableComponent;
