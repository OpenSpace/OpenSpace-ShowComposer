import { useEffect, useState } from 'react';
import {
  Group,
  InputLabel,
  NumberInput,
  SimpleGrid,
  Slider,
  Stack,
  Textarea,
  TextInput
} from '@mantine/core';
import { useShallow } from 'zustand/react/shallow';

import { useOpenSpaceApi } from '@/api/hooks';
import BackgroundHolder from '@/components/BackgroundHolder';
import ComponentContainer from '@/components/ComponentContainer';
import { Information } from '@/components/Information';
import ToggleComponent from '@/components/Toggle';
import { VirtualizedCombobox } from '@/components/VirtualizedCombobox';
import { useProperty } from '@/hooks/properties';
import { NumberComponent, usePropertyStore } from '@/store';
import { useBoundStore } from '@/store/boundStore';
import { ComponentBaseColors } from '@/types/components';
import { AdditionalDataNumber } from '@/types/Property/propertyTypes';
import { formatName } from '@/utils/apiHelpers';
import { getCopy } from '@/utils/copyHelpers';
import { triggerNumber } from '@/utils/triggerHelpers';

// Slider position -> the value sent to OpenSpace
function getScale(position: number, min: number, max: number, exponent: number) {
  const range = max - min;
  const normalized = (position - min) / range; // Normalize position to [0, 1]
  return min + Math.pow(normalized, exponent) * range; // Apply exponent and scale
}

// Inverse of getScale: OpenSpace value -> slider position
function toPosition(value: number, min: number, max: number, exponent: number) {
  const range = max - min;
  const normalized = Math.min(Math.max((value - min) / range, 0), 1);
  return min + Math.pow(normalized, 1 / exponent) * range;
}

interface NumberGUIProps {
  component: NumberComponent;
}

function NumberGUIComponent({ component }: NumberGUIProps) {
  const updateComponent = useBoundStore((state) => state.updateComponent);

  const [value] = useProperty('FloatProperty', component.property);
  const [tempValue, setTempValue] = useState<number>(value ?? 0);

  const luaApi = useOpenSpaceApi();

  const range = component.max - component.min;

  useEffect(() => {
    setTempValue(value ?? 0);
  }, [value]);

  useEffect(() => {
    if (luaApi) {
      updateComponent(component.id, {
        triggerAction: (_value: number) => {
          triggerNumber(component.property, _value);
        },
        isDisabled: value === undefined
      });
    } else {
      updateComponent(component.id, {
        isDisabled: true
      });
    }
  }, [component.id, component.property, luaApi, value, updateComponent]);

  return (
    <ComponentContainer
      backgroundImage={component.backgroundImage}
      backgroundColor={component.color}
    >
      <Stack w={'85%'} gap={'md'} py={'md'}>
        <Group gap={'xs'} wrap={'nowrap'}>
          <InputLabel>{component.gui_name}</InputLabel>
          <Information content={component.gui_description} />
        </Group>

        <Slider
          value={toPosition(
            value ?? component.min,
            component.min,
            component.max,
            component.exponent
          )}
          marks={[0.25, 0.5, 0.75].map((f) => ({
            value: component.min + range * Math.pow(f, 1 / component.exponent)
          }))}
          min={component.min}
          max={component.max}
          step={component.step}
          scale={(v) => getScale(v, component.min, component.max, component.exponent)}
          onChange={(v) =>
            component.triggerAction?.(
              getScale(v, component.min, component.max, component.exponent)
            )
          }
        />

        <NumberInput
          size={'xs'}
          value={tempValue || 0}
          min={component.min}
          max={component.max}
          step={component.step}
          onValueChange={(payload, event) => {
            const numeric = payload.floatValue ?? 0;
            setTempValue(numeric);
            // Mantine reports increment/decrement if a the stepper button has been pressed,
            // arrow keys and holding press- those apply immediately, while typing normally
            // sets the tempValue until blur or "Enter"
            if (
              String(event.source) === 'increment' ||
              String(event.source) === 'decrement'
            ) {
              component.triggerAction?.(numeric);
            }
          }}
          onBlur={() => component.triggerAction?.(tempValue)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              component.triggerAction?.(tempValue);
            }
          }}
        />
      </Stack>
    </ComponentContainer>
  );
}

interface NumberModalProps {
  component: NumberComponent | null;
  handleComponentData: (data: Partial<NumberComponent>) => void;
}

