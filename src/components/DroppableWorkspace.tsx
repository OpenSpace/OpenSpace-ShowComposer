// DroppableWorkspace.tsx
import { useComponentStore, useSettingsStore } from '@/store';
import { getCopy } from '@/utils/copyHelpers';
import React, { useState, useEffect } from 'react';
import SelectionTool from '@/components/SelectionTool';
import { Badge } from './ui/badge';
import { useTheme } from './ThemeProvider';
import AdjustablePage from './AdjustablePage';
import ScaleGUI from './ScaleGUI';
import { ConnectionStatus } from './ConnectionSettings';
const DroppableWorkspace: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { theme } = useTheme();
  const isPresentMode = useSettingsStore((state) => state.presentMode); // Get the global state
  const currentPage = useComponentStore((state) => state.currentPage);
  const { x: pageX, y: pageY } = useComponentStore((state) =>
    state.getPageById(currentPage),
  );
  const { pageWidth, pageHeight } = useSettingsStore((state) => state);
  const scale = useSettingsStore((state) => state.pageScale);
  const setScale = useSettingsStore((state) => state.setScale);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const handleWheel = (event: React.WheelEvent) => {
    // event.preventDefault();
    const scaleAmount = event.deltaY > 0 ? 0.95 : 1.05;
    setScale((prevScale) => {
      const newScale = prevScale * scaleAmount;
      return Math.min(2.0, Math.max(0.75, newScale));
    });
  };
  const handleMouseDown = (event: React.MouseEvent) => {
    const startX = event.pageX - translateX * scale;
    const startY = event.pageY - translateY * scale;
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const container = document.getElementById('workspace');
      const containerRect = container?.getBoundingClientRect();
      const div = document.getElementById('innerContainer');
      const divRect = div?.getBoundingClientRect();
      let newTranslateX = (moveEvent.pageX - startX) / scale;
      let newTranslateY = (moveEvent.pageY - startY) / scale;
      if (divRect && containerRect) {
        // Ensure the div does not move out of the container's bounds
        if (newTranslateX > 0) {
          newTranslateX = 0;
        } else if (
          newTranslateX <
          (containerRect.width - divRect.width) / scale
        ) {
          newTranslateX = (containerRect.width - divRect.width) / scale;
        }
        if (newTranslateY > 0) {
          newTranslateY = 0;
        } else if (
          newTranslateY <
          (containerRect.height - divRect.height) / scale
        ) {
          newTranslateY = (containerRect.height - divRect.height) / scale;
        }
        setTranslateX(newTranslateX);
        setTranslateY(newTranslateY);
      }
    };
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  return (
    <>
      <div
        id="workspace"
        className="relative h-full w-full rounded-lg border  border-slate-200 bg-white text-slate-950 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-500 "
        style={{
          overflow: 'hidden',
          transition: 'transform 0.2s',
        }}
      >
        {!isPresentMode && (
          <Badge
            variant="secondary"
            className=" font-lg absolute left-3 top-3 gap-2 bg-white/70 tracking-wide dark:bg-slate-700"
          >
            {getCopy('DroppableWorkspace', 'edit_mode')}
          </Badge>
        )}
        {isPresentMode && (
          <div className="absolute left-3 top-3">
            <ConnectionStatus />
          </div>
        )}
        {!isPresentMode && <SelectionTool />}

        <div
          onWheel={handleWheel}
          onMouseDown={isShiftPressed ? handleMouseDown : undefined}
          id="innerContainer"
          style={{
            position: 'absolute',
            top: isPresentMode ? -pageY : 0,
            left: isPresentMode ? -pageX : 0,
            width: isPresentMode ? pageWidth + pageX : '4000px',
            height: isPresentMode ? pageHeight + pageY : '4000px',
            minHeight: isPresentMode ? '' : '100%',
            overflow: isPresentMode ? 'hidden' : 'hidden',
            backgroundPosition: '-12.5px -12.5px',
            backgroundSize: '25px 25px',
            backgroundImage: !isPresentMode
              ? theme == 'dark'
                ? 'radial-gradient(circle, #f1f5f940 1px, #02061740 1px)'
                : 'radial-gradient(circle,#404040 1px, #f1f5f9 1px)'
              : undefined,
            pointerEvents: isShiftPressed ? 'all' : 'none',
            transformOrigin: isPresentMode ? 'center' : 'top left',
            transform: isPresentMode
              ? `scale(1.0) translate(0px,0px)`
              : `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
            cursor: 'grab',
          }}
          className="hover:cursor-grab"
        >
          <AdjustablePage />
          {children}
        </div>
      </div>
      <div className="absolute right-7 top-7 flex flex-col items-center justify-center gap-2">
        {!isPresentMode && <ScaleGUI />}
      </div>
    </>
  );
};
export default DroppableWorkspace;
