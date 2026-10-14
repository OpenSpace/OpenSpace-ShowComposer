import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Box } from '@mantine/core';

import { ConnectionStatusIndicator } from '@/components/ConnectionStatusIndicator';
import { AdjustablePage } from '@/editor/canvas/AdjustablePage';
import { ScaleGUI } from '@/editor/canvas/ScaleGUI';
import { SelectionTool } from '@/editor/canvas/SelectionTool';
import { useSettingsStore } from '@/store';
import { useBoundStore } from '@/store/boundStore';

export function DroppableWorkspace({ children }: { children: ReactNode }) {
  const { t } = useTranslation('droppable-workspace');
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

  function handleWheel(event: React.WheelEvent) {
    const scaleAmount = event.deltaY > 0 ? 0.95 : 1.05;
    setScale((prevScale) => {
      const newScale = prevScale * scaleAmount;
      return Math.min(2.0, Math.max(0.75, newScale));
    });
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Shift') {
        setIsShiftPressed(true);
      }
    }
    function handleKeyUp(e: KeyboardEvent) {
      if (e.key === 'Shift') {
        setIsShiftPressed(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  function handleMouseDown(event: React.MouseEvent) {
    const startX = event.pageX - translateX * scale;
    const startY = event.pageY - translateY * scale;

    function handleMouseMove(moveEvent: MouseEvent) {
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
    }

    function handleMouseUp() {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  // Edit mode shows the dotted background, and the page can be zoomed and panned.
  // Present mode keeps an identity transform, so the content always has its own
  // stacking context in both modes.
  // TODO: @ylvse 2026-10-12: investigate if the identity transform can be dropped
  const viewStyle = isPresentMode
    ? {
        transform: 'scale(1.0) translate(0px,0px)',
        transformOrigin: 'center'
      }
    : {
        backgroundPosition: '-12.5px -12.5px',
        backgroundSize: '25px 25px',
        backgroundImage: 'radial-gradient(circle, #f1f5f940 1px, #02061740 1px)',
        transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
        transformOrigin: 'top left'
      };

  return (
    <>
      <Box
        ref={workspaceRef}
        pos={'relative'}
        w={'100%'}
        h={'100%'}
        bdrs={isPresentMode ? 0 : 'lg'}
        bd={'1px solid dark.4'}
        bg={'dark.6'}
        c={'dimmed'}
        style={{
          overflow: 'hidden',
          transition: 'transform 0.2s'
        }}
      >
        {isPresentMode ? (
          <Box pos={'absolute'} p={'xs'}>
            <ConnectionStatusIndicator />
          </Box>
        ) : (
          <Badge variant={'default'} m={'xs'} bg={'dark.5'}>
            {t('edit-mode')}
          </Badge>
        )}
        {!isPresentMode && <SelectionTool />}

        <Box
          ref={innerContainerRef}
          onWheel={handleWheel}
          onMouseDown={isShiftPressed ? handleMouseDown : undefined}
          pos={'absolute'}
          top={isPresentMode ? -pageY : 0}
          left={isPresentMode ? -pageX : 0}
          w={isPresentMode ? pageWidth + pageX : '4000px'}
          h={isPresentMode ? pageHeight + pageY : '4000px'}
          mih={isPresentMode ? undefined : '100%'}
          style={{
            overflow: 'hidden',
            pointerEvents: isShiftPressed ? 'all' : 'none',
            cursor: isShiftPressed ? 'grab' : 'default',
            ...viewStyle
          }}
        >
          <AdjustablePage />
          {children}
        </Box>
      </Box>
      <Box pos={'absolute'} right={20} top={28}>
        {!isPresentMode && <ScaleGUI />}
      </Box>
    </>
  );
}
