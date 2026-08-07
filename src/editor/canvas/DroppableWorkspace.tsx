import { ReactNode, useEffect, useRef, useState } from 'react';
import { Badge, Box } from '@mantine/core';

import { ConnectionStatusIndicator } from '@/components/ConnectionStatusIndicator';
import { AdjustablePage } from '@/editor/canvas/AdjustablePage';
import { ScaleGUI } from '@/editor/canvas/ScaleGUI';
import { SelectionTool } from '@/editor/canvas/SelectionTool';
import { useSettingsStore } from '@/store';
import { useBoundStore } from '@/store/boundStore';
import { getCopy } from '@/utils/copyHelpers';

export function DroppableWorkspace({ children }: { children: ReactNode }) {
  const isPresentMode = useSettingsStore((state) => state.presentMode);
  const { pageWidth, pageHeight } = useSettingsStore((state) => state);
  const scale = useSettingsStore((state) => state.pageScale);
  const setScale = useSettingsStore((state) => state.setScale);

  const currentPage = useBoundStore((state) => state.currentPage);
  const { x: pageX, y: pageY } = useBoundStore((state) => state.getPageById(currentPage));

  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isShiftPressed, setIsShiftPressed] = useState(false);

  const workspaceRef = useRef<HTMLDivElement>(null);
  const innerContainerRef = useRef<HTMLDivElement>(null);

  const handleWheel = (event: React.WheelEvent) => {
    const scaleAmount = event.deltaY > 0 ? 0.95 : 1.05;
    setScale((prevScale) => {
      const newScale = prevScale * scaleAmount;
      return Math.min(2.0, Math.max(0.75, newScale));
    });
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

  const handleMouseDown = (event: React.MouseEvent) => {
    const startX = event.pageX - translateX * scale;
    const startY = event.pageY - translateY * scale;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const containerRect = workspaceRef.current?.getBoundingClientRect();
      const divRect = innerContainerRef.current?.getBoundingClientRect();
      let newTranslateX = (moveEvent.pageX - startX) / scale;
      let newTranslateY = (moveEvent.pageY - startY) / scale;
      if (divRect && containerRect) {
        // Ensure the div does not move out of the container's bounds
        if (newTranslateX > 0) {
          newTranslateX = 0;
        } else if (newTranslateX < (containerRect.width - divRect.width) / scale) {
          newTranslateX = (containerRect.width - divRect.width) / scale;
        }
        if (newTranslateY > 0) {
          newTranslateY = 0;
        } else if (newTranslateY < (containerRect.height - divRect.height) / scale) {
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

  return (
    <>
      <Box
        ref={workspaceRef}
        style={{
          position: 'relative',
          height: '100%',
          width: '100%',
          borderRadius: isPresentMode ? 0 : 'var(--mantine-radius-lg)',
          border: '1px solid var(--mantine-color-dark-4)',
          backgroundColor: 'var(--mantine-color-dark-6)',
          color: 'var(--mantine-color-dimmed)',
          overflow: 'hidden',
          transition: 'transform 0.2s'
        }}
      >
        {!isPresentMode && (
          <Badge
            variant={'default'}
            style={{
              position: 'absolute',
              left: 12,
              top: 12,
              letterSpacing: '0.025em',
              backgroundColor: 'var(--mantine-color-dark-5)'
            }}
          >
            {getCopy('DroppableWorkspace', 'edit_mode')}
          </Badge>
        )}

        {isPresentMode && (
          <Box style={{ position: 'absolute', left: 12, top: 12 }}>
            <ConnectionStatusIndicator />
          </Box>
        )}
        {!isPresentMode && <SelectionTool />}

        <Box
          ref={innerContainerRef}
          onWheel={handleWheel}
          onMouseDown={isShiftPressed ? handleMouseDown : undefined}
          style={{
            position: 'absolute',
            top: isPresentMode ? -pageY : 0,
            left: isPresentMode ? -pageX : 0,
            width: isPresentMode ? pageWidth + pageX : '4000px',
            height: isPresentMode ? pageHeight + pageY : '4000px',
            minHeight: isPresentMode ? '' : '100%',
            overflow: 'hidden',
            backgroundPosition: '-12.5px -12.5px',
            backgroundSize: '25px 25px',
            backgroundImage: !isPresentMode
              ? 'radial-gradient(circle, #f1f5f940 1px, #02061740 1px)'
              : undefined,
            pointerEvents: isShiftPressed ? 'all' : 'none',
            transformOrigin: isPresentMode ? 'center' : 'top left',
            transform: isPresentMode
              ? `scale(1.0) translate(0px,0px)`
              : `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
            cursor: isShiftPressed ? 'grab' : 'default'
          }}
        >
          <AdjustablePage />
          {children}
        </Box>
      </Box>
      <Box
        style={{
          position: 'absolute',
          right: 20,
          top: 28,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8
        }}
      >
        {!isPresentMode && <ScaleGUI />}
      </Box>
    </>
  );
}
