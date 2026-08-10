import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Group, Modal, Text } from '@mantine/core';

import { ActionTriggerModal } from '@/editor/sidebar/modals/preset/ActionTriggerModal';
import { FadeModal } from '@/editor/sidebar/modals/preset/FadeModal';
import { FlyToModal } from '@/editor/sidebar/modals/preset/FlyToModal';
import { FocusModal } from '@/editor/sidebar/modals/preset/FocusModal';
import { MultiModal } from '@/editor/sidebar/modals/preset/MultiModal';
import { PageModal } from '@/editor/sidebar/modals/preset/PageModal';
import { ScriptModal } from '@/editor/sidebar/modals/preset/ScriptModal';
import { SessionPlaybackModal } from '@/editor/sidebar/modals/preset/SessionPlaybackModal';
import { SetNavModal } from '@/editor/sidebar/modals/preset/SetNavigationModal';
import { SetTimeModal } from '@/editor/sidebar/modals/preset/SetTimeModal';
import { BoolModal } from '@/editor/sidebar/modals/property/BooleanModal';
import { NumberModal } from '@/editor/sidebar/modals/property/NumberModal';
import { TriggerModal } from '@/editor/sidebar/modals/property/TriggerModal';
import { ImageModal } from '@/editor/sidebar/modals/static/ImageModal';
import { RichTextModal } from '@/editor/sidebar/modals/static/RichText/RichTextModal';
import { TitleModal } from '@/editor/sidebar/modals/static/TitleModal';
import { VideoModal } from '@/editor/sidebar/modals/static/VideoModal';
import {
  BooleanComponent,
  Component,
  ComponentType,
  FadeComponent,
  FlyToComponent,
  NumberComponent,
  RichTextComponent,
  SetFocusComponent,
  SetTimeComponent,
  TitleComponent,
  TriggerComponent,
  VideoComponent
} from '@/store';
import { useBoundStore } from '@/store/boundStore';
import {
  ActionTriggerComponent,
  allComponentLabels,
  ImageComponent,
  MultiComponent,
  PageComponent,
  ScriptComponent,
  SessionPlaybackComponent,
  SetNavComponent
} from '@/types/components';

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
  const { t } = useTranslation('component-modal');
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
          isDisabled: false,
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

  let content;
  switch (component ? component.type : type) {
    case 'title':
      content = (
        <TitleModal
          component={component as TitleComponent}
          handleComponentData={setComponentData}
        />
      );
      break;
    case 'settime':
      content = (
        <SetTimeModal
          component={component as SetTimeComponent}
          handleComponentData={setComponentData}
        />
      );
      break;
    case 'setnavstate':
      content = (
        <SetNavModal
          component={component as SetNavComponent}
          handleComponentData={setComponentData}
        />
      );
      break;
    case 'flyto':
      content = (
        <FlyToModal
          component={component as FlyToComponent}
          handleComponentData={setComponentData}
        />
      );
      break;
    case 'fade':
      content = (
        <FadeModal
          component={component as FadeComponent}
          handleComponentData={setComponentData}
        />
      );
      break;
    case 'setfocus':
      content = (
        <FocusModal
          component={component as SetFocusComponent}
          handleComponentData={setComponentData}
        />
      );
      break;
    case 'boolean':
      content = (
        <BoolModal
          component={component as BooleanComponent}
          handleComponentData={setComponentData}
        />
      );
      break;
    case 'number':
      content = (
        <NumberModal
          component={component as NumberComponent}
          handleComponentData={setComponentData}
        />
      );
      break;
    case 'trigger':
      content = (
        <TriggerModal
          component={component as TriggerComponent}
          handleComponentData={setComponentData}
        />
      );
      break;
    case 'image':
      content = (
        <ImageModal
          component={component as ImageComponent}
          handleComponentData={setComponentData}
        />
      );
      break;
    case 'video':
      content = (
        <VideoModal
          component={component as VideoComponent}
          handleComponentData={setComponentData}
        />
      );
      break;
    case 'richtext':
      content = (
        <RichTextModal
          component={component as RichTextComponent}
          handleComponentData={setComponentData}
        />
      );
      break;
    case 'multi':
      content = (
        <MultiModal
          component={component as MultiComponent}
          handleComponentData={setComponentData}
        />
      );
      break;
    case 'sessionplayback':
      content = (
        <SessionPlaybackModal
          component={component as SessionPlaybackComponent}
          handleComponentData={setComponentData}
        />
      );
      break;
    case 'page':
      content = (
        <PageModal
          component={component as PageComponent}
          handleComponentData={setComponentData}
        />
      );
      break;
    case 'action':
      content = (
        <ActionTriggerModal
          component={component as ActionTriggerComponent}
          handleComponentData={setComponentData}
        />
      );
      break;
    case 'script':
      content = (
        <ScriptModal
          component={component as ScriptComponent}
          handleComponentData={setComponentData}
        />
      );
      break;
    default:
      content = <Text>{t('unknown-component-type')}</Text>;
  }

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
            ? `Edit ${
                allComponentLabels.find((c) => c.value == component.type)?.label ||
                'Component'
              } Component`
            : `Create ${
                allComponentLabels.find((c) => c.value == type)?.label || 'Component'
              } Component`}
        </Group>
      }
    >
      <Text size={'sm'} c={'dimmed'} mb={'md'}>
        {t('configure-copy')}
      </Text>
      {content}
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
