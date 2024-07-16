import { SetFocusComponent } from '@/store/componentsStore';
import {
  ConnectionState,
  useOpenSpaceApiStore,
  usePropertyStore,
  useComponentStore,
} from '@/store';
import { useEffect, useState } from 'react';
import Autocomplete from '@/components/common/AutoComplete';
import { getStringBetween } from '@/utils/apiHelpers';
import Information from '@/components/common/Information';
import {
  NavigationAnchorKey,
  NavigationAimKey,
  RetargetAnchorKey,
} from '@/store/apiStore';
import ImageUpload from '@/components/common/ImageUpload';
interface FocusGUIProps {
  component: SetFocusComponent;
  shouldRender?: boolean;
}

const FocusComponent: React.FC<FocusGUIProps> = ({
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
  // const property = usePropertyStore(
  //   (state) => state.properties[component.property],
  // );
  const CurrentAnchor = usePropertyStore(
    (state) => state.properties[NavigationAnchorKey],
  );
  useEffect(() => {
    console.log(CurrentAnchor);
  }, [CurrentAnchor]);

  useEffect(() => {
    if (connectionState !== ConnectionState.CONNECTED) return;
    console.log('Subscribing to property', component.property);
    subscribeToProperty(NavigationAnchorKey, 1000);
    // subscribeToProperty(`Scene.${component.property}`, 1000);
    return () => {
      // unsubscribeFromProperty(`Scene.${component.property}`);
      unsubscribeFromProperty(NavigationAnchorKey);
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
          console.log('Triggering action', component.property);
          luaApi.setPropertyValueSingle(RetargetAnchorKey, null);
          luaApi.setPropertyValueSingle(
            NavigationAnchorKey,
            component.property,
          );
          luaApi.setPropertyValueSingle(NavigationAimKey, '');
        },
      });
    }
  }, [component.id, component.property, luaApi]);

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
      <div className="bg-black bg-opacity-25 p-4 text-white">
        <div className="flex flex-row gap-4">
          <span>{`Current Anchor: ${CurrentAnchor?.value}`}</span>
        </div>
        <div className="flex flex-row gap-4">
          <h1 className="text-2xl"> {component.gui_name}</h1>
          <Information content={component.gui_description} />
        </div>
      </div>
    </div>
  ) : null;
};

interface FocusModalProps {
  component: SetFocusComponent | null;
  handleComponentData: (data: Partial<SetFocusComponent>) => void;
  //   isOpen: boolean;
}

/**
 * FocusModal component.
 * @param {FocusModalProps} component - The component props.
 * @param {Function} handleComponentData - The function to handle component data.
 */

const FocusModal: React.FC<FocusModalProps> = ({
  component,
  handleComponentData,
  //   isOpen,
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
  const [backgroundImage, setBackgroundImage] = useState<string>(
    component?.backgroundImage || '',
  );

  const subscribeToProperty = usePropertyStore(
    (state) => state.subscribeToProperty,
  );
  const unsubscribeFromProperty = usePropertyStore(
    (state) => state.unsubscribeFromProperty,
  );
  // const CurrentAnchor = usePropertyStore(
  //   (state) => state.properties[NavigationAnchorKey],
  // );

  useEffect(() => {
    if (connectionState !== ConnectionState.CONNECTED) return;
    subscribeToProperty(NavigationAnchorKey, 1000);
    return () => {
      unsubscribeFromProperty(NavigationAnchorKey);
    };
  }, [connectionState, subscribeToProperty, unsubscribeFromProperty]);

  // useEffect(() => {
  //   if (CurrentAnchor === undefined) return;
  //   setGuiDescription(CurrentAnchor?.description?.description);
  // }, [CurrentAnchor.description.description]);

  useEffect(() => {
    console.log(backgroundImage);
    handleComponentData({
      property,
      backgroundImage,
      gui_name,
      gui_description,
    });
  }, [
    property,
    backgroundImage,
    gui_name,
    gui_description,
    handleComponentData,
  ]);

  useEffect(() => {
    if (connectionState !== ConnectionState.CONNECTED) return;
  }, []);

  const sortedKeys: Record<string, string> = Object.keys(properties)
    .filter((a) => a.includes('.Renderable'))
    .sort((a, b) => {
      const periodCountA = (a.match(/\./g) || []).length;
      const periodCountB = (b.match(/\./g) || []).length;

      if (periodCountA !== periodCountB) {
        return periodCountA - periodCountB;
      }

      return a.localeCompare(b);
    })
    .reduce((acc: Record<string, string>, key) => {
      const newValue = getStringBetween(key, 'Scene.', '.Renderable');
      acc[newValue] = newValue;
      return acc;
    }, {});

  return (
    <>
      <div className="mb-4">
        <div className="mb-1 flex flex-col gap-2">
          <div className="flex flex-row items-center justify-between gap-8">
            <div className="text-sm font-medium text-black">Property</div>
            <Autocomplete
              options={sortedKeys}
              onChange={(v) => setProperty(sortedKeys[v])}
              initialValue={
                (Object.keys(sortedKeys).find(
                  (key) => key === property,
                ) as string) || ''
              }
            />
          </div>
          <ImageUpload
            value={backgroundImage}
            onChange={(v) => setBackgroundImage(v)}
          />
          <div className="flex flex-row items-center justify-between">
            <div className="text-sm font-medium text-black">Gui Name</div>
            <input
              type="text"
              className="w-[50%] rounded border p-2"
              value={gui_name}
              onChange={(e) => setGuiName(e.target.value)}
            />
          </div>
          <div className="flex flex-row items-center justify-between">
            <div className="text-sm font-medium text-black">
              Gui Description
            </div>
            <input
              type="textbox"
              className="w-[50%] rounded border p-2"
              value={gui_description}
              onChange={(e) => setGuiDescription(e.target.value)}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export { FocusModal, FocusComponent };
