import { ReactNode } from 'react';
import { DraggableData, DraggableEvent } from 'react-draggable';
import { useTranslation } from 'react-i18next';
import { Rnd } from 'react-rnd';
import { ActionIcon, Box, Menu } from '@mantine/core';

import { Placeholder } from '@/editor/canvas/Placeholder';
import {
  ColumnIcon,
  CopyIcon,
  EditIcon,
  EllipsisVerticalIcon,
  GripHorizontalIcon,
  LayoutGridIcon,
  PinIcon,
  PinOffIcon,
  RowIcon,
  TrashIcon
} from '@/icons/icons';
import { useSettingsStore } from '@/store';
import { useBoundStore } from '@/store/boundStore';
import { LayoutBase } from '@/types/components';
import { roundToNearest } from '@/utils/math';

import classes from './LayoutContainer.module.css';

interface Props {
  layout: LayoutBase;
  children?: ReactNode;
  handleOpenEditModal: () => void;
}

const typeIcons = {
  row: <RowIcon />,
  column: <ColumnIcon />,
  grid: <LayoutGridIcon size={24} />
};

export function LayoutContainer({ layout, children, handleOpenEditModal }: Props) {
  const { t } = useTranslation('draggable-component');
  const layoutPosition = useBoundStore((state) => state.positions[layout?.id || '']);

  const handleLayoutDrop = useBoundStore((state) => state.handleLayoutDrop);

  const { x, y, width, height } = layoutPosition || {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  };
  const {
    id,
    type,
    children: layoutChildren,
    childWidth,
    childHeight,
    columns,
    padding
  } = layout;

  const updatePosition = useBoundStore((state) => state.updatePosition);
  const updateLayout = useBoundStore((state) => state.updateLayout);
  const deleteLayout = useBoundStore((state) => state.deleteLayout);
  const copyLayout = useBoundStore((state) => state.copyLayout);

  const isPresentMode = useSettingsStore((state) => state.presentMode);
  const scale = useSettingsStore((state) => state.pageScaleThrottled);
  if (!layout || !layout.id || !layoutPosition) {
    return null;
  }

  const handleDragStop = (_e: DraggableEvent, d: DraggableData) => {
    handleLayoutDrop(id, d.x, d.y);
  };

  const handlePin = () => {
    updateLayout(id, {
      persistent: !layout.persistent
    });
  };
  const handleResize = (
    _e: DraggableEvent,
    _direction:
      | 'top'
      | 'right'
      | 'bottom'
      | 'left'
      | 'topRight'
      | 'bottomRight'
      | 'bottomLeft'
      | 'topLeft',
    ref: HTMLElement,
    _delta: { width: number; height: number },
    position: { x: number; y: number }
  ) => {
    let newWidth = roundToNearest(parseInt(ref.style.width), 25);
    let newHeight = roundToNearest(parseInt(ref.style.height), 25);
    let { childWidth } = layout;
    let { childHeight } = layout;
    if (type === 'row') {
      newWidth =
        newHeight * (layoutChildren.length + 1) - layoutChildren.length * layout.padding;
      childWidth = newHeight - layout.padding * 2;
      childHeight = newHeight - layout.padding * 2;
    } else if (type === 'column') {
      newHeight =
        newWidth * (layoutChildren.length + 1) - layoutChildren.length * layout.padding;
      childWidth = newWidth - layout.padding * 2;
      childHeight = newWidth - layout.padding * 2;
    } else if (type === 'grid') {
      // Calculate based on grid rows and columns
      const numRows = Math.ceil(layoutChildren.length / columns);
      childWidth = (newWidth - layout.padding) / columns - layout.padding;
      childHeight = (newHeight - layout.padding) / numRows - layout.padding;
    }

    updateLayout(id, {
      childWidth: childWidth,
      childHeight: childHeight
    });
    updatePosition(id, {
      width: newWidth,
      height: newHeight,
      x: roundToNearest(position.x, 25),
      y: roundToNearest(position.y, 25)
    });
  };

  const isGrid = type === 'grid';

  return (
    <Rnd
      default={{
        x,
        y,
        width,
        height
      }}
      position={{ x, y }}
      dragHandleClassName={'drag-handle'}
      size={{ width, height }}
      minWidth={100}
      minHeight={100}
      scale={isPresentMode ? 1.0 : scale}
      onDragStop={handleDragStop}
      onResizeStop={handleResize}
      bounds={'parent'}
      enableResizing={!isPresentMode}
      disableDragging={isPresentMode}
      className={classes.layout}
      data-present={isPresentMode}
      style={{
        zIndex: 9999,
        borderRadius: isPresentMode ? undefined : 'var(--mantine-radius-lg)',
        backgroundColor: isPresentMode
          ? undefined
          : 'color-mix(in srgb, var(--mantine-color-dark-9) 50%, transparent)',
        pointerEvents: isPresentMode ? undefined : 'auto'
      }}
    >
      {!isPresentMode && (
        <Box
          className={`drag-handle ${classes.handle}`}
          style={{
            position: 'absolute',
            top: 0,
            zIndex: 99,
            display: 'flex',
            width: '100%',
            cursor: 'move',
            justifyContent: 'flex-end',
            borderTopLeftRadius: 'var(--mantine-radius-lg)',
            borderTopRightRadius: 'var(--mantine-radius-lg)'
          }}
        >
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
          <Box
            style={{
              position: 'relative',
              zIndex: 99,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'flex-end',
              gap: 8,
              padding: '4px 8px'
            }}
          >
            {layout.persistent ? (
              <PinIcon
                size={16}
                onClick={handlePin}
                style={{ cursor: 'pointer', color: 'var(--mantine-color-white)' }}
              />
            ) : (
              <PinOffIcon
                size={16}
                onClick={handlePin}
                style={{ cursor: 'pointer', color: 'var(--mantine-color-dimmed)' }}
              />
            )}
            <Menu position={'bottom-end'} zIndex={999999}>
              <Menu.Target>
                <ActionIcon variant={'subtle'}>
                  <EllipsisVerticalIcon />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<EditIcon />} onClick={handleOpenEditModal}>
                  {t('edit')}
                </Menu.Item>
                <Menu.Item leftSection={<CopyIcon />} onClick={() => copyLayout(id)}>
                  {t('copy')}
                </Menu.Item>
                <Menu.Item
                  leftSection={<TrashIcon />}
                  color={'red'}
                  onClick={() => deleteLayout(id)}
                >
                  {t('delete')}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Box>
          <Box
            style={{
              position: 'absolute',
              left: 8,
              top: 4,
              fontSize: 'var(--mantine-font-size-xs)',
              color: 'var(--mantine-color-white)'
            }}
          >
            {typeIcons[type]}
          </Box>
        </Box>
      )}
      <Box style={{ height: '100%', width: '100%' }}>
        {children}
        {!isPresentMode && !isGrid && (
          <Placeholder
            type={type}
            childWidth={childWidth}
            childHeight={childHeight}
            padding={layout.padding}
            columns={layout.columns}
          />
        )}
        {!isPresentMode &&
          isGrid &&
          layout.children.map((_childId, index) => {
            return (
              <Placeholder
                type={type}
                hidden={_childId != null}
                index={index}
                childWidth={childWidth}
                childHeight={childHeight}
                padding={padding}
                columns={columns}
                key={index}
              />
            );
          })}
      </Box>
    </Rnd>
  );
}
