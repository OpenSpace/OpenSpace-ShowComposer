import { useEffect, useState } from 'react';
import { Group, InputLabel, NumberInput, Slider, Stack } from '@mantine/core';

import { useOpenSpaceApi } from '@/api/hooks';
import { ComponentContainer } from '@/components/ComponentContainer';
import { Information } from '@/components/Information';
import { useProperty } from '@/hooks/properties';
import { NumberComponent } from '@/store';
import { useBoundStore } from '@/store/boundStore';
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

interface Props {
  component: NumberComponent;
}

function NumberWidget({ component }: Props) {
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

export { NumberWidget };
