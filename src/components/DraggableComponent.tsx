// DraggableComponent.tsx
import React, { useState } from 'react';
import { getCopy } from '@/utils/copyHelpers';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { Rnd } from 'react-rnd';
import { DraggableEvent, DraggableData } from 'react-draggable';
import { useComponentStore, Component, useSettingsStore } from '@/store';
import { roundToNearest } from '@/utils/math';
import DropdownMenuComponent from './DropdownMenu';
import { Edit2, GripHorizontal, Trash2 } from 'lucide-react';
import { ComponentContent } from './ComponentContent';
import { cn } from '@/lib/utils';
import { LayoutBase } from '@/store/componentsStore';

interface DraggableComponentProps {
  component: Component;
  layoutId?: string;
  onEdit: () => void;
  onDelete: () => void;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({
  component,
  layoutId,
  onEdit,
  onDelete,
}) => {
  if (!component || !component.id) {
    return null;
  }

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const tempPosition = useComponentStore(
    (state) => state.tempPositions[component.id],
  );
  const setTempPosition = useComponentStore((state) => state.setTempPosition);
  const isPresentMode = useSettingsStore((state) => state.presentMode);
  const scale = useSettingsStore((state) => state.pageScaleThrottled);
  const updateComponent = useComponentStore((state) => state.updateComponent);
  const getComponentById = useComponentStore((state) => state.getComponentById);
  const selectedComponents = useComponentStore(
    (state) => state.selectedComponents,
  );
  const selectComponent = useComponentStore((state) => state.selectComponent);
  const deselectComponent = useComponentStore(
    (state) => state.deselectComponent,
  );
  const removeComponentFromLayout = useComponentStore(
    (state) => state.removeComponentFromLayout,
  );

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    onDelete();
    setIsDeleteModalOpen(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (e.shiftKey) {
      if (selectedComponents.includes(component.id)) {
        deselectComponent(component.id);
      } else {
        selectComponent(component.id);
      }
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleDragStop = (_e: DraggableEvent, d: DraggableData) => {
    setIsDragging(false);

    // Check for overlap with layouts
    const layouts = useComponentStore.getState().layouts;
    let targetLayout: LayoutBase | null = null;

    // Helper function to check if a point is inside a layout
    const isInsideLayout = (x: number, y: number, layout: any) => {
      return (
        x >= layout.x &&
        x <= layout.x + layout.width &&
        y >= layout.y &&
        y <= layout.y + layout.height
      );
    };

    // Find layout we're dropping onto
    Object.entries(layouts).forEach(([_id, layout]) => {
      if (isInsideLayout(d.x, d.y, layout)) {
        targetLayout = layout;
      }
    });

    if (targetLayout && !layoutId) {
      // Add component to layout and let addComponentToLayout handle positioning
      useComponentStore
        .getState()
        .addComponentToLayout((targetLayout as LayoutBase).id, component.id);
      return; // Exit early to prevent the position update below
    } else if (layoutId) {
      // Remove from current layout if dragged outside
      if (!targetLayout || (targetLayout as LayoutBase).id !== layoutId) {
        removeComponentFromLayout(layoutId, component.id, d.x, d.y);
        // updateComponent(component.id, {
        //   x: roundToNearest(d.x , 25),
        //   y: roundToNearest(d.y, 25),
        // });
      }
    }

    // Only update positions if not being added to a layout
    if (layoutId) return;
    if (selectedComponents.includes(component.id)) {
      const deltaX = d.x - component.x;
      const deltaY = d.y - component.y;
      selectedComponents.forEach((id) => {
        const comp = getComponentById(id);
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
  };

  const isSelected = selectedComponents.includes(component.id);
  const isMultiLoading = component.isMulti?.includes('pending');
  const isHidden = component.isMulti?.includes('true');

  const getComponentPosition = () => {
    return (
      tempPosition || {
        x: component.x,
        y: component.y,
      }
    );
  };

  return (
    <>
      <Rnd
        dragHandleClassName={isSelected ? '' : 'drag-handle'}
        scale={isPresentMode ? 1.0 : scale}
        default={{
          x: component.x,
          y: component.y,
          width: component.width,
          height: component.height,
        }}
        position={getComponentPosition()}
        size={{
          width: component.width,
          height: component.height,
        }}
        minWidth={component.minWidth || 100}
        minHeight={component.minHeight || 100}
        // dragGrid={[25, 25]}
        resizeGrid={[25, 25]}
        onDragStart={(e: DraggableEvent) => {
          e.stopPropagation();
          setIsDragging(true);
        }}
        onDrag={(_e: DraggableEvent, d: DraggableData) => {
          if (layoutId) return;
          if (selectedComponents.includes(component.id)) {
            const deltaX = d.x - component.x;
            const deltaY = d.y - component.y;
            selectedComponents.forEach((id) => {
              const comp = getComponentById(id);
              if (comp) {
                setTempPosition(id, comp.x + deltaX, comp.y + deltaY);
              }
            });
          }
        }}
        onDragStop={handleDragStop}
        onResizeStop={(_e, _direction, ref, _delta, position) => {
          if (layoutId) return;
          updateComponent(component.id, {
            width: roundToNearest(parseInt(ref.style.width), 25),
            height: roundToNearest(parseInt(ref.style.height), 25),
            x: roundToNearest(position.x, 25),
            y: roundToNearest(position.y, 25),
          });
        }}
        disableDragging={isPresentMode}
        enableResizing={!isPresentMode}
        className={cn(
          'pointer-events-auto absolute cursor-move rounded-lg',
          isHidden && '!hidden',
          isPresentMode
            ? 'border-none bg-opacity-0'
            : 'border-0 bg-gray-300 bg-opacity-25',
          (isDragging || isSelected) &&
            !isPresentMode &&
            'z-50 border-blue-500 shadow-md dark:shadow-slate-500/50',
          isMultiLoading ? 'opacity-25' : 'opacity-100',
          layoutId && 'border border-blue-200 !bg-white dark:border-blue-800',
        )}
      >
        {!isPresentMode && (
          <div
            className={cn(
              'drag-handle transition-color group absolute top-0 z-[99] flex w-full cursor-move justify-end rounded-t-lg bg-slate-500/0 duration-300 hover:bg-slate-900/0',
              isSelected ? 'h-full' : 'h-[20px]',
              layoutId && 'bg-blue-500/10',
            )}
          >
            <div className="absolute flex w-full flex-col items-center justify-center gap-1">
              <GripHorizontal
                className={`stroke-slate-500 transition-colors duration-300 group-hover:stroke-white`}
              />
            </div>
            <div className="relative z-[99] flex items-start justify-end gap-2 p-2">
              <DropdownMenuComponent
                items={[
                  <div
                    key="edit"
                    className="flex w-full cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                    onClick={onEdit}
                  >
                    <span>{getCopy('DraggableComponent', 'edit')}</span>
                    <Edit2 className="h-4 w-4" />
                  </div>,
                  <div
                    key="delete"
                    className="flex w-full cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm text-red-600 hover:bg-slate-100 hover:text-red-900 dark:text-red-400 dark:hover:bg-slate-800 dark:hover:text-red-100"
                    onClick={handleDeleteClick}
                  >
                    <span>{getCopy('DraggableComponent', 'delete')}</span>
                    <Trash2 className="h-4 w-4" />
                  </div>,
                ]}
              />
            </div>
          </div>
        )}
        <div
          className={cn(
            'relative top-0 z-0 flex h-full flex-col items-center justify-center rounded-lg p-4 py-2',
            layoutId && 'p-2',
          )}
        >
          <ComponentContent component={component} />
        </div>
      </Rnd>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        message={`Are you sure you want to delete the component${
          component.gui_name ? ' ' + component.gui_name : ''
        }?`}
      />
    </>
  );
};

export default DraggableComponent;
