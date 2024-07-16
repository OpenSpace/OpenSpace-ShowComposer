import { useEffect, useState } from 'react';
import {
  useOpenSpaceApiStore,
  useComponentStore,
  usePropertyStore,
  NumberComponent,
  ConnectionState,
} from '@/store';
import Autocomplete from '@/components/common/AutoComplete';
// import SelectableDropdown from '@/components/common/SelectableDropdown';
import Information from '@/components/common/Information';
import { triggerNumber } from '@/utils/triggerHelpers';
import Slider from '@/components/inputs/Slider';
import ImageUpload from '@/components/common/ImageUpload';

interface NumberGUIProps {
  component: NumberComponent;
}

const NumberGUIComponent: React.FC<NumberGUIProps> = ({ component }) => {
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
        triggerAction: (_value: number) => {
          triggerNumber(component.property, _value);
        },
      });
    }
  }, [component.id, component.property, luaApi]);

  return (
    <div className="absolute right-0 top-0 flex h-full w-full flex-col items-center justify-center hover:cursor-pointer">
      <div className="flex flex-row gap-4">
        <span>{`Current Value: ${property?.value}`}</span>
      </div>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl"> {component.gui_name}</h1>
        <div className="flex flex-row items-center justify-between">
          <div className="text-sm font-medium text-black">Set Value</div>
          <Slider
            value={property?.value}
            min={component.min}
            max={component.max}
            step={component.step}
            onChange={(v) => component.triggerAction?.(v)}
          />
        </div>
        <Information content={component.gui_description} />
      </div>
    </div>
  );
};

interface NumberModalProps {
  component: NumberComponent | null;
  handleComponentData: (data: Partial<NumberComponent>) => void;
}

const NumberModal: React.FC<NumberModalProps> = ({
  component,
  handleComponentData,
}) => {
  const connectionState = useOpenSpaceApiStore(
    (state) => state.connectionState,
  );

  const properties = usePropertyStore((state) => state.properties);
  const [property, setProperty] = useState<string>(component?.property || '');
  //   const propertyData = usePropertyStore(
  //     (state) => state.properties[component?.property || ''],
  //   );

  const [propertyData, setPropertyData] = useState<any>(
    usePropertyStore.getState().properties[component?.property || ''],
  );
  const [gui_name, setGuiName] = useState<string>(component?.gui_name || '');
  const [gui_description, setGuiDescription] = useState<string>(
    component?.gui_description || '',
  );
  const [backgroundImage, setBackgroundImage] = useState<string>(
    component?.backgroundImage || '',
  );
  const [min, setMin] = useState<number>(component?.min || 0.1);
  const [max, setMax] = useState<number>(component?.max || 100);
  const [step, setStep] = useState<number>(component?.min || 0.1);

  useEffect(() => {
    if (property) {
      setPropertyData(usePropertyStore.getState().properties[property]);
    }
  }, [property]);
  useEffect(() => {
    console.log(propertyData);
    if (!propertyData) return;
    setMax(parseFloat(propertyData.description.AdditionalData.MaximumValue));
    setMin(parseFloat(propertyData.description.AdditionalData.MinimumValue));
    setStep(propertyData.description.AdditionalData.SteppingValue);
    const name = propertyData.uri
      //only exacly '.Layers' should be removed
      .replace(/Scene.|.Renderable|\.Layers/g, '')
      .split('.')
      .slice(0, -1)
      .join('.')
      .replace(/\./g, ' > ')
      .trim();
    // let name = propertyData.uri.split('.')[1];
    setGuiName(`${name} > ${propertyData.description.Name}`);
    setGuiDescription(propertyData.description.description);
  }, [propertyData]);

  //   const [action, setAction] = useState<string>(component?.action || 'on');

  useEffect(() => {
    handleComponentData({
      property,
      min,
      max,
      step,
      gui_name,
      gui_description,
      backgroundImage,
    });
  }, [
    property,
    min,
    max,
    step,
    gui_name,
    gui_description,
    backgroundImage,
    handleComponentData,
  ]);

  useEffect(() => {
    if (connectionState !== ConnectionState.CONNECTED) return;
  }, []);

  const sortedKeys: Record<string, string> = Object.keys(properties)
    .filter((a) => properties[a].type === 'Number')
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
          <div className="text-sm font-medium text-black">Range Min</div>
          <input
            type="number"
            className="w-[50%] rounded border p-2"
            value={min}
            onChange={(e) => setMin(parseFloat(e.target.value))}
          />
        </div>
        <div className="flex flex-row items-center justify-between">
          <div className="text-sm font-medium text-black">Range Max</div>
          <input
            type="number"
            className="w-[50%] rounded border p-2"
            value={max}
            onChange={(e) => setMax(parseFloat(e.target.value))}
          />
        </div>
        <div className="flex flex-row items-center justify-between">
          <div className="text-sm font-medium text-black">Range Step</div>
          <input
            type="number"
            className="w-[50%] rounded border p-2"
            value={step}
            onChange={(e) => setStep(parseFloat(e.target.value))}
          />
        </div>
        <div className="flex flex-row items-center justify-between">
          <div className="text-sm font-medium text-black">Gui Name</div>
          <input
            type="slider"
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

export { NumberModal, NumberGUIComponent };
