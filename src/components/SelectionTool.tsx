// SelectionTool.tsx
import React, { useRef, useState } from 'react';

import { useBoundStore } from '@/store/boundStore';

const SelectionTool: React.FC = () => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [rect, setRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const currentPage = useBoundStore((state) => state.currentPage);

  const getPageById = useBoundStore((state) => state.getPageById);
  const positions = useBoundStore((state) => state.positions);
  const selectComponent = useBoundStore((state) => state.selectComponent);
  const clearSelection = useBoundStore((state) => state.clearSelection);

  const handleMouseDown = (e: React.MouseEvent) => {
    clearSelection();
    setIsSelecting(true);
    const containerRect = containerRef.current!.getBoundingClientRect();
    const offsetX = e.clientX - containerRect.left;
    const offsetY = e.clientY - containerRect.top;
    setStartPos({ x: offsetX, y: offsetY });
    setRect({ x: offsetX, y: offsetY, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSelecting) return;
    const containerRect = containerRef.current!.getBoundingClientRect();
    const offsetX = e.clientX - containerRect.left;
    const offsetY = e.clientY - containerRect.top;

    const newRect = {
      x: Math.min(startPos.x, offsetX),
      y: Math.min(startPos.y, offsetY),
      width: Math.abs(startPos.x - offsetX),
      height: Math.abs(startPos.y - offsetY)
    };
    setRect(newRect);
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
    getPageById(currentPage).components.forEach((c) => {
      // Ensure the component has valid position data
      const compPos = positions[c];
      if (!compPos) return;

      const compRect = {
        x: compPos.x,
        y: compPos.y,
        width: compPos.width,
        height: compPos.height
      };

      // Check if the component is within the selection rectangle
      if (
        rect.x < compRect.x + compRect.width &&
        rect.x + rect.width > compRect.x &&
        rect.y < compRect.y + compRect.height &&
        rect.y + rect.height > compRect.y
      ) {
        selectComponent(c);
      }
    });
  };

  return (
    <div
      ref={containerRef}
      className={'relative h-full w-full'}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ zIndex: isSelecting ? 9999 : 0 }}
    >
      {isSelecting && (
        <div
          className={
            'absolute border-2 border-dashed border-blue-500 bg-blue-200 bg-opacity-25'
          }
          style={{
            left: rect.x,
            top: rect.y,
            width: rect.width,
            height: rect.height
          }}
        ></div>
      )}
    </div>
  );
};

export default SelectionTool;
