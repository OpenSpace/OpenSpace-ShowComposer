import { useEffect, useState } from 'react';
import { getCopy } from '@/utils/copyHelpers';
import {
  useOpenSpaceApiStore,
  usePropertyStore,
  NumberComponent,
  ConnectionState,
} from '@/store';
import Information from '@/components/common/Information';
import { triggerNumber } from '@/utils/triggerHelpers';
import Slider from '@/components/inputs/Slider';
import { VirtualizedCombobox } from '@/components/common/VirtualizedCombobox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { formatName, Property } from '@/utils/apiHelpers';
import ComponentContainer from '@/components/common/ComponentContainer';
import ToggleComponent from '@/components/common/Toggle';
import { useShallow } from 'zustand/react/shallow';
import { useBoundStore } from '@/store/boundStore';
import { ComponentBaseColors } from '@/store/ComponentTypes';
import BackgroundHolder from '@/components/common/BackgroundHolder';

interface NumberGUIProps {
  component: NumberComponent;
}
const NumberGUIComponent: React.FC<NumberGUIProps> = ({ component }) => {
  const luaApi = useOpenSpaceApiStore((state) => state.luaApi);
  const connectionState = useOpenSpaceApiStore(
    (state) => state.connectionState,
  );
  const updateComponent = useBoundStore((state) => state.updateComponent);
  const subscribeToProperty = usePropertyStore(
    (state) => state.subscribeToProperty,
  );
  const unsubscribeFromProperty = usePropertyStore(
    (state) => state.unsubscribeFromProperty,
  );
  const property = usePropertyStore(
    (state) => state.properties[component.property],
  );
  const [tempValue, setTempValue] = useState(property?.value);
  const [triggeredByArrowKey, setTriggeredByArrowKey] = useState(false);
  useEffect(() => {
    setTempValue(property?.value);
  }, [property?.value]);
  const handleBlur = () => {
    component.triggerAction?.(parseFloat(tempValue));
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (triggeredByArrowKey) {
      component.triggerAction?.(parseFloat(e.target.value));
      setTriggeredByArrowKey(false); // Reset the flag
    } else {
      setTempValue(e.target.value);
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      component.triggerAction?.(parseFloat(tempValue));
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      setTriggeredByArrowKey(true); // Set the flag when arrow keys are pressed
    }
  };

  const handleMouseDown = (_e: React.MouseEvent) => {
    setTriggeredByArrowKey(true);
  };

  const handleMouseUp = (_e: React.MouseEvent) => {
    component.triggerAction?.(parseFloat(tempValue));
  };

  useEffect(() => {
    if (connectionState !== ConnectionState.CONNECTED) return;
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
      // console.log('Registering trigger action');
      updateComponent(component.id, {
        triggerAction: (_value: number) => {
          triggerNumber(component.property, _value);
        },
        isDisabled: property ? false : true,
      });
    } else {
      updateComponent(component.id, {
        isDisabled: true,
      });
    }
  }, [component.id, component.property, luaApi, property]);
  return (
    <ComponentContainer
      backgroundImage={component.backgroundImage}
      backgroundColor={component.color}
    >
      <div className="grid w-[85%] gap-4 py-4">
        <div className="flex flex-row gap-2">
          <Label>{component.gui_name}</Label>
          <Information content={component.gui_description} />
        </div>

        <Slider
          value={property?.value || 0}
          min={component.min}
          max={component.max}
          step={component.step}
          exponent={component.exponent}
          onChange={(v) => component.triggerAction?.(v)}
        />

        <Input
          type="number"
          className="w-auto bg-opacity-50 text-xs"
          value={tempValue || 0}
          min={component.min}
          max={component.max}
          step={component.step}
          onChange={handleChange}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      </div>
    </ComponentContainer>
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
  const properties = usePropertyStore(useShallow((state) => state.properties));
  const [property, setProperty] = useState<string>(component?.property || '');
  const [gui_name, setGuiName] = useState<string>(component?.gui_name || '');
  const [gui_description, setGuiDescription] = useState<string>(
    component?.gui_description || '',
  );
  const [color, setColor] = useState<string>(
    component?.color || ComponentBaseColors.number,
  );
  const [lockName, setLockName] = useState<boolean>(
    component?.lockName || false,
  );
  const [backgroundImage, setBackgroundImage] = useState<string>(
    component?.backgroundImage || '',
  );
  const [min, setMin] = useState<number>(component?.min || 0.1);
  const [max, setMax] = useState<number>(component?.max || 100);
  const [step, setStep] = useState<number>(component?.min || 0.1);
  const [exponent, setExponent] = useState<number>(component?.exponent || 1);
  useEffect(() => {
    const propertyData = usePropertyStore.getState().properties[property];
    if (!propertyData || !propertyData.metaData) return;
    setMax(parseFloat(propertyData.metaData.additionalData.max));
    setMin(parseFloat(propertyData.metaData.additionalData.min));
    setStep(propertyData.metaData.additionalData.step);
    setExponent(propertyData.metaData.additionalData.exponent);
    if (!lockName) {
      setGuiName(formatName(propertyData.uri));
      setGuiDescription(propertyData.metaData.description);
    }
  }, [property]);

  //   const [action, setAction] = useState<string>(component?.action || 'on');

  useEffect(() => {
    handleComponentData({
      property,
      min,
      max,
      step,
      exponent,
      gui_name,
      gui_description,
      lockName,
      backgroundImage,
      color,
    });
  }, [
    property,
    min,
    max,
    step,
    exponent,
    gui_name,
    gui_description,
    lockName,
    backgroundImage,
    color,
    handleComponentData,
  ]);
  useEffect(() => {
    if (connectionState !== ConnectionState.CONNECTED) return;
  }, []);
  const sortedKeys: Record<string, string> = Object.keys(properties)
    .filter(
      (a) => properties[a].metaData?.type === 'Number' && !a.includes('.Fade'),
    )
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
      // const newValue = key;
      acc[newValue] = key;
      return acc;
    }, {});
  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="grid gap-2">
          <Label>{getCopy('Number', 'property')}</Label>
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
      <div className="grid grid-cols-4 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="min">{getCopy('Number', 'range_min')}</Label>
          <Input
            id="min"
            placeholder="Slider Min"
            type="number"
            value={min || 0}
            onChange={(e) => setMin(parseFloat(e.target.value))}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="max">{getCopy('Number', 'range_max')}</Label>
          <Input
            id="max"
            placeholder="Slider Max"
            type="number"
            value={max || 0}
            onChange={(e) => setMax(parseFloat(e.target.value))}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="step">{getCopy('Number', 'step')}</Label>
          <Input
            id="step"
            placeholder="Slider Step"
            type="number"
            value={step || 0}
            onChange={(e) => setStep(parseFloat(e.target.value))}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="exp">{getCopy('Number', 'exponent')}</Label>
          <Input
            id="exp"
            placeholder="getCopy('Number', 'exponent')"
            type="number"
            value={exponent || 0}
            onChange={(e) => setExponent(parseFloat(e.target.value))}
          />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <div className="col-span-3 grid gap-2">
          <Label htmlFor="gioname">{getCopy('Number', 'component_name')}</Label>
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
        <BackgroundHolder
          color={color}
          setColor={setColor}
          backgroundImage={backgroundImage}
          setBackgroundImage={setBackgroundImage}
        />
        <div className="grid gap-2">
          <Label htmlFor="description">
            {getCopy('Number', 'gui_description')}
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
  );
};
export { NumberModal, NumberGUIComponent };
