import React from 'react';
import { Rnd } from 'react-rnd';
import { DraggableEvent, DraggableData } from 'react-draggable';
import { useComponentStore, usePositionStore, useSettingsStore } from '@/store';
import { cn } from '@/lib/utils';
import { roundToNearest } from '@/utils/math';
import { Edit2, GripHorizontal, Trash2, LayoutGrid } from 'lucide-react';
// import { createIcon } from 'lucide-react';

import { LayoutBase } from '@/store/componentsStore';
import Placeholder from './Placeholder';
import DropdownMenuComponent from '../DropdownMenu';
import { getCopy } from '@/utils/copyHelpers';
import { ColumnIcon, RowIcon } from './LayoutToolbar';

interface LayoutContainerProps {
  layout: LayoutBase;
  children?: React.ReactNode;
}

const typeIcons = {
  row: <RowIcon className="h-4 w-4" />, // Replace IconType1 with the actual icon for 'row'
  column: <ColumnIcon className="h-4 w-4" />, // Replace IconType2 with the actual icon for 'column'
  grid: <LayoutGrid className="h-6 w-6" />, // Replace IconType3 with the actual icon for 'grid'
};

export const LayoutContainer: React.FC<LayoutContainerProps> = ({
  layout,
  children,
}) => {
  const layoutPosition = usePositionStore(
    (state) => state.positions[layout?.id || ''],
  );
  if (!layout || !layout.id || !layoutPosition) {
    return null;
  }

  const { x, y, width, height } = layoutPosition;
  const {
    id,
    type,
    children: layoutChildren,
    childWidth,
    childHeight,
    columns,
    padding,
  } = layout;
  const deleteLayout = useComponentStore((state) => state.deleteLayout);
  const updateLayout = useComponentStore((state) => state.updateLayout);
  const updatePosition = usePositionStore((state) => state.updatePosition);
  const isPresentMode = useSettingsStore((state) => state.presentMode);
  const scale = useSettingsStore((state) => state.pageScaleThrottled);
  const handleDragStop = (_e: DraggableEvent, d: DraggableData) => {
    updatePosition(id, {
      x: roundToNearest(d.x, 25 / 2),
      y: roundToNearest(d.y, 25 / 2),
    });
  };

  const handleResize = (
    _e: any,
    _direction: any,
    ref: HTMLElement,
    _delta: any,
    position: { x: number; y: number },
  ) => {
    let newWidth = roundToNearest(parseInt(ref.style.width), 25 / 2);
    let newHeight = roundToNearest(parseInt(ref.style.height), 25 / 2);
    let childWidth = layout.childWidth;
    let childHeight = layout.childHeight;
    if (type === 'row') {
      newWidth = newHeight * (layoutChildren.length + 1);
      childWidth = newHeight - layout.padding * 2;
      childHeight = newHeight - layout.padding * 2;
      // childWidth = newWidth;
    } else if (type === 'column') {
      newHeight = newWidth * (layoutChildren.length + 1);
      childWidth = newWidth - layout.padding * 2;
      childHeight = newWidth - layout.padding * 2;
    } else if (type === 'grid') {
      // Calculate based on grid rows and columns
      const numRows = Math.ceil(layoutChildren.length / columns);
      childWidth = (newWidth - layout.padding) / columns - layout.padding;
      childHeight = (newHeight - layout.padding) / numRows - layout.padding;
    }
    //update new childWidth and Height

    updatePosition(id, {
      width: newWidth,
      height: newHeight,
      x: roundToNearest(position.x, 25 / 2),
      y: roundToNearest(position.y, 25 / 2),
    });
    updateLayout(id, {
      childWidth: childWidth,
      childHeight: childHeight,
    });
  };

  // const layoutClasses = {
  //   row: 'flex flex-row items-center',
  //   column: 'flex flex-col items-center',
  //   grid: 'grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))]',
  // };

  return (
    <Rnd
      default={{
        x,
        y,
        width,
        height,
      }}
      position={{ x, y }}
      dragHandleClassName={'drag-handle'}
      size={{ width, height }}
      minWidth={100}
      minHeight={100}
      scale={isPresentMode ? 1.0 : scale}
      onDragStop={handleDragStop}
      onResizeStop={handleResize}
      bounds="parent"
      enableResizing={true}
      className={cn(
        'items-center',
        'pointer-events-auto',
        isPresentMode ? '' : 'rounded-lg outline-dashed outline-2',
        'transition-colors duration-200',
        isPresentMode ? '' : 'outline-gray-300 dark:outline-gray-600',
        'hover:outline-blue-500 dark:hover:outline-blue-400',
        isPresentMode ? '' : 'bg-white/50 dark:bg-slate-950/50',
        'z-[9999]', // Ensure it's above other components
      )}
    >
      {!isPresentMode && (
        <div
          className={cn(
            'drag-handle transition-color group absolute top-0 z-[99] flex w-full cursor-move justify-end rounded-t-lg bg-slate-500/0 duration-300 hover:bg-slate-900/0',
          )}
        >
          <div className="absolute flex w-full flex-col items-center justify-center gap-1">
            <GripHorizontal
              className={`stroke-slate-500 transition-colors duration-300 group-hover:stroke-white`}
            />
          </div>
          <div className="relative z-[99] flex items-start justify-end gap-2 px-2 py-1">
            <DropdownMenuComponent
              items={[
                <div
                  key="edit"
                  className="flex w-full cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                  // onClick={onEdit}
                >
                  <span>{getCopy('DraggableComponent', 'edit')}</span>
                  <Edit2 className="h-4 w-4" />
                </div>,
                <div
                  key="delete"
                  className="flex w-full cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm text-red-600 hover:bg-slate-100 hover:text-red-900 dark:text-red-400 dark:hover:bg-slate-800 dark:hover:text-red-100"
                  onClick={() => deleteLayout(id)}
                >
                  <span>{getCopy('DraggableComponent', 'delete')}</span>
                  <Trash2 className="h-4 w-4" />
                </div>,
              ]}
            />
          </div>
          <div className="absolute left-2 top-1 text-xs text-white">
            {typeIcons[type]}
          </div>
        </div>
      )}
      <div
        className={cn(
          'h-full w-full ',
          'cursor-move', // Add cursor indicator
        )}
      >
        {children}
        {!isPresentMode && layout.type !== 'grid' && (
          <Placeholder
            type={type}
            childWidth={childWidth}
            childHeight={childHeight}
            padding={layout.padding}
            columns={layout.columns}
          />
        )}
        {!isPresentMode &&
          layout.type === 'grid' &&
          layout.children.map((_childId, index) => {
            return (
              <Placeholder
                type={type}
                hidden={_childId != null}
                index={index}
                childWidth={childWidth}
                childHeight={childHeight}
                padding={padding}
                columns={columns}
                key={index}
              />
            );
          })}
      </div>
    </Rnd>
  );
};
