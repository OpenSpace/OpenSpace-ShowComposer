import { ReactNode, useState } from 'react';
import { DraggableData, DraggableEvent } from 'react-draggable';
import { useTranslation } from 'react-i18next';
import { ActionIcon, Menu } from '@mantine/core';

import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal';
import { DimmableBody } from '@/editor/canvas/DimmableBody';
import { Draggable } from '@/editor/canvas/Draggable';
import { zIndex } from '@/editor/canvas/zIndex';
import { useIsConnected } from '@/hooks/util';
import { CopyIcon, EditIcon, EllipsisVerticalIcon, TrashIcon } from '@/icons/icons';
import { Component, useSettingsStore } from '@/store';
import { useBoundStore } from '@/store/boundStore';
import { roundToNearest } from '@/utils/math';

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
  const isDragging = useBoundStore((state) => state.positions[component.id]?.isDragging);
  const tempPosition = useBoundStore((state) => state.tempPositions[component.id]);
  const isSelected = useBoundStore((state) => state.positions[component.id]?.selected);
  const selectedComponents = useBoundStore((state) => state.selectedComponents);
  const isPresentMode = useSettingsStore((state) => state.presentMode);

  const updatePosition = useBoundStore((state) => state.updatePosition);
  const handleComponentDrop = useBoundStore((state) => state.handleComponentDrop);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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
      <Draggable
        dragAnywhere={isSelected}
        position={getComponentPosition()}
        size={{
          width: position.width,
          height: position.height
        }}
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
        rightSection={
          <Menu position={'bottom-end'} zIndex={zIndex.menu}>
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
        }
        style={{
          pointerEvents: 'auto',
          zIndex: isHighlighted ? zIndex.widgetRaised : undefined,
          transition: !isDragging && layoutId ? 'transform 0.3s ease-in-out' : 'none',
          ...(component.type === 'title'
            ? { background: 'rgba(255, 255, 255, 0.2)', boxShadow: 'none' }
            : {})
        }}
      >
        <DimmableBody inactive={!isConnected}>{children}</DimmableBody>
      </Draggable>
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
