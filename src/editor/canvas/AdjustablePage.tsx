import { useEffect, useState } from 'react';
import type { DraggableData, DraggableEvent } from 'react-draggable';
import { useTranslation } from 'react-i18next';
import type { Position } from 'react-rnd';
import { ActionIcon, Group, Text, Tooltip } from '@mantine/core';

import { DisplayLabel } from '@/components/DisplayLabel';
import { Draggable } from '@/editor/canvas/Draggable';
import { zIndex } from '@/editor/canvas/zIndex';
import { LockIcon, LockOpenIcon } from '@/icons/icons';
import { useSettingsStore } from '@/store';
import { useBoundStore } from '@/store/boundStore';
import type { Page } from '@/types/components';
import { IconSize } from '@/types/enums';

export function AdjustablePage() {
  const { t } = useTranslation('adjustable-page');
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

  function handleResize(ref: HTMLElement, position: Position) {
    updatePageSize(parseInt(ref.style.width), parseInt(ref.style.height));
    updatePage(page.id, {
      x: position.x,
      y: position.y
    });
  }

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
      // The page doesn't snap to grid so it can hit exact sizes like 1920x1080
      resizeGrid={[1, 1]}
      disableDragging={locked || isPresentMode}
      enableResizing={!locked && !isPresentMode}
      onDragStart={(e: DraggableEvent) => {
        e.stopPropagation();
      }}
      onDragStop={handleDragStop}
      onResize={(_e, _direction, ref, _delta, position) => handleResize(ref, position)}
      onResizeStop={(_e, _direction, ref, _delta, position) =>
        handleResize(ref, position)
      }
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
        <Group
          pos={'absolute'}
          top={0}
          left={0}
          w={'100%'}
          p={'sm'}
          justify={'space-between'}
          wrap={'nowrap'}
        >
          <DisplayLabel fz={'xs'} c={'gray.2'}>
            <Text inherit>
              {page.name || t('default-page-name', { number: currentPageIndex + 1 })}
            </Text>
          </DisplayLabel>
          <Group
            gap={'xs'}
            wrap={'nowrap'}
            style={{ pointerEvents: 'auto', zIndex: zIndex.pageControl }}
          >
            {!locked && (
              <DisplayLabel
                fz={'xs'}
                c={'gray.2'}
                opacity={isVisible ? 1 : 0}
                style={{ transition: 'opacity 500ms' }}
              >
                <Text inherit>
                  {pageWidth} x {pageHeight}
                </Text>
              </DisplayLabel>
            )}
            <Tooltip label={locked ? t('unlock-page') : t('lock-page')}>
              <ActionIcon onClick={() => setLocked(!locked)} opacity={locked ? 0.6 : 1}>
                {locked ? (
                  <LockIcon size={IconSize.sm} />
                ) : (
                  <LockOpenIcon size={IconSize.sm} />
                )}
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      )}
    </Draggable>
  );
}
