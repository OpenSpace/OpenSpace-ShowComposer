import { useEffect, useState } from 'react';
import { getCopy } from '@/utils/copyHelpers';
import {
  useOpenSpaceApiStore,
  useComponentStore,
  usePropertyStore,
  BooleanComponent,
  Toggle,
  ConnectionState,
} from '@/store';
import SelectableDropdown from '@/components/common/SelectableDropdown';
import Information from '@/components/common/Information';
import { triggerBool } from '@/utils/triggerHelpers';
import ImageUpload from '@/components/common/ImageUpload';
import { VirtualizedCombobox } from '@/components/common/VirtualizedCombobox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ButtonLabel from '@/components/common/ButtonLabel';
import { formatName } from '@/utils/apiHelpers';
import { capitalize } from 'lodash';
import ComponentContainer from '@/components/common/ComponentContainer';
import ToggleComponent from '@/components/common/Toggle';
import { useShallow } from 'zustand/react/shallow';

interface BoolGUIProps {
  component: BooleanComponent;
  shouldRender?: boolean;
}
const BoolGUIComponent: React.FC<BoolGUIProps> = ({
  component,
  shouldRender = true,
}) => {
  const luaApi = useOpenSpaceApiStore((state) => state.luaApi);
  const connectionState = useOpenSpaceApiStore(
    (state) => state.connectionState,
  );
  const updateComponent = useComponentStore((state) => state.updateComponent);
  const subscribeToProperty = usePropertyStore(
    (state) => state.subscribeToProperty,
  );
  const unsubscribeFromProperty = usePropertyStore(
    (state) => state.unsubscribeFromProperty,
  );
  const property = usePropertyStore(
    (state) => state.properties[component.property],
  );
  useEffect(() => {
    if (connectionState !== ConnectionState.CONNECTED) return;
    // console.log('Subscribing to property', component.property);
    subscribeToProperty(component.property, 500);
    return () => {
      unsubscribeFromProperty(component.property);
    };
  }, [
    component.property,
    connectionState,
    subscribeToProperty,
    unsubscribeFromProperty,
  ]);
  useEffect(() => {
    if (luaApi) {
      // console.log('Registering trigger action');
      updateComponent(component.id, {
        triggerAction: () => {
          triggerBool(component.property, component.action);
        },
      });
    }
  }, [
    component.id,
    component.action,
    component.action,
    component.property,
    luaApi,
  ]);
  return shouldRender ? (
    <ComponentContainer
      className={`${
        property?.value == 1
          ? 'outline-green-500'
          : property?.value == 0
            ? 'outline-red-500'
            : 'outline-grey-500'
      } outline  outline-4 outline-offset-2 transition-[outline-color] duration-300 `}
      backgroundImage={component.backgroundImage}
      style={{
        top: '4px',
        left: '4px',
        width: 'calc(100% - 8px)', // Adjust width to account for outline width and offset
        height: 'calc(100% - 8px)', // Adjust height to account for outline width and offset
      }}
      onClick={() => {
        component.triggerAction?.();
      }}
    >
      <ButtonLabel>
        <div className="flex gap-2">
          {component.gui_name}
          <Information content={component.gui_description} />
        </div>
      </ButtonLabel>
    </ComponentContainer>
  ) : null;
};
interface BoolModalProps {
  component: BooleanComponent | null;
  handleComponentData: (data: Partial<BooleanComponent>) => void;
}
const BoolModal: React.FC<BoolModalProps> = ({
  component,
  handleComponentData,
}) => {
  const connectionState = useOpenSpaceApiStore(
    (state) => state.connectionState,
  );
  const properties = usePropertyStore(useShallow((state) => state.properties));
  const [property, setProperty] = useState<string>(component?.property || '');
  const [gui_name, setGuiName] = useState<string>(component?.gui_name || '');
  const [gui_description, setGuiDescription] = useState<string>(
    component?.gui_description || '',
  );
  const [lockName, setLockName] = useState<boolean>(
    component?.lockName || false,
  );
  const [action, setAction] = useState<string>(component?.action || 'toggle');
  const [backgroundImage, setBackgroundImage] = useState<string>(
    component?.backgroundImage || '',
  );
  useEffect(() => {
    // console.log(properties);
    const propertyData = usePropertyStore.getState().properties[property];
    if (!propertyData || lockName) return;
    setGuiName(`${formatName(propertyData.uri)} > ${capitalize(action)}`);
    setGuiDescription(propertyData.description.description);
  }, [property, action]);
  useEffect(() => {
    handleComponentData({
      property,
      action: action as Toggle,
      gui_name,
      gui_description,
      lockName,
      backgroundImage,
    });
  }, [
    property,
    action,
    gui_name,
    gui_description,
    lockName,
    handleComponentData,
    backgroundImage,
  ]);
  useEffect(() => {
    if (connectionState !== ConnectionState.CONNECTED) return;
  }, []);
  const sortedKeys: Record<string, string> = Object.keys(properties)
    .filter((a) => properties[a].type === 'Bool')
    .sort((a, b) => {
      const periodCountA = (a.match(/\./g) || []).length;
      const periodCountB = (b.match(/\./g) || []).length;
      if (periodCountA !== periodCountB) {
        return periodCountA - periodCountB;
      }
      return a.localeCompare(b);
    })
    .reduce((acc: Record<string, string>, key) => {
      const newValue = formatName(key);
      acc[newValue] = key;
      return acc;
    }, {});
  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="grid gap-2">
            <div className="text-sm font-medium text-black">
              {getCopy('Boolean', 'property')}
            </div>
            <VirtualizedCombobox
              options={Object.keys(sortedKeys)}
              selectOption={(v: string) => setProperty(sortedKeys[v])}
              selectedOption={
                Object.keys(sortedKeys).find(
                  (key) => sortedKeys[key] === property,
                ) || ''
              }
              searchPlaceholder="Search the Scene..."
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>{getCopy('Boolean', 'action_type')}</Label>
            <SelectableDropdown
              options={['toggle', 'on', 'off']}
              selected={action}
              setSelected={setAction}
            />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <div className="col-span-3 grid gap-2">
            <Label htmlFor="gioname">
              {getCopy('Boolean', 'component_name')}
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
          <div className="col-span-1 mt-6 grid gap-2">
            <ToggleComponent
              label="Lock Name"
              value={lockName}
              setValue={setLockName}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <ImageUpload
            value={backgroundImage}
            onChange={(v) => setBackgroundImage(v)}
          />
          <div className="grid gap-2">
            <Label htmlFor="description">
              {getCopy('Boolean', 'gui_description')}
            </Label>
            <Textarea
              className="w-full"
              id="description"
              value={gui_description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setGuiDescription(e.target.value)
              }
              placeholder="Type your message here."
            />
          </div>
        </div>
      </div>
    </>
  );
};
export { BoolModal, BoolGUIComponent };
