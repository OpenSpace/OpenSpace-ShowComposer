import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Group, Modal, Text } from '@mantine/core';

import { componentsData, renderComponentModal } from '@/editor/componentsData';
import { Component, ComponentType } from '@/store';
import { useBoundStore } from '@/store/boundStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCancel?: () => void;
  componentId?: Component['id'] | null;
  type: ComponentType | '';
  isMulti?: boolean;
  initialData?: Partial<Component>;
  icon?: JSX.Element;
}
enum AsyncStatus {
  False = 'false',
  True = 'true',
  Pending = 'pending'
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
  const addComponent = useBoundStore((state) => state.addComponent);
  const updateComponent = useBoundStore((state) => state.updateComponent);
  const removeComponent = useBoundStore((state) => state.removeComponent);
  const asyncPreSubmitOperation = useBoundStore((state) => state.asyncPreSubmitOperation);
  const resetAsyncPreSubmitOperation = useBoundStore(
    (state) => state.resetAsyncPreSubmitOperation
  );
  const executeAndResetAsyncPreSubmitOperation = useBoundStore(
    (state) => state.executeAndResetAsyncPreSubmitOperation
  );
  const [asyncOperationStatus, setAsyncOperationStatus] = useState<AsyncStatus>(
    AsyncStatus.False
  );
  const components = useBoundStore((state) => state.components);
  const component = componentId ? components[componentId] : null;
  const [componentData, setComponentData] = useState<Partial<Component>>({
    ...initialData
  });

  useEffect(() => {
    if (asyncOperationStatus == AsyncStatus.Pending && componentData) {
      setAsyncOperationStatus(AsyncStatus.True);
    }
  }, [componentData]);

  const handleSubmit = useCallback(async () => {
    if (componentId) {
      if (asyncPreSubmitOperation) {
        await executeAndResetAsyncPreSubmitOperation();
        setAsyncOperationStatus(AsyncStatus.Pending);
        return; // Exit the current execution
      }
      if (component) {
        if (component.type == 'multi') {
          Object.entries(components)
            .filter(([, c]) => c.isMulti !== 'false' && c.isMulti !== 'true')
            .forEach(([id, c]) => {
              if (c.isMulti === 'pendingSave') {
                updateComponent(id, {
                  isMulti: 'true'
                });
              } else if (c.isMulti === 'pendingDelete') {
                removeComponent(id);
              }
            });
        }
        updateComponent(componentId, {
          ...componentData
        });
      } else {
        addComponent({
          id: componentId,
          type: type || 'default',
          isMulti: initialData.isMulti || 'false',
          gui_description: '',
          gui_name: '',
          ...componentData
        });

        if (type == 'multi') {
          Object.entries(components)
            .filter(([, c]) => c.isMulti !== 'false' && c.isMulti !== 'true')
            .forEach(([id, c]) => {
              if (c.isMulti === 'pendingSave') {
                updateComponent(id, {
                  isMulti: 'true'
                });
              } else if (c.isMulti === 'pendingDelete') {
                removeComponent(id);
              }
            });
        }
      }
      onClose();
    }
  }, [componentData, component, asyncPreSubmitOperation]);

  useEffect(() => {
    if (asyncOperationStatus == AsyncStatus.True) {
      handleSubmit();
      setAsyncOperationStatus(AsyncStatus.False);
    }
  }, [asyncOperationStatus]);

  const handleCancel = () => {
    if ((component ? component.type : type) == 'multi') {
      Object.entries(components)
        .filter(([, c]) => c.isMulti !== 'false' && c.isMulti !== 'true')
        .forEach(([id, c]) => {
          if (c.isMulti === 'pendingSave') {
            removeComponent(id);
          } else if (c.isMulti === 'pendingDelete') {
            updateComponent(id, {
              isMulti: 'true'
            });
          }
        });
    }
    resetAsyncPreSubmitOperation();
    onClose();
    if (onCancel) onCancel();
  };

  const resolvedType = component ? component.type : type;
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
      {renderComponentModal(resolvedType, component, setComponentData)}
      <Group justify={'flex-end'} mt={'md'}>
        <Button variant={'default'} onClick={handleCancel}>
          {t('cancel')}
        </Button>
        <Button variant={'filled'} onClick={handleSubmit}>
          {component ? t('save') : t('create')}
        </Button>
      </Group>
    </Modal>
  );
}
