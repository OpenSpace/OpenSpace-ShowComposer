import React from 'react';
import { Rnd } from 'react-rnd';
import { DraggableEvent, DraggableData } from 'react-draggable';
import { useComponentStore, useSettingsStore } from '@/store';
import { cn } from '@/lib/utils';
import { roundToNearest } from '@/utils/math';
import { GripHorizontal } from 'lucide-react';
import { LayoutBase } from '@/store/componentsStore';

interface LayoutContainerProps {
  layout: LayoutBase;
  //   id: string;
  //   type: LayoutType;
  children?: React.ReactNode;
  //   x: number;
  //   y: number;
  //   width: number;
  //   height: number;
}

export const LayoutContainer: React.FC<LayoutContainerProps> = ({
  layout,
  children,
}) => {
  if (!layout || !layout.id) {
    return null;
  }

  const { id, type, x, y, width, height } = layout;
  const updateLayout = useComponentStore((state) => state.updateLayout);
  const isPresentMode = useSettingsStore((state) => state.presentMode);
  const scale = useSettingsStore((state) => state.pageScaleThrottled);
  const handleDragStop = (_e: DraggableEvent, d: DraggableData) => {
    updateLayout(id, {
      x: roundToNearest(d.x, 25),
      y: roundToNearest(d.y, 25),
    });
  };

  const handleResize = (
    _e: any,
    _direction: any,
    ref: HTMLElement,
    _delta: any,
    position: { x: number; y: number },
  ) => {
    updateLayout(id, {
      width: roundToNearest(parseInt(ref.style.width), 25),
      height: roundToNearest(parseInt(ref.style.height), 25),
      x: roundToNearest(position.x, 25),
      y: roundToNearest(position.y, 25),
    });
  };

  const layoutClasses = {
    row: 'flex flex-row items-center',
    column: 'flex flex-col items-center',
    grid: 'grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))]',
  };
  //   const getComponentPosition = () => {
  //     return (
  //       tempPosition || {
  //         x: component.x,
  //         y: component.y,
  //       }
  //     );
  //   };
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
      minWidth={200}
      minHeight={100}
      scale={isPresentMode ? 1.0 : scale}
      //   dragGrid={[25, 25]}
      resizeGrid={[25, 25]}
      onDragStop={handleDragStop}
      onResizeStop={handleResize}
      bounds="parent"
      enableResizing={true}
      className={cn(
        'pointer-events-auto',
        'rounded-lg border-2 border-dashed p-4',
        'transition-colors duration-200',
        'border-gray-300 dark:border-gray-600',
        'hover:border-blue-500 dark:hover:border-blue-400',
        'bg-white/50 dark:bg-slate-950/50',
        'z-[9999]', // Ensure it's above other components
      )}
    >
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
      </div>
      <div
        className={cn(
          layoutClasses[type],
          'h-full w-full gap-4',
          'cursor-move', // Add cursor indicator
        )}
      >
        {children}
      </div>
    </Rnd>
  );
};
