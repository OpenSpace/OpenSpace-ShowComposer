// SelectionTool.tsx
import React, { useRef, useState } from 'react';
import { useComponentStore } from '@/store';

const SelectionTool: React.FC = () => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [rect, setRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const components = useComponentStore((state) => state.components);
  const selectComponent = useComponentStore((state) => state.selectComponent);
  const clearSelection = useComponentStore((state) => state.clearSelection);

  const handleMouseDown = (e: React.MouseEvent) => {
    clearSelection();
    setIsSelecting(true);
    const containerRect = containerRef.current!.getBoundingClientRect();
    const offsetX = e.clientX - containerRect.left;
    const offsetY = e.clientY - containerRect.top;
    // const { offsetX, offsetY } = e.nativeEvent;
    // console.log('offsetX', offsetX, 'offsetY', offsetY);
    setStartPos({ x: offsetX, y: offsetY });
    setRect({ x: offsetX, y: offsetY, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSelecting) return;
    const containerRect = containerRef.current!.getBoundingClientRect();
    const offsetX = e.clientX - containerRect.left;
    const offsetY = e.clientY - containerRect.top;
    // const { offsetX, offsetY } = e.nativeEvent;
    // console.log('offsetX', offsetX, 'offsetY', offsetY);
    const newRect = {
      x: Math.min(startPos.x, offsetX),
      y: Math.min(startPos.y, offsetY),
      width: Math.abs(startPos.x - offsetX),
      height: Math.abs(startPos.y - offsetY),
    };
    setRect(newRect);
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
    components.forEach((component) => {
      const compRect = {
        x: component.x,
        y: component.y,
        width: component.width,
        height: component.height,
      };
      if (
        rect.x < compRect.x + compRect.width &&
        rect.x + rect.width > compRect.x &&
        rect.y < compRect.y + compRect.height &&
        rect.y + rect.height > compRect.y
      ) {
        selectComponent(component.id);
      }
    });
  };

  return (
    <div
      ref={containerRef}
      className={`${isSelecting ? 'z-[9999]' : ''} relative h-full w-full`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {isSelecting && (
        <div
          className="absolute border-2 border-dashed border-blue-500 bg-blue-200 bg-opacity-25"
          style={{
            left: rect.x,
            top: rect.y,
            width: rect.width,
            height: rect.height,
          }}
        ></div>
      )}
    </div>
  );
};

export default SelectionTool;
