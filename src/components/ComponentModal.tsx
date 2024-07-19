// ComponentModal.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  ComponentType,
  useComponentStore,
  TitleComponent,
  Component,
  SetTimeComponent,
  BooleanComponent,
  FlyToComponent,
  SetFocusComponent,
  TriggerComponent,
  FadeComponent,
  NumberComponent,
  VideoComponent,
  RichTextComponent,
} from '@/store';
import { TitleModal } from './types/static/Title';
import { RichTextModal } from './types/static/RichText';
import { SetTimeModal } from './types/preset/SetTime';
import { FlyToModal } from './types/preset/FlyTo';
import { FadeModal } from './types/preset/Fade';
import { FocusModal } from './types/preset/Focus';
import { BoolModal } from './types/property/Boolean';
import { TriggerModal } from './types/property/Trigger';
import { NumberModal } from './types/property/Number';
import { VideoModal } from './types/static/Video';
import { MultiModal } from './types/preset/Multi';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
  CardTitle,
} from '@/components/ui/card';

// import Button from './common/Button';
import { MultiComponent, allComponentLabels } from '@/store/componentsStore';
interface ComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel?: () => void;
  componentId?: Component['id'] | null;
  type: ComponentType | '';
  isMulti?: boolean;
  initialData?: Partial<Component>;
}
enum AsyncStatus {
  False = 'false',
  True = 'true',
  Pending = 'pending',
}
const ComponentModal: React.FC<ComponentModalProps> = ({
  isOpen,
  onClose,
  onCancel,
  componentId,
  type,
  // isMulti = false,
  initialData = {},
}) => {
  const addComponent = useComponentStore((state) => state.addComponent);
  // const getComponentById = useComponentStore((state) => state.getComponentById);
  const updateComponent = useComponentStore((state) => state.updateComponent);
  const asyncPreSubmitOperation = useComponentStore(
    (state) => state.asyncPreSubmitOperation,
  );
  const [asyncOperationStatus, setAsyncOperationStatus] = useState<AsyncStatus>(
    AsyncStatus.False,
  );

  const components = useComponentStore((state) => state.components);
  const component = componentId ? components[componentId] : null;

  const [componentData, setComponentData] = useState<Partial<Component>>({
    ...initialData,
  });

  useEffect(() => {
    if (asyncOperationStatus == AsyncStatus.Pending && componentData) {
      // handleSubmit();
      setAsyncOperationStatus(AsyncStatus.True);
    }
  }, [asyncOperationStatus, componentData]);

  const handleSubmit = useCallback(async () => {
    if (componentId) {
      if (useComponentStore.getState().asyncPreSubmitOperation) {
        await useComponentStore
          .getState()
          .executeAndResetAsyncPreSubmitOperation();
        setAsyncOperationStatus(AsyncStatus.Pending);
      } else {
        if (component) {
          if (component.type == 'multi') {
            Object.entries(components)
              .filter(
                ([_id, c], _i) => c.isMulti !== 'false' && c.isMulti !== 'true',
              )
              .forEach(([id, c]) => {
                if (c.isMulti === 'pendingSave') {
                  updateComponent(id, { isMulti: 'true' });
                } else if (c.isMulti === 'pendingDelete') {
                  updateComponent(id, { isMulti: 'false' });
                }
              });
          }
          console.log('UPDATING COMPONENT: ', componentId, componentData);
          updateComponent(componentId, {
            ...componentData,
          });
        } else {
          addComponent({
            id: componentId,
            type: type || 'default',
            isMulti: initialData.isMulti || 'false',
            x: 0,
            y: 0,
            minWidth: 50,
            minHeight: 50,
            width: 300,
            height: 175,
            gui_description: '',
            gui_name: '',
            ...componentData,
          });
          if (type == 'multi') {
            Object.entries(components)
              .filter(
                ([_id, c], _i) => c.isMulti !== 'false' && c.isMulti !== 'true',
              )
              .forEach(([id, c]) => {
                if (c.isMulti === 'pendingSave') {
                  updateComponent(id, { isMulti: 'true' });
                } else if (c.isMulti === 'pendingDelete') {
                  updateComponent(id, { isMulti: 'false' });
                }
              });
          }
        }
        onClose();
      }
    }
  }, [componentData, component, asyncPreSubmitOperation]);

  useEffect(() => {
    if (asyncOperationStatus == AsyncStatus.True) {
      handleSubmit();
      setAsyncOperationStatus(AsyncStatus.False);
    }
  }, [asyncOperationStatus, handleSubmit]);

  const handleCancel = () => {
    if ((component ? component.type : type) == 'multi') {
      Object.entries(components)
        .filter(([_id, c], _i) => c.isMulti !== 'false' && c.isMulti !== 'true')
        .forEach(([id, c]) => {
          if (c.isMulti === 'pendingSave') {
            updateComponent(id, { isMulti: 'false' });
          } else if (c.isMulti === 'pendingDelete') {
            updateComponent(id, { isMulti: 'true' });
          }
        });
    }
    onCancel && onCancel();
    onClose();
  };

  let content;
  switch (component ? component.type : type) {
    case 'title':
      content = (
        <TitleModal
          component={component as TitleComponent}
          isOpen={isOpen}
          handleComponentData={setComponentData}
        />
      );
      break;
    case 'settime':
      content = (
        <SetTimeModal
          component={component as SetTimeComponent}
          isOpen={isOpen}
          handleComponentData={setComponentData}
        />
      );
      break;
    case 'flyto':
      content = (
        <FlyToModal
          component={component as FlyToComponent}
          isOpen={isOpen}
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
    // case 'image':
    //   content = <ImageComponent component={component} />;
    //   break;
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
    default:
      content = <div>Unknown component type</div>;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <Card className="w-[510px] bg-white">
        <CardHeader>
          <CardTitle>
            {component
              ? `Edit ${
                  allComponentLabels.find((c) => c.value == component.type)
                    ?.label || 'Component'
                } Component`
              : `Create ${
                  allComponentLabels.find((c) => c.value == type)?.label ||
                  'Component'
                } Component`}
          </CardTitle>
          <CardDescription>
            Configure you component and add it to the workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>{content}</CardContent>
        <CardFooter>
          <div className="flex w-full flex-row justify-end gap-2">
            <Button variant={'outline'} onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {component ? 'Save' : 'Create'}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ComponentModal;
