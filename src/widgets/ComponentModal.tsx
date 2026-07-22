import { useCallback, useEffect, useState } from 'react';
import { Button, Group, Modal, Text } from '@mantine/core';

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
import { getCopy } from '@/utils/copyHelpers';
import { ActionTriggerModal } from '@/widgets/preset/ActionTrigger';
import { FadeModal } from '@/widgets/preset/Fade';
import { FlyToModal } from '@/widgets/preset/FlyTo';
import { FocusModal } from '@/widgets/preset/Focus';
import { MultiModal } from '@/widgets/preset/Multi';
import { PageModal } from '@/widgets/preset/Page';
import { ScriptModal } from '@/widgets/preset/Script';
import { SessionPlaybackModal } from '@/widgets/preset/SessionPlayback';
import { SetNavModal } from '@/widgets/preset/SetNavigation';
import { SetTimeModal } from '@/widgets/preset/SetTime';
import { BoolModal } from '@/widgets/property/Boolean';
import { NumberModal } from '@/widgets/property/Number';
import { TriggerModal } from '@/widgets/property/Trigger';
import { ImageModal } from '@/widgets/static/Image';
import { RichTextModal } from '@/widgets/static/RichText/RichText';
import { TitleModal } from '@/widgets/static/Title';
import { VideoModal } from '@/widgets/static/Video';

interface ComponentModalProps {
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
export default function ComponentModal({
  isOpen,
  onClose,
  onCancel,
  componentId,
  type,
  initialData = {},
  icon
}: ComponentModalProps) {
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
      content = <Text>{getCopy('ComponentModal', 'unknown_component_type')}</Text>;
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
        {getCopy('ComponentModal', 'configure_copy')}
      </Text>
      {content}
      <Group justify={'flex-end'} mt={'md'}>
        <Button variant={'default'} onClick={handleCancel}>
          {getCopy('ComponentModal', 'cancel')}
        </Button>
        <Button variant={'filled'} onClick={handleSubmit}>
          {component
            ? getCopy('ComponentModal', 'save')
            : getCopy('ComponentModal', 'create')}
        </Button>
      </Group>
    </Modal>
  );
}
