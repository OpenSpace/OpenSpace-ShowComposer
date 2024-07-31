import { SetFocusComponent } from '@/store/componentsStore';
import {
  ConnectionState,
  useOpenSpaceApiStore,
  usePropertyStore,
  useComponentStore,
} from '@/store';
import { useEffect, useState } from 'react';
import { getStringBetween } from '@/utils/apiHelpers';
import Information from '@/components/common/Information';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Textarea } from '@/components/ui/textarea';
import { VirtualizedCombobox } from '@/components/common/VirtualizedCombobox';
import {
  NavigationAnchorKey,
  NavigationAimKey,
  RetargetAnchorKey,
} from '@/store/apiStore';
import ImageUpload from '@/components/common/ImageUpload';
import ButtonLabel from '@/components/common/ButtonLabel';
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
      <ButtonLabel>
        <div className="flex flex-col gap-2">
          {component.gui_name}
          {CurrentAnchor?.value && (
            <p>{`Current Anchor: ${CurrentAnchor?.value}`}</p>
          )}
          <Information content={component.gui_description} />
        </div>
      </ButtonLabel>
    </div>
  ) : null;
};

interface FocusModalProps {
  component: SetFocusComponent | null;
  handleComponentData: (data: Partial<SetFocusComponent>) => void;
  //   isOpen: boolean;
}

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
  const [lastProperty, setLastProperty] = useState<string>(
    component?.property || '',
  );
  const subscribeToProperty = usePropertyStore(
    (state) => state.subscribeToProperty,
  );
  const unsubscribeFromProperty = usePropertyStore(
    (state) => state.unsubscribeFromProperty,
  );
  const CurrentAnchor = usePropertyStore(
    (state) => state.properties[NavigationAnchorKey],
  );

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
    if (property !== lastProperty) {
      console.log(CurrentAnchor);
      setGuiName(`Focus on ${property}`);
      setGuiDescription(
        `Focus on ${property}. ${CurrentAnchor?.description.description}`,
      );
      setLastProperty(property);
    }
  }, [property, CurrentAnchor]);
  useEffect(() => {
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
      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="grid gap-2">
            <div className="text-sm font-medium text-black">Property</div>
            <VirtualizedCombobox
              options={Object.keys(sortedKeys)}
              selectOption={(v: string) => setProperty(sortedKeys[v])}
              selectedOption={
                (Object.keys(sortedKeys).find(
                  (key) => key === property,
                ) as string) || ''
              }
              searchPlaceholder="Search the Scene..."
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="gioname">Component Name</Label>
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
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="description"> Background Image</Label>
            <ImageUpload
              value={backgroundImage}
              onChange={(v) => setBackgroundImage(v)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description"> Gui Description</Label>
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

export { FocusModal, FocusComponent };
