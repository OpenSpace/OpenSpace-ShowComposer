import { useEffect, useState } from 'react';
import { DraggableData, DraggableEvent } from 'react-draggable';
import { ActionIcon, Box, Tooltip } from '@mantine/core';

import { DisplayLabel } from '@/components/DisplayLabel';
import { Draggable } from '@/editor/canvas/Draggable';
import { zIndex } from '@/editor/canvas/zIndex';
import { LockIcon, LockOpenIcon } from '@/icons/icons';
import { useSettingsStore } from '@/store';
import { useBoundStore } from '@/store/boundStore';
import { Page } from '@/types/components';

export function AdjustablePage() {
  const isPresentMode = useSettingsStore((state) => state.presentMode);
  const updatePageSize = useSettingsStore((state) => state.updatePageSize);

  const { pageWidth, pageHeight } = useSettingsStore((state) => state);
  const updatePage = useBoundStore((state) => state.updatePage);
  const page: Page = useBoundStore((state) => state.getPageById(state.currentPage));
  const currentPageIndex = useBoundStore((state) => state.currentPageIndex);

  const [locked, setLocked] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Show the label when pageWidth or pageHeight changes
    setIsVisible(true);
    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [pageWidth, pageHeight, locked]);

  const handleDragStop = (_e: DraggableEvent, d: DraggableData) => {
    updatePage(page.id, {
      x: d.x,
      y: d.y
    });
  };

  const borderColor = locked
    ? 'color-mix(in srgb, var(--mantine-color-gray-2) 30%, transparent)'
    : 'var(--mantine-color-gray-2)';

  return (
    <Draggable
      dragAnywhere
      position={{
        x: page.x,
        y: page.y
      }}
      size={{
        width: pageWidth,
        height: pageHeight
      }}
      bounds={'parent'}
      // The page snaps freely so it can hit exact sizes like 1920x1080
      resizeGrid={[1, 1]}
      disableDragging={locked || isPresentMode}
      enableResizing={!locked && !isPresentMode}
      onDragStart={(e: DraggableEvent) => {
        e.stopPropagation();
      }}
      onDragStop={handleDragStop}
      onResize={(_e, _direction, ref, _delta, position) => {
        updatePageSize(parseInt(ref.style.width), parseInt(ref.style.height));
        updatePage(page.id, {
          x: position.x,
          y: position.y
        });
      }}
      onResizeStop={(_e, _direction, ref, _delta, position) => {
        updatePageSize(parseInt(ref.style.width), parseInt(ref.style.height));
        updatePage(page.id, {
          x: position.x,
          y: position.y
        });
      }}
      style={{
        borderRadius: 0,
        zIndex: zIndex.page,
        backgroundColor: page.color,
        boxShadow: 'none',
        border: isPresentMode ? undefined : `2px dashed ${borderColor}`,
        pointerEvents: !isPresentMode && locked ? 'none' : 'auto'
      }}
      dragStyle={{
        boxShadow: 'var(--mantine-shadow-lg)',
        borderColor: 'var(--mantine-color-blue-5)'
      }}
    >
      {!isPresentMode && (
        <Box style={{ position: 'absolute', top: 0, height: 30, width: '100%' }}>
          {!locked && (
            <Box style={{ position: 'absolute', right: 56, top: 12 }}>
              <DisplayLabel
                style={{
                  fontSize: 'var(--mantine-font-size-xs)',
                  color: 'var(--mantine-color-gray-2)',
                  transition: 'opacity 500ms',
                  opacity: isVisible ? 1 : 0
                }}
              >
                {pageWidth} x {pageHeight}
              </DisplayLabel>
            </Box>
          )}
          <Box style={{ padding: 12 }}>
            <DisplayLabel
              style={{
                fontSize: 'var(--mantine-font-size-xs)',
                color: 'var(--mantine-color-gray-2)'
              }}
            >
              {page.name ? page.name : `Page ${currentPageIndex + 1}`}
            </DisplayLabel>
          </Box>
          <Box
            style={{
              pointerEvents: 'auto',
              position: 'absolute',
              right: 12,
              top: 12,
              zIndex: zIndex.pageControl
            }}
          >
            <Tooltip label={locked ? 'Unlock Page' : 'Lock Page'}>
              <ActionIcon
                onClick={() => setLocked(!locked)}
                style={{
                  transition: 'opacity 100ms',
                  opacity: locked ? 0.6 : 1
                }}
              >
                {locked ? <LockIcon size={16} /> : <LockOpenIcon size={16} />}
              </ActionIcon>
            </Tooltip>
          </Box>
        </Box>
      )}
    </Draggable>
  );
}
