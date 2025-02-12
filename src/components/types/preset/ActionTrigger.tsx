import { VirtualizedCombobox } from '@/components/common/VirtualizedCombobox';
import { useOpenSpaceApiStore } from '@/store';
import { usePropertyStore } from '@/store';
import { getCopy } from '@/utils/copyHelpers';
import { ActionTriggerComponent } from '@/store/ComponentTypes';
import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ImageUpload from '@/components/common/ImageUpload';
import { Input } from '@/components/ui/input';
import ToggleComponent from '@/components/common/Toggle';
import Information from '@/components/common/Information';
import { useBoundStore } from '@/store/boundStore';
import { triggerAction } from '@/utils/triggerHelpers';
import ComponentContainer from '@/components/common/ComponentContainer';
import ButtonLabel from '@/components/common/ButtonLabel';
import { ComponentBaseColors } from '@/store/ComponentTypes';
import ColorPickerComponent from '@/components/common/ColorPickerComponent';

interface ActionTriggerModalProps {
  component: ActionTriggerComponent | null;
  handleComponentData: (data: Partial<ActionTriggerComponent>) => void;
}

const ActionTriggerModal: React.FC<ActionTriggerModalProps> = ({
  component,
  handleComponentData,
}) => {
  const [action, setAction] = useState<string>(component?.action || '');
  const [gui_name, setGuiName] = useState<string>(component?.gui_name || '');
  const [lockName, setLockName] = useState<boolean>(
    component?.lockName || false,
  );
  const [gui_description, setGuiDescription] = useState<string>(
    component?.gui_description || '',
  );
  const [backgroundImage, setBackgroundImage] = useState<string>(
    component?.backgroundImage || '',
  );

  const [color, setColor] = useState<string>(
    component?.color || ComponentBaseColors.action,
  );

  const actions = usePropertyStore((state) => state.actions);

  const handleActionChange = (action: Record<string, any>) => {
    console.log(action);
    setAction(action.Identifier);
    if (!lockName) {
      setGuiName(action.Name);
    }
    setGuiDescription(action.Documentation);
  };

  useEffect(() => {
    handleComponentData({
      action,
      backgroundImage,
      lockName,
      gui_name,
      gui_description,
      color,
    });
  }, [
    action,
    backgroundImage,
    gui_name,
    gui_description,
    lockName,
    color,
    handleComponentData,
  ]);

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="grid gap-2">
          <div className="text-sm font-medium text-black">
            {getCopy('Action', 'action')}
          </div>
          <VirtualizedCombobox
            options={Object.keys(actions)}
            selectOption={(v: string) => handleActionChange(actions[v])}
            selectedOption={
              Object.keys(actions).find(
                (key) => actions[key].Identifier === action,
              ) || ''
            }
            searchPlaceholder="Search the Actions..."
            delimiter="/"
          />
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-3 grid gap-2">
            <Label htmlFor="gioname">
              {getCopy('Focus', 'component_name')}
            </Label>
            <Input
              id="guiname"
              placeholder="Name of Component"
              type="text"
              value={gui_name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setGuiName(e.target.value)
              }
            />
          </div>
          <div className="cols-span-1 mt-6 grid gap-2">
            <ToggleComponent
              label="Lock Name"
              value={lockName}
              setValue={setLockName}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="description">Background Color</Label>
            <div className="flex flex-row gap-2">
              <ColorPickerComponent color={color} setColor={setColor} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">
              {getCopy('Focus', 'background_image')}
            </Label>
            <ImageUpload
              value={backgroundImage}
              onChange={(v) => setBackgroundImage(v)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">
              {getCopy('Focus', 'gui_description')}
            </Label>
            <Textarea
              className="w-full"
              id="description"
              value={gui_description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setGuiDescription(e.target.value)
              }
              placeholder="Type your descriptionhere."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface ActionTriggerGUIProps {
  component: ActionTriggerComponent;
  shouldRender?: boolean;
}

const ActionTriggerGUIComponent: React.FC<ActionTriggerGUIProps> = ({
  component,
  shouldRender = true,
}) => {
  const luaApi = useOpenSpaceApiStore((state) => state.luaApi);

  const updateComponent = useBoundStore((state) => state.updateComponent);

  useEffect(() => {
    if (luaApi) {
      updateComponent(component.id, {
        triggerAction: () => {
          triggerAction(component.action);
        },
        isDisabled: false,
      });
    } else {
      updateComponent(component.id, {
        isDisabled: true,
      });
    }
  }, [component.id, component.action, luaApi]);

  if (!shouldRender) return null;

  return (
    <ComponentContainer
      backgroundImage={component.backgroundImage}
      backgroundColor={component.color}
      onClick={() => {
        component.triggerAction?.();
      }}
    >
      {component.gui_name || component.gui_description ? (
        <ButtonLabel>
          <div className="flex flex-row gap-2">
            {component.gui_name}
            <Information content={component.gui_description} />
          </div>
        </ButtonLabel>
      ) : null}
    </ComponentContainer>
  );
};

export { ActionTriggerGUIComponent, ActionTriggerModal };
