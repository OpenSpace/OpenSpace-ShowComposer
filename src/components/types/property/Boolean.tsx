import { useEffect, useState } from 'react';
import {
  useOpenSpaceApiStore,
  useComponentStore,
  usePropertyStore,
  BooleanComponent,
  Toggle,
  ConnectionState,
} from '@/store';
import Autocomplete from '@/components/common/AutoComplete';
import SelectableDropdown from '@/components/common/SelectableDropdown';
import Information from '@/components/common/Information';
import { triggerBool } from '@/utils/triggerHelpers';
import ImageUpload from '@/components/common/ImageUpload';

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
    console.log('Subscribing to property', component.property);
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
      console.log('Registering trigger action');
      console.log(component);
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
    <div
      className="absolute right-0 top-0 flex h-full w-full items-center justify-center hover:cursor-pointer"
      style={{
        //cover and center the background image
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundImage: `url(${component.backgroundImage})`,
      }}
      onClick={() => component.triggerAction?.()}
    >
      <div className="flex flex-row gap-4">
        <span
          style={{
            color: `rgba(0,0,0,${property?.value})`,
            borderColor: 'black',
            fontSize: 64,
          }}
        >
          •
        </span>
        <span>{`Current State: ${property?.value ? 'True ' : 'False'}`}</span>
      </div>
      <div className="flex flex-row gap-4">
        <h1 className="text-2xl"> {component.gui_name}</h1>
        <Information content={component.gui_description} />
      </div>
    </div>
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

  const properties = usePropertyStore((state) => state.properties);
  const [property, setProperty] = useState<string>(component?.property || '');

  const [gui_name, setGuiName] = useState<string>(component?.gui_name || '');
  const [gui_description, setGuiDescription] = useState<string>(
    component?.gui_description || '',
  );
  const [action, setAction] = useState<string>(component?.action || 'on');
  const [backgroundImage, setBackgroundImage] = useState<string>(
    component?.backgroundImage || '',
  );
  useEffect(() => {
    handleComponentData({
      property,
      action: action as Toggle,
      gui_name,
      gui_description,
      backgroundImage,
    });
  }, [
    property,
    action,
    gui_name,
    gui_description,
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
      //   const newValue = key
      // .replace(/Scene.|.Renderable|.Opacity/g, '')
      // .replace(/\./g, ' > ')
      // .trim();
      const newValue = key;
      acc[newValue] = key;
      return acc;
    }, {});

  return (
    <div className="mb-4">
      <div className="mb-1 flex flex-col gap-2">
        <div className="flex flex-row items-center justify-between gap-8">
          <div className="text-sm font-medium text-black">Property</div>
          <Autocomplete
            options={sortedKeys}
            onChange={(v) => setProperty(sortedKeys[v])}
            initialValue={
              Object.keys(sortedKeys).find(
                (key) => sortedKeys[key] === property,
              ) as string
            }
          />
        </div>
        <div className="flex flex-row items-center justify-between">
          <div className="text-sm font-medium text-black">Action Type</div>
          <div className="w-[50%]">
            <SelectableDropdown
              options={['toggle', 'on', 'off']}
              selected={action}
              setSelected={setAction}
            />
          </div>
        </div>
        <div className="flex flex-row items-center justify-between">
          <div className="text-sm font-medium text-black">Gui Name</div>
          <input
            type="text"
            className="w-[50%] rounded border p-2"
            value={gui_name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setGuiName(e.target.value)
            }
          />
        </div>
        <div className="flex flex-row items-center justify-between">
          <div className="text-sm font-medium text-black">Gui Description</div>
          <input
            type="textbox"
            className="w-[50%] rounded border p-2"
            value={gui_description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setGuiDescription(e.target.value)
            }
          />
        </div>
        <ImageUpload
          value={backgroundImage}
          onChange={(v) => setBackgroundImage(v)}
        />
      </div>
    </div>
  );
};

export { BoolModal, BoolGUIComponent };