function NumberModal({ component, handleComponentData }: NumberModalProps) {
  const properties = usePropertyStore(useShallow((state) => state.properties));
  const [property, setProperty] = useState<string>(component?.property || '');
  const [guiName, setGuiName] = useState<string>(component?.gui_name || '');
  const [guiDescription, setGuiDescription] = useState<string>(
    component?.gui_description || ''
  );
  const [color, setColor] = useState<string>(
    component?.color || ComponentBaseColors.number
  );
  const [lockName, setLockName] = useState<boolean>(component?.lockName || false);
  const [backgroundImage, setBackgroundImage] = useState<string>(
    component?.backgroundImage || ''
  );
  const [min, setMin] = useState<number>(component?.min || 0.1);
  const [max, setMax] = useState<number>(component?.max || 100);
  const [step, setStep] = useState<number>(component?.step || 0.1);
  const [exponent, setExponent] = useState<number>(component?.exponent || 1);

  useEffect(() => {
    const propertyData = usePropertyStore.getState().properties[property];
    if (!propertyData || !propertyData.metaData) return;
    const { additionalData } = propertyData.metaData as {
      additionalData: AdditionalDataNumber;
    };
    setMax(additionalData.max);
    setMin(additionalData.min);
    setStep(additionalData.step);
    setExponent(additionalData.exponent);
    if (!lockName) {
      setGuiName(formatName(propertyData.uri));
      setGuiDescription(propertyData.metaData.description);
    }
  }, [property]);

  useEffect(() => {
    handleComponentData({
      property,
      min,
      max,
      step,
      exponent,
      gui_name: guiName,
      gui_description: guiDescription,
      lockName,
      backgroundImage,
      color
    });
  }, [
    property,
    min,
    max,
    step,
    exponent,
    guiName,
    guiDescription,
    lockName,
    backgroundImage,
    color,
    handleComponentData
  ]);

  const sortedKeys: Record<string, string> = Object.keys(properties)
    .filter(
      (a) => properties[a].metaData?.type === 'FloatProperty' && !a.includes('.Fade')
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
      acc[newValue] = key;
      return acc;
    }, {});
  return (
    <Stack gap={'md'}>
      <Stack gap={'xs'}>
        <InputLabel>{getCopy('Number', 'property')}</InputLabel>
        <VirtualizedCombobox
          options={Object.keys(sortedKeys)}
          selectOption={(v: string) => setProperty(sortedKeys[v])}
          selectedOption={
            Object.keys(sortedKeys).find((key) => sortedKeys[key] === property) || ''
          }
          searchPlaceholder={'Search the Scene...'}
        />
      </Stack>
      <SimpleGrid cols={4}>
        <NumberInput
          id={'min'}
          label={getCopy('Number', 'range_min')}
          placeholder={'Slider Min'}
          value={min || 0}
          onChange={(value) =>
            setMin(typeof value === 'number' ? value : parseFloat(value))
          }
        />
        <NumberInput
          id={'max'}
          label={getCopy('Number', 'range_max')}
          placeholder={'Slider Max'}
          value={max || 0}
          onChange={(value) =>
            setMax(typeof value === 'number' ? value : parseFloat(value))
          }
        />
        <NumberInput
          id={'step'}
          label={getCopy('Number', 'step')}
          placeholder={'Slider Step'}
          value={step || 0}
          onChange={(value) =>
            setStep(typeof value === 'number' ? value : parseFloat(value))
          }
        />
        <NumberInput
          id={'exp'}
          label={getCopy('Number', 'exponent')}
          placeholder={'Slider Exponent'}
          value={exponent || 0}
          onChange={(value) =>
            setExponent(typeof value === 'number' ? value : parseFloat(value))
          }
        />
      </SimpleGrid>
      <Group align={'flex-end'} wrap={'nowrap'}>
        <TextInput
          flex={3}
          id={'guiname'}
          label={getCopy('Number', 'component_name')}
          placeholder={'Name of Component'}
          value={guiName}
          onChange={(e) => setGuiName(e.currentTarget.value)}
        />
        <ToggleComponent label={'Lock Name'} value={lockName} setValue={setLockName} />
      </Group>
      <BackgroundHolder
        color={color}
        setColor={setColor}
        backgroundImage={backgroundImage}
        setBackgroundImage={setBackgroundImage}
      />
      <Textarea
        id={'description'}
        label={getCopy('Number', 'gui_description')}
        value={guiDescription}
        onChange={(e) => setGuiDescription(e.currentTarget.value)}
        placeholder={'Type your message here.'}
      />
    </Stack>
  );
}

export { NumberGUIComponent, NumberModal };
