import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Group, Modal, Text } from '@mantine/core';

import { componentsData, renderComponentModal } from '@/editor/componentsData';
import type { Component, ComponentType } from '@/store';
import { useBoundStore } from '@/store/boundStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCancel?: () => void;
  componentId?: Component['id'] | null;
  type: ComponentType | '';
  initialData?: Partial<Component>;
  icon?: ReactNode;
}

export function ComponentModal({
  isOpen,
  onClose,
  onCancel,
  componentId,
  type,
  initialData = {},
  icon
}: Props) {
  const { t } = useTranslation(['component-modal', 'main']);
  const components = useBoundStore((state) => state.components);
  const updateComponent = useBoundStore((state) => state.updateComponent);
  const removeComponent = useBoundStore((state) => state.removeComponent);

  const component = componentId ? components[componentId] : null;
  const resolvedType = component ? component.type : type;

  const handleCancel = () => {
    if (resolvedType === 'multi') {
      Object.entries(components)
        .filter(([, c]) => c.isMulti !== 'false' && c.isMulti !== 'true')
        .forEach(([id, c]) => {
          if (c.isMulti === 'pendingSave') {
            removeComponent(id);
          } else if (c.isMulti === 'pendingDelete') {
            updateComponent(id, { isMulti: 'true' });
          }
        });
    }
    onClose();
    onCancel?.();
  };

  const nameKey = resolvedType ? componentsData[resolvedType]?.nameKey : undefined;
  const componentName = nameKey ? t(`main:${nameKey}`) : t('unknown');

  return (
    <Modal
      opened={isOpen}
      onClose={handleCancel}
      centered
      size={'lg'}
      title={
        <Group gap={'xs'}>
          {icon}
          <Text inherit>
            {component
              ? t('edit-component-title', { name: componentName })
              : t('create-component-title', { name: componentName })}
          </Text>
        </Group>
      }
    >
      <Text size={'sm'} c={'dimmed'} mb={'md'}>
        {t('configure-copy')}
      </Text>
      {renderComponentModal(resolvedType, {
        component,
        componentId,
        initialData,
        onClose,
        onCancel: handleCancel
      })}
    </Modal>
  );
}
