// DraggableComponent.tsx
import React, { useState } from 'react';
import { DraggableData, DraggableEvent } from 'react-draggable';
import { Rnd } from 'react-rnd';
import { Copy, Edit2, GripHorizontal, Trash2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Component, useSettingsStore } from '@/store';
// import { useShallow } from 'zustand/react/shallow';
import { useBoundStore } from '@/store/boundStore';
import { getCopy } from '@/utils/copyHelpers';
import { roundToNearest } from '@/utils/math';

import { ComponentContent } from './ComponentContent';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import DropdownMenuComponent from './DropdownMenu';

interface DraggableComponentProps {
  component: Component;
  layoutId?: string;
  onEdit: () => void;
  onCopy?: () => void;
  onDelete: () => void;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({
  component,
  layoutId,
  onEdit,
  onCopy = () => {},
  onDelete
}) => {
  const position = useBoundStore((state) => state.positions[component?.id || '']);

  const updatePosition = useBoundStore((state) => state.updatePosition);

  const tempPosition = useBoundStore((state) => state.tempPositions[component.id]);
  const handleComponentDrop = useBoundStore((state) => state.handleComponentDrop);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const isDragging = useBoundStore((state) => state.positions[component.id]?.isDragging);

  // const isOnPage = useBoundStore(
  //   useShallow((state) => {
  //     return state
  //       .getPageById(state.currentPage)
  //       ?.components.includes(component.id);
  //   }),
  // );

  const isPresentMode = useSettingsStore((state) => state.presentMode);
  const scale = useSettingsStore((state) => state.pageScaleThrottled);
  const selectedComponents = useBoundStore((state) => state.selectedComponents);
  const isSelected = useBoundStore((state) => state.positions[component.id]?.selected);
  if (!component || !component.id || !position) {
    return null;
  }
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

  const handleDragStop = (_e: DraggableEvent, d: DraggableData) => {
    let newDropPos = { x: d.x, y: d.y };
    if (layoutId) {
      const parentPos = useBoundStore.getState().positions[layoutId];
      newDropPos = {
        x: d.x + parentPos.x,
        y: d.y + parentPos.y
      };
    }
    handleComponentDrop(component.id, newDropPos.x, newDropPos.y);
    updatePosition(component.id, {
      isDragging: false
    });
  };

  const isMultiLoading = component.isMulti?.includes('pending');
  const isHidden = component.isMulti?.includes('true');
  const hideOnPresent = component.isDisabled && isPresentMode;
  const getComponentPosition = () => {
    return (
      tempPosition || {
        x: position.x,
        y: position.y
      }
    );
  };

  return (
    <>
      <Rnd
        dragHandleClassName={isSelected ? '' : 'drag-handle'}
        scale={isPresentMode ? 1.0 : scale}
        default={{
          x: position.x,
          y: position.y,
          width: position.width || position.minWidth,
          height: position.height || position.minHeight
        }}
        position={getComponentPosition()}
        size={{
          width: position.width,
          height: position.height
        }}
        minWidth={position.minWidth || 100}
        minHeight={position.minHeight || 100}
        // dragGrid={[25, 25]}
        resizeGrid={[25, 25]}
        onDragStart={(e: DraggableEvent) => {
          e.stopPropagation();
          updatePosition(component.id, {
            isDragging: true
          });
          // setIsDragging(true);
        }}
        onDrag={(_e: DraggableEvent, d: DraggableData) => {
          if (selectedComponents.includes(component.id)) {
            const deltaX = d.x - position.x;
            const deltaY = d.y - position.y;
            selectedComponents.forEach((id) => {
              const pos = useBoundStore.getState().positions[id];
              if (pos) {
                updatePosition(id, {
                  x: pos.x + deltaX,
                  y: pos.y + deltaY
                });
              }
            });
          } else {
            // updatePosition(component.id, {
            //   isDragging: true,
            //   x: d.x,
            //   y: d.y,
            // });
          }
        }}
        onDragStop={handleDragStop}
        onResizeStop={(_e, _direction, ref, _delta, position) => {
          if (layoutId) return;
          updatePosition(component.id, {
            width: roundToNearest(parseInt(ref.style.width), 25),
            height: roundToNearest(parseInt(ref.style.height), 25),
            x: roundToNearest(position.x, 25),
            y: roundToNearest(position.y, 25)
          });
        }}
        disableDragging={isPresentMode}
        enableResizing={!isPresentMode}
        className={cn(
          'pointer-events-auto absolute cursor-move rounded-lg ',
          isHidden && '!hidden',
          hideOnPresent && '!hidden',
          isPresentMode ? '' : 'border-0 bg-gray-300 bg-opacity-25',
          (isDragging || isSelected) &&
            !isPresentMode &&
            'z-[999] border-blue-500 shadow-lg shadow-blue-500/50 dark:shadow-slate-100/50',
          isMultiLoading ? 'opacity-25' : 'opacity-100'
          // layoutId && 'border border-blue-200  dark:border-blue-800',
        )}
        style={{
          transition: !isDragging && layoutId ? 'transform 0.3s ease-in-out' : 'none'
        }}
      >
        {!isPresentMode && (
          <div
            className={cn(
              'drag-handle transition-color group absolute top-0 z-[99] flex w-full cursor-move justify-end rounded-t-lg bg-slate-500/0 duration-300 hover:bg-slate-900/0',
              isSelected ? 'h-full' : 'h-[20px]',
              layoutId && 'bg-blue-500/10'
            )}
          >
            <div
              className={
                'absolute flex w-full flex-col items-center justify-center gap-1'
              }
            >
              <GripHorizontal
                className={`stroke-slate-500 transition-colors duration-300 group-hover:stroke-white`}
              />
            </div>
            <div className={'relative z-[99] flex items-start justify-end gap-2 p-2'}>
              <DropdownMenuComponent
                items={[
                  <div
                    key={'edit'}
                    className={
                      'flex w-full cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                    }
                    onClick={onEdit}
                  >
                    <span>{getCopy('DraggableComponent', 'edit')}</span>
                    <Edit2 className={'h-4 w-4'} />
                  </div>,
                  <div
                    key={'edit'}
                    className={
                      'flex w-full cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                    }
                    onClick={onCopy}
                  >
                    <span>{getCopy('DraggableComponent', 'copy')}</span>
                    <Copy className={'h-4 w-4'} />
                  </div>,
                  <div
                    key={'delete'}
                    className={
                      'flex w-full cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm text-red-600 hover:bg-slate-100 hover:text-red-900 dark:text-red-400 dark:hover:bg-slate-800 dark:hover:text-red-100'
                    }
                    onClick={handleDeleteClick}
                  >
                    <span>{getCopy('DraggableComponent', 'delete')}</span>
                    <Trash2 className={'h-4 w-4'} />
                  </div>
                ]}
              />
            </div>
          </div>
        )}
        <div
          className={cn(
            'relative top-0 z-0 flex h-full flex-col items-center justify-center rounded-lg p-4 py-2',
            layoutId && 'p-2',
            component.isDisabled && 'pointer-events-none opacity-25'
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
