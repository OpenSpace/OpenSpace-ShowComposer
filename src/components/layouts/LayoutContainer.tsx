import React from 'react';
import { DraggableData,DraggableEvent } from 'react-draggable';
import { Rnd } from 'react-rnd';
import {
  Copy,
  Edit2,
  GripHorizontal,
  LayoutGrid,
  Pin,
  PinOff,
  Trash2} from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';

import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store';
import { useBoundStore } from '@/store/boundStore';
// import { createIcon } from 'lucide-react';
import { LayoutBase } from '@/store/ComponentTypes';
import { getCopy } from '@/utils/copyHelpers';
import { roundToNearest } from '@/utils/math';

import DropdownMenuComponent from '../DropdownMenu';

import { ColumnIcon, RowIcon } from './LayoutToolbar';
import Placeholder from './Placeholder';

interface LayoutContainerProps {
  layout: LayoutBase;
  children?: React.ReactNode;
  handleOpenEditModal: () => void;
}

const typeIcons = {
  row: <RowIcon className={"h-4 w-4"} />, // Replace IconType1 with the actual icon for 'row'
  column: <ColumnIcon className={"h-4 w-4"} />, // Replace IconType2 with the actual icon for 'column'
  grid: <LayoutGrid className={"h-6 w-6"} /> // Replace IconType3 with the actual icon for 'grid'
};

