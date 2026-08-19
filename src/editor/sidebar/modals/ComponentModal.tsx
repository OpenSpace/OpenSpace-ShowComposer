import { useTranslation } from 'react-i18next';
import { Group, Modal, Text } from '@mantine/core';

import { componentsData, renderComponentModal } from '@/editor/componentsData';
import { Component, ComponentType } from '@/store';
import { useBoundStore } from '@/store/boundStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCancel?: () => void;
  componentId?: Component['id'] | null;
  type: ComponentType | '';
  initialData?: Partial<Component>;
  icon?: JSX.Element;
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
  const componentName = nameKey ? t(`main:${nameKey}`) : 'Unknown';

  return (
    <Modal
      opened={isOpen}
      onClose={handleCancel}
      centered
      size={510}
      title={
        <Group gap={'xs'}>
          {icon}
          {component
            ? `Edit ${componentName} Component`
            : `Create ${componentName} Component`}
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
