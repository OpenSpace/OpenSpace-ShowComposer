import { useEffect, useState } from 'react';
import { DraggableData, DraggableEvent } from 'react-draggable';
import { Rnd } from 'react-rnd';
import { ActionIcon, Box, Tooltip } from '@mantine/core';

import DisplayLabel from '@/components/DisplayLabel';
import { GripHorizontalIcon, LockIcon, LockOpenIcon } from '@/icons/icons';
import { useSettingsStore } from '@/store';
import { useBoundStore } from '@/store/boundStore';
import { Page } from '@/types/components';

import classes from './AdjustablePage.module.css';

export default function AdjustablePage() {
  const scale = useSettingsStore((state) => state.pageScaleThrottled);
  const isPresentMode = useSettingsStore((state) => state.presentMode);
  const { pageWidth, pageHeight } = useSettingsStore((state) => state);
  const updatePage = useBoundStore((state) => state.updatePage);
  const page: Page = useBoundStore((state) => state.getPageById(state.currentPage));

  const currentPageIndex = useBoundStore((state) => state.currentPageIndex);

  const updatePageSize = useSettingsStore((state) => state.updatePageSize);
  const [isDragging, setIsDragging] = useState(false);
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
    setIsDragging(false);
    updatePage(page.id, {
      x: d.x,
      y: d.y
    });
  };

  const borderColor = isDragging
    ? 'var(--mantine-color-blue-5)'
    : locked
      ? 'color-mix(in srgb, var(--mantine-color-gray-2) 30%, transparent)'
      : 'var(--mantine-color-gray-2)';

  return (
    <Rnd
      scale={isPresentMode ? 1.0 : scale}
      default={{
        x: page.x,
        y: page.y,
        width: pageWidth,
        height: pageHeight
      }}
      position={{
        x: page.x,
        y: page.y
      }}
      size={{
        width: pageWidth,
        height: pageHeight
      }}
      onDragStart={(e: DraggableEvent) => {
        setIsDragging(true);
        e.stopPropagation();
      }}
      bounds={'parent'}
      onDragStop={(e: DraggableEvent, d: DraggableData) => handleDragStop(e, d)}
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
      disableDragging={locked || isPresentMode}
      enableResizing={!locked && !isPresentMode}
      className={classes.page}
      style={{
        zIndex: 0,
        outline: 'none',
        color: 'var(--mantine-color-text)',
        backgroundColor: page.color,
        boxShadow: isDragging ? 'var(--mantine-shadow-lg)' : undefined,
        border: isPresentMode ? undefined : `2px dashed ${borderColor}`,
        pointerEvents: !isPresentMode && locked ? 'none' : 'auto'
      }}
    >
      <Box style={{ position: 'absolute', top: 0, height: 30, width: '100%' }}>
        {!isPresentMode && !locked && (
          <Box
            style={{
              position: 'absolute',
              display: 'flex',
              width: '100%',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4
            }}
          >
            <GripHorizontalIcon className={classes.grip} />
          </Box>
        )}
        {!isPresentMode && (
          <>
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
                  width: 'auto',
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
                zIndex: 999
              }}
            >
              <Tooltip label={locked ? 'Unlock Page' : 'Lock Page'}>
                <ActionIcon
                  onClick={() => setLocked(!locked)}
                  style={{
                    zIndex: 50,
                    transition: 'opacity 100ms',
                    opacity: locked ? 0.6 : 1
                  }}
                >
                  {locked ? <LockIcon size={16} /> : <LockOpenIcon size={16} />}
                </ActionIcon>
              </Tooltip>
            </Box>
          </>
        )}
      </Box>
    </Rnd>
  );
}
