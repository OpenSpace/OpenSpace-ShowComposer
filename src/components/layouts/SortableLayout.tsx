import React from 'react';
import { Rnd } from 'react-rnd';
import { DraggableEvent, DraggableData } from 'react-draggable';
import { useComponentStore } from '@/store';
import { cn } from '@/lib/utils';

interface SortableItemProps {
  id: string;
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  children: React.ReactNode;
  x: number;
  y: number;
}

const SortableItem: React.FC<SortableItemProps> = ({
  id,
  index,
  moveItem,
  children,
  x,
  y,
}) => {
  const handleDragStop = (_e: DraggableEvent, d: DraggableData) => {
    // Find closest index based on position
    const layout = useComponentStore.getState().layouts[id.split('-')[0]];
    if (!layout) return;

    const items = layout.children;
    let closestIndex = 0;
    let closestDistance = Infinity;

    items.forEach((_, idx) => {
      const distance = Math.abs(idx * 100 - d.y); // Simple distance calculation
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = idx;
      }
    });

    if (closestIndex !== index) {
      moveItem(index, closestIndex);
    }
  };

  return (
    <Rnd
      default={{
        x,
        y: index * 100, // Space items vertically
        width: '100%',
        height: 100,
      }}
      //   dragGrid={[25, 25]}
      onDragStop={handleDragStop}
      className={cn('transition-all duration-200', 'group relative')}
    >
      {children}
    </Rnd>
  );
};

export const SortableLayout: React.FC<{
  layoutId: string;
  type: 'row' | 'column' | 'grid';
  children: React.ReactNode[];
}> = ({ layoutId, type, children }) => {
  const reorderLayoutComponents = useComponentStore(
    (state) => state.reorderLayoutComponents,
  );

  const moveItem = (dragIndex: number, hoverIndex: number) => {
    const layout = useComponentStore.getState().layouts[layoutId];
    if (layout) {
      const newOrder = [...layout.children];
      const [removed] = newOrder.splice(dragIndex, 1);
      newOrder.splice(hoverIndex, 0, removed);
      reorderLayoutComponents(layoutId, newOrder);
    }
  };

  const layoutClasses = {
    row: 'flex flex-row items-center',
    column: 'flex flex-col items-center',
    grid: 'grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))]',
  };

  return (
    <div className={cn(layoutClasses[type], 'h-full w-full gap-4')}>
      {React.Children.map(children, (child, index) => (
        <SortableItem
          key={index}
          index={index}
          id={`${layoutId}-${index}`}
          moveItem={moveItem}
          x={0}
          y={index * 100}
        >
          {child}
        </SortableItem>
      ))}
    </div>
  );
};
