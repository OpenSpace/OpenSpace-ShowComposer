import { useEffect, useState } from 'react';
import {
  Group,
  InputLabel,
  NumberInput,
  SimpleGrid,
  Stack,
  Textarea,
  TextInput
} from '@mantine/core';
import { useShallow } from 'zustand/react/shallow';

import BackgroundPicker from '@/components/BackgroundPicker';
import ToggleComponent from '@/components/Toggle';
import { VirtualizedCombobox } from '@/components/VirtualizedCombobox';
import { NumberComponent, usePropertyStore } from '@/store';
import { ComponentBaseColors } from '@/types/components';
import { AdditionalDataNumber } from '@/types/Property/propertyTypes';
import { formatName } from '@/utils/apiHelpers';
import { getCopy } from '@/utils/copyHelpers';

interface Props {
  component: NumberComponent | null;
  handleComponentData: (data: Partial<NumberComponent>) => void;
}

function NumberModal({ component, handleComponentData }: Props) {
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
      <BackgroundPicker
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

export { NumberModal };
