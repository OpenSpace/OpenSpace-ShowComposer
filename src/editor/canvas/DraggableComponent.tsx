import { ReactNode, useState } from 'react';
import { DraggableData, DraggableEvent } from 'react-draggable';
import { useTranslation } from 'react-i18next';
import { Rnd } from 'react-rnd';
import { ActionIcon, alpha, Box, Menu } from '@mantine/core';

import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal';
import { useIsConnected } from '@/hooks/util';
import {
  CopyIcon,
  EditIcon,
  EllipsisVerticalIcon,
  GripHorizontalIcon,
  TrashIcon
} from '@/icons/icons';
import { Component, useSettingsStore } from '@/store';
import { useBoundStore } from '@/store/boundStore';
import { roundToNearest } from '@/utils/math';

import classes from './DraggableComponent.module.css';

interface Props {
  component: Component;
  children: ReactNode;
  layoutId?: string;
  onEdit: () => void;
  onCopy?: () => void;
  onDelete: () => void;
}

export function DraggableComponent({
  component,
  children,
  layoutId,
  onEdit,
  onCopy = () => {},
  onDelete
}: Props) {
  const { t } = useTranslation('draggable-component');
  const position = useBoundStore((state) => state.positions[component?.id || '']);
  const updatePosition = useBoundStore((state) => state.updatePosition);
  const tempPosition = useBoundStore((state) => state.tempPositions[component.id]);
  const handleComponentDrop = useBoundStore((state) => state.handleComponentDrop);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const isDragging = useBoundStore((state) => state.positions[component.id]?.isDragging);
  const isPresentMode = useSettingsStore((state) => state.presentMode);
  const scale = useSettingsStore((state) => state.pageScaleThrottled);
  const selectedComponents = useBoundStore((state) => state.selectedComponents);
  const isSelected = useBoundStore((state) => state.positions[component.id]?.selected);
  // isConnected drives the disabled state
  const isConnected = useIsConnected();
  if (!component || !component.id || !position) {
    return null;
  }

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    onDelete();
    setIsDeleteModalOpen(false);
  };

  const handleDragStop = (_e: DraggableEvent, d: DraggableData) => {
    let newDropPos = { x: d.x, y: d.y };
    if (layoutId) {
      const parentPos = useBoundStore.getState().positions[layoutId];
      newDropPos = {
        x: d.x + parentPos.x,
        y: d.y + parentPos.y
      };
    }
    handleComponentDrop(component.id, newDropPos.x, newDropPos.y);
    updatePosition(component.id, {
      isDragging: false
    });
  };

  // Components that belong to a multi (during edit or saved) should not render on the canvas
  if (component.isMulti !== 'false') {
    return null;
  }

  const isHighlighted = (isDragging || isSelected) && !isPresentMode;

  const getComponentPosition = () => {
    return (
      tempPosition || {
        x: position.x,
        y: position.y
      }
    );
  };

  return (
    <>
      <Rnd
        dragHandleClassName={isSelected ? '' : 'drag-handle'}
        scale={isPresentMode ? 1.0 : scale}
        default={{
          x: position.x,
          y: position.y,
          width: position.width || position.minWidth,
          height: position.height || position.minHeight
        }}
        position={getComponentPosition()}
        size={{
          width: position.width,
          height: position.height
        }}
        minWidth={position.minWidth || 100}
        minHeight={position.minHeight || 100}
        resizeGrid={[25, 25]}
        onDragStart={(e: DraggableEvent) => {
          e.stopPropagation();
          updatePosition(component.id, {
            isDragging: true
          });
        }}
        onDrag={(_e: DraggableEvent, d: DraggableData) => {
          if (selectedComponents.includes(component.id)) {
            const deltaX = d.x - position.x;
            const deltaY = d.y - position.y;
            selectedComponents.forEach((id) => {
              const pos = useBoundStore.getState().positions[id];
              if (pos) {
                updatePosition(id, {
                  x: pos.x + deltaX,
                  y: pos.y + deltaY
                });
              }
            });
          }
        }}
        onDragStop={handleDragStop}
        onResizeStop={(_e, _direction, ref, _delta, position) => {
          if (layoutId) return;
          updatePosition(component.id, {
            width: roundToNearest(parseInt(ref.style.width), 25),
            height: roundToNearest(parseInt(ref.style.height), 25),
            x: roundToNearest(position.x, 25),
            y: roundToNearest(position.y, 25)
          });
        }}
        disableDragging={isPresentMode}
        enableResizing={!isPresentMode}
        style={{
          pointerEvents: 'auto',
          borderRadius: 'var(--mantine-radius-md)',
          background: isPresentMode
            ? undefined
            : alpha('var(--mantine-color-gray-3)', 0.25),
          zIndex: isHighlighted ? 999 : undefined,
          boxShadow: isHighlighted
            ? `0 10px 15px -3px ${alpha('var(--mantine-color-gray-4)', 0.5)}`
            : undefined,
          transition: !isDragging && layoutId ? 'transform 0.3s ease-in-out' : 'none'
        }}
      >
        {!isPresentMode && (
          <Box
            className={`drag-handle ${classes.dragHandle}`}
            style={{
              position: 'absolute',
              top: 0,
              zIndex: 99,
              display: 'flex',
              width: '100%',
              cursor: 'move',
              justifyContent: 'flex-end',
              borderTopLeftRadius: 'var(--mantine-radius-md)',
              borderTopRightRadius: 'var(--mantine-radius-md)',
              transition: 'background-color 300ms',
              height: isSelected ? '100%' : 20,
              backgroundColor: layoutId
                ? alpha('var(--mantine-color-blue-5)', 0.1)
                : undefined
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
                padding: 8
              }}
            >
              <Menu position={'bottom-end'} zIndex={999999}>
                <Menu.Target>
                  <ActionIcon variant={'subtle'}>
                    <EllipsisVerticalIcon />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item leftSection={<EditIcon />} onClick={onEdit}>
                    {t('edit')}
                  </Menu.Item>
                  <Menu.Item leftSection={<CopyIcon />} onClick={onCopy}>
                    {t('copy')}
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<TrashIcon />}
                    color={'red'}
                    onClick={handleDeleteClick}
                  >
                    {t('delete')}
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Box>
          </Box>
        )}
        <Box
          style={{
            position: 'relative',
            top: 0,
            zIndex: 0,
            display: 'flex',
            height: '100%',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--mantine-radius-md)',
            padding: layoutId ? 8 : '8px 16px',
            opacity: isConnected ? 1 : 0.25,
            transition: 'opacity 300ms'
          }}
        >
          {children}
        </Box>
        {/*
          Overlay to disable a component when OS is disconnected. Swallows clicks with 
          "not-allowed" cursor (stronger than "none" which can be overridden by children).
          Sits below the drag handle and the kebab menu in z-index so they are still clickable.
        */}
        {!isConnected && (
          <Box
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 50,
              borderRadius: 'var(--mantine-radius-md)',
              cursor: 'not-allowed'
            }}
          />
        )}
      </Rnd>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        message={`Are you sure you want to delete the component${
          component.gui_name ? ' ' + component.gui_name : ''
        }?`}
      />
    </>
  );
}