export const LayoutContainer: React.FC<LayoutContainerProps> = ({
  layout,
  children,
  handleOpenEditModal
}) => {
  const layoutPosition = useBoundStore((state) => state.positions[layout?.id || '']);

  const handleLayoutDrop = useBoundStore((state) => state.handleLayoutDrop);

  const { x, y, width, height } = layoutPosition || {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  };
  const {
    id,
    type,
    children: layoutChildren,
    childWidth,
    childHeight,
    columns,
    padding
  } = layout;

  const updatePosition = useBoundStore((state) => state.updatePosition);
  const updateLayout = useBoundStore((state) => state.updateLayout);
  const deleteLayout = useBoundStore((state) => state.deleteLayout);
  const copyLayout = useBoundStore((state) => state.copyLayout);

  const isPresentMode = useSettingsStore((state) => state.presentMode);
  const scale = useSettingsStore((state) => state.pageScaleThrottled);
  const isOnPage = useBoundStore(
    useShallow((state) => {
      return state.getPageById(state.currentPage)?.components.includes(id);
    })
  );
  if (!layout || !layout.id || !layoutPosition) {
    return null;
  }

  const handleDragStop = (_e: DraggableEvent, d: DraggableData) => {
    handleLayoutDrop(id, d.x, d.y);
  };

  const handlePin = () => {
    updateLayout(id, {
      persistent: !layout.persistent
    });
  };
  const handleResize = (
    _e: any,
    _direction: any,
    ref: HTMLElement,
    _delta: any,
    position: { x: number; y: number }
  ) => {
    let newWidth = roundToNearest(parseInt(ref.style.width), 25);
    let newHeight = roundToNearest(parseInt(ref.style.height), 25);
    let {childWidth} = layout;
    let {childHeight} = layout;
    if (type === 'row') {
      newWidth =
        newHeight * (layoutChildren.length + 1) - layoutChildren.length * layout.padding;
      childWidth = newHeight - layout.padding * 2;
      childHeight = newHeight - layout.padding * 2;
      // childWidth = newWidth;
    } else if (type === 'column') {
      newHeight =
        newWidth * (layoutChildren.length + 1) - layoutChildren.length * layout.padding;
      childWidth = newWidth - layout.padding * 2;
      childHeight = newWidth - layout.padding * 2;
    } else if (type === 'grid') {
      // Calculate based on grid rows and columns
      const numRows = Math.ceil(layoutChildren.length / columns);
      childWidth = (newWidth - layout.padding) / columns - layout.padding;
      childHeight = (newHeight - layout.padding) / numRows - layout.padding;
    }

    updateLayout(id, {
      childWidth: childWidth,
      childHeight: childHeight
    });
    updatePosition(id, {
      width: newWidth,
      height: newHeight,
      x: roundToNearest(position.x, 25),
      y: roundToNearest(position.y, 25)
    });
  };

  const isGrid = type === 'grid';

  return (
    <>
      <Rnd
        default={{
          x,
          y,
          width,
          height
        }}
        position={{ x, y }}
        dragHandleClassName={'drag-handle'}
        size={{ width, height }}
        minWidth={100}
        minHeight={100}
        scale={isPresentMode ? 1.0 : scale}
        onDragStop={handleDragStop}
        onResizeStop={handleResize}
        bounds={"parent"}
        enableResizing={!isPresentMode}
        disableDragging={isPresentMode}
        className={cn(
          'items-center',
          isOnPage
            ? 'outline outline-offset-4 outline-blue-500'
            : 'outline outline-offset-4 outline-red-500',
          isPresentMode
            ? '!outline-none'
            : 'pointer-events-auto rounded-lg outline-dashed outline-2 outline-gray-300 dark:outline-gray-600',
          'transition-colors duration-200',
          'hover:outline-blue-500 dark:hover:outline-blue-400',
          isPresentMode ? '' : 'bg-white/50 dark:bg-slate-950/50',
          'z-[9999]'
        )}
      >
        {!isPresentMode && (
          <div
            className={cn(
              'drag-handle transition-color group absolute top-0 z-[99] flex w-full cursor-move justify-end rounded-t-lg bg-slate-500/0 duration-300 hover:bg-slate-900/0'
            )}
          >
            <div className={"absolute flex w-full flex-col items-center justify-center gap-1"}>
              <GripHorizontal
                className={`stroke-slate-500 transition-colors duration-300 group-hover:stroke-white`}
              />
            </div>
            <div className={"relative z-[99] flex items-start justify-end gap-2 px-2 py-1"}>
              {layout.persistent ? (
                <Pin
                  className={"h-4 w-4"}
                  onClick={handlePin}
                  fill={"white"}
                  stroke={"white"}
                />
              ) : (
                <PinOff
                  className={"h-4 w-4"}
                  onClick={handlePin}
                  fill={"currentColor"}
                  stroke={"currentColor"}
                />
              )}
              <DropdownMenuComponent
                items={[
                  <div
                    key={"edit"}
                    className={"flex w-full cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"}
                    onClick={handleOpenEditModal}
                  >
                    <span>{getCopy('DraggableComponent', 'edit')}</span>
                    <Edit2 className={"h-4 w-4"} />
                  </div>,
                  <div
                    key={"copy"}
                    className={"flex w-full cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"}
                    onClick={() => copyLayout(id)}
                  >
                    <span>{getCopy('DraggableComponent', 'copy')}</span>
                    <Copy className={"h-4 w-4"} />
                  </div>,
                  <div
                    key={"delete"}
                    className={"flex w-full cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm text-red-600 hover:bg-slate-100 hover:text-red-900 dark:text-red-400 dark:hover:bg-slate-800 dark:hover:text-red-100"}
                    onClick={() => deleteLayout(id)}
                  >
                    <span>{getCopy('DraggableComponent', 'delete')}</span>
                    <Trash2 className={"h-4 w-4"} />
                  </div>
                ]}
              />
            </div>
            <div className={"absolute left-2 top-1 text-xs text-white"}>
              {typeIcons[type]}
            </div>
          </div>
        )}
        <div
          className={cn(
            'h-full w-full ',
            'cursor-move' // Add cursor indicator
          )}
        >
          {children}
          {!isPresentMode && !isGrid && (
            <Placeholder
              type={type}
              childWidth={childWidth}
              childHeight={childHeight}
              padding={layout.padding}
              columns={layout.columns}
            />
          )}
          {!isPresentMode &&
            isGrid &&
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
    </>
  );
};
