// DroppableWorkspace.tsx
import { useSettingsStore } from '@/store';
import React, { useState, useCallback } from 'react';
// import { useDrop } from 'react-dnd';
// import { useStore } from '../store/store';
// import useCombinedRefs from './useCombinedRefs';
import SelectionTool from '@/components/SelectionTool';

const DroppableWorkspace: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const isPresentMode = useSettingsStore((state) => state.presentMode); // Get the global state
  // const [zoomLevel, setZoomLevel] = useState(1); // 1 means 100%
  // const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  // const [showTooltip, setShowTooltip] = useState(false);

  // const handleWheel = useCallback(
  //   (e: React.WheelEvent) => {
  //     e.preventDefault();
  //     const zoomChange = e.deltaY * -0.01;
  //     const newZoomLevel = Math.min(Math.max(zoomLevel + zoomChange, 0.5), 2.0);
  //     setZoomLevel(newZoomLevel);
  //     setShowTooltip(true);
  //     setTimeout(() => setShowTooltip(false), 2000); // Hide tooltip after 2 seconds
  //   },
  //   [zoomLevel],
  // );

  // const handleMouseDown = useCallback(
  //   (e: React.MouseEvent) => {
  //     const startX = e.clientX - panPosition.x;
  //     const startY = e.clientY - panPosition.y;

  //     const handleMouseMove = (e: MouseEvent) => {
  //       setPanPosition({
  //         x: e.clientX - startX,
  //         y: e.clientY - startY,
  //       });
  //     };

  //     const handleMouseUp = () => {
  //       document.removeEventListener('mousemove', handleMouseMove);
  //       document.removeEventListener('mouseup', handleMouseUp);
  //     };

  //     document.addEventListener('mousemove', handleMouseMove);
  //     document.addEventListener('mouseup', handleMouseUp);
  //   },
  //   [panPosition],
  // );

  return (
    <>
      <div
        className="relative h-full w-full"
        style={{
          overflow: 'hidden',
          backgroundPosition: '-12.5px -12.5px',
          backgroundSize: '25px 25px',
          backgroundImage: !isPresentMode
            ? 'radial-gradient(circle,#404040 1px, #f1f5f9 1px)'
            : undefined,

          // transform: `scale(${zoomLevel}) translate(${panPosition.x}px, ${panPosition.y}px)`,
          transformOrigin: 'top left',
          transition: 'transform 0.2s',
          // backgroundColor: 'white',
        }}
        // onWheel={handleWheel}
        // onMouseDown={handleMouseDown}
      >
        {!isPresentMode && <SelectionTool />}
        {children}
      </div>
      {/* {showTooltip && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '5px',
          }}
        >
          Zoom: {Math.round(zoomLevel * 100)}%
        </div>
      )} */}
    </>
  );
};

export default DroppableWorkspace;
