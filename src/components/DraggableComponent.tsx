// DraggableComponent.tsx
import React, { useState } from 'react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { Rnd } from 'react-rnd';
import {
  useComponentStore,
  Component,
  TitleComponent,
  useSettingsStore,
} from '@/store';
import { roundToNearest } from '@/utils/math';
import { TitleGUIComponent } from './types/static/Title';
import DropdownMenuComponent from './DropdownMenu';

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
    // case 'image':
    //   content = <ImageComponent component={component} />;
    //   break;
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
          checkOverlap({
            ...component,
            x: d.x,
            y: d.y,
          });
        }}
        onDragStop={handleDragStop}
        //   (_e, d) => {
        //   setIsDragging(false);

        //   updateComponent(component.id, {
        //     x: roundToNearest(d.x, 25),
        //     y: roundToNearest(d.y, 25),
        //   });
        //   const overlappingComponent = checkOverlap({
        //     ...component,
        //     x: d.x,
        //     y: d.y,
        //   });
        //   if (overlappingComponent) {
        //     alert(
        //       `Component "${component.id}" is overlapping with "${overlappingComponent.id}"`,
        //     );
        //   }
        // }}
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
          ${isPresentMode ? 'border-0 bg-opacity-0' : 'border bg-gray-50 '}
          absolute mb-2 cursor-move rounded  p-2 ${
            isDragging || isSelected ? 'z-50 border-blue-500 shadow-lg ' : ''
          } ${isOverlapped ? 'border-red-500 bg-red-200' : 'bg-gray-50'}
          `}
      >
        <div className="flex h-full w-full flex-col items-center justify-end">
          {content}
          {!isPresentMode && (
            <DropdownMenuComponent
              items={[
                { name: 'Edit', action: onEdit },
                { name: 'Delete', action: handleDeleteClick },
              ]}
            />
          )}
          {!isPresentMode && (
            <p className="text-xs">
              ID: <span className="text-xs font-bold">{component.id}</span>
            </p>
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
