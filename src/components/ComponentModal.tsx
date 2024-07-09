// ComponentModal.tsx
import React, { useCallback, useState } from 'react';
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
} from '@/store';
import { toTitleCase } from '@/utils/math';
import { TitleModal } from './types/static/Title';
import { SetTimeModal } from './types/preset/SetTime';
import { FlyToModal } from './types/preset/FlyTo';
import { FadeModal } from './types/preset/Fade';
import { FocusModal } from './types/preset/Focus';
import { BoolModal } from './types/property/Boolean';
import { TriggerModal } from './types/property/Trigger';
import { NumberModal } from './types/property/Number';
import Button from './common/Button';

interface ComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
  componentId?: string | null;
  type: ComponentType | '';
}

const ComponentModal: React.FC<ComponentModalProps> = ({
  isOpen,
  onClose,
  componentId,
  type,
}) => {
  const addComponent = useComponentStore((state) => state.addComponent);
  const updateComponent = useComponentStore((state) => state.updateComponent);
  // const removeComponent = useComponentStore((state) => state.removeComponent);
  const component = useComponentStore((state) =>
    state.components.find((c) => c.id === componentId),
  );

  const [componentData, setComponentData] = useState<Partial<Component>>({});

  const handleSubmit = useCallback(() => {
    if (componentId) {
      if (component) {
        console.log('componentData', componentData);
        updateComponent(componentId, {
          ...componentData,
        });
      } else {
        addComponent({
          id: componentId,
          type: type || 'default',
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
      }
    }
    onClose();
  }, [componentData, component]);

  const handleCancel = () => {
    // if (component) {
    //   removeComponent(componentId!);
    // }
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
    // case 'video':
    //   content = <VideoComponent component={component} />;
    //   break;
    default:
      content = <div>Unknown component type</div>;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-auto min-w-[600px] rounded bg-white p-4 shadow-lg">
        <h2 className="mb-4 text-xl">
          {component
            ? `Edit ${toTitleCase(component.type)} Component`
            : `Create ${toTitleCase(type)} Component`}
        </h2>

        {content}
        <div className="flex justify-end">
          <Button
            width="auto"
            className="mr-2 rounded bg-gray-500 p-2 text-white"
            onClick={handleCancel}
            text="Cancel"
          />

          <Button
            width="auto"
            // className="rounded bg-blue-500 p-2 text-white"
            onClick={handleSubmit}
            text={component ? 'Save' : 'Create'}
          />
        </div>
      </div>
    </div>
  );
};

export default ComponentModal;
