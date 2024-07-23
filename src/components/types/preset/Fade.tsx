import {
  FadeComponent,
  usePropertyStore,
  useOpenSpaceApiStore,
  ConnectionState,
  useComponentStore,
} from '@/store';
import { useEffect, useState } from 'react';
import { triggerFade } from '@/utils/triggerHelpers';
import { Toggle } from '@/store/componentsStore';
import SelectableDropdown from '@/components/common/SelectableDropdown';
// import Autocomplete from '@/components/common/AutoComplete';
import Information from '@/components/common/Information';
import ImageUpload from '@/components/common/ImageUpload';
// import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Textarea } from '@/components/ui/textarea';
import { VirtualizedCombobox } from '@/components/common/VirtualizedCombobox';
import { capitalize } from 'lodash';
import ButtonLabel from '@/components/common/ButtonLabel';

interface FadeGUIProps {
  component: FadeComponent;
  shouldRender?: boolean;
}

const FadeGUIComponent: React.FC<FadeGUIProps> = ({
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
    subscribeToProperty(component.property, 50);
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
          triggerFade(
            component.property,
            component.intDuration,
            component.action,
          );
        },
      });
    }
  }, [
    component.id,
    component.action,
    component.intDuration,
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
      <ButtonLabel>
        <>
          {`${component.gui_name}  ${
            !isNaN(property?.value)
              ? `:  + ${Math.floor(property?.value * 100)}%`
              : ''
          }`}
          <Information content={component.gui_description} />
        </>
      </ButtonLabel>
    </div>
  ) : null;
};

interface FadeModalProps {
  component: FadeComponent | null;
  handleComponentData: (data: Partial<FadeComponent>) => void;
  //   isOpen: boolean;
}

const FadeModal: React.FC<FadeModalProps> = ({
  component,
  handleComponentData,
  //   isOpen,
}) => {
  const connectionState = useOpenSpaceApiStore(
    (state) => state.connectionState,
  );

  const properties = usePropertyStore((state) => state.properties);
  const [property, setProperty] = useState<string>(component?.property || '');
  const [intDuration, setIntDuration] = useState<number>(
    component?.intDuration || 0,
  );
  const [gui_name, setGuiName] = useState<string>(component?.gui_name || '');
  const [gui_description, setGuiDescription] = useState<string>(
    component?.gui_description || '',
  );
  const [action, setAction] = useState<string>(component?.action || 'toggle');
  const [backgroundImage, setBackgroundImage] = useState<string>(
    component?.backgroundImage || '',
  );
  const [lastProperty, setLastProperty] = useState<string>(
    component?.property || '',
  );
  useEffect(() => {
    if (property !== lastProperty) {
      console.log(properties[property]);
      setGuiName(
        `${capitalize(action)} Fade ${property
          .replace(/Scene.|.Renderable|.Opacity/g, '')
          .split('.')
          .pop()}`,
      );
      setLastProperty(property);
    }
    handleComponentData({
      property,
      intDuration,
      action: action as Toggle,
      backgroundImage,
      gui_name,
      gui_description,
    });
  }, [
    property,
    intDuration,
    action,
    backgroundImage,
    gui_name,
    gui_description,
    handleComponentData,
  ]);

  useEffect(() => {
    if (connectionState !== ConnectionState.CONNECTED) return;
  }, []);

  const sortedKeys: Record<string, string> = Object.keys(properties)
    .filter((a) => a.includes('Opacity'))
    .sort((a, b) => {
      const periodCountA = (a.match(/\./g) || []).length;
      const periodCountB = (b.match(/\./g) || []).length;
      if (periodCountA !== periodCountB) {
        return periodCountA - periodCountB;
      }
      return a.localeCompare(b);
    })
    .reduce((acc: Record<string, string>, key) => {
      const newValue = key
        .replace(/Scene.|.Renderable|.Opacity/g, '')
        .replace(/\./g, ' > ')
        .trim();
      acc[newValue] = key;
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
            <Label>Action Type</Label>
            <SelectableDropdown
              options={['toggle', 'on', 'off']}
              selected={action}
              setSelected={setAction}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="duration">Fade Duration</Label>
            <Input
              id="duration"
              placeholder="Duration to Fade"
              type="number"
              // className=""
              value={intDuration}
              onChange={(e) => setIntDuration(parseFloat(e.target.value))}
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

export { FadeModal, FadeGUIComponent };
