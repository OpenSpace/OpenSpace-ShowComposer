import { useEffect, useState } from 'react';
import {
  ColorInput,
  ColorPicker as MantineColorPicker,
  ColorSwatch,
  convertHsvaTo,
  isColorValid,
  parseColor,
  Popover,
  Stack
} from '@mantine/core';

/**
 * Converts a hex/hexa or rgb/rgba color string (e.g. '#ff0000' or
 * 'rgba(255, 0, 0, 0.5)') into the given color format.
 *
 * @param color - The hex/hexa or rgb/rgba color string to convert
 * @param format - The target color format
 * @returns The color serialized in the requested format
 */
function toFormat(color: string, format: 'hex' | 'hexa' | 'rgb' | 'rgba'): string {
  return convertHsvaTo(format, parseColor(color));
}

/**
 * Formats a hex/hexa or rgb/rgba color string as hex, keeping it to 6 digits
 * (`#RRGGBB`) when opaque and only extending to 8 digits (`#RRGGBBAA`) when the
 * color is translucent.
 *
 * @param color - The hex/hexa or rgb/rgba color string to format
 * @returns A 6- or 8-digit hex string
 */
function toHexDisplay(color: string): string {
  const isOpaque = parseColor(color).a === 1;
  return toFormat(color, isOpaque ? 'hex' : 'hexa');
}

/**
 * Formats a hex/hexa or rgb/rgba color string as rgb, dropping the alpha
 * (`rgb(r, g, b)`) when opaque and only keeping it (`rgba(r, g, b, a)`) when the
 * color is translucent.
 *
 * @param color - The hex/hexa or rgb/rgba color string to format
 * @returns An `rgb(...)` or `rgba(...)` string
 */
function toRgbDisplay(color: string): string {
  const isOpaque = parseColor(color).a === 1;
  return toFormat(color, isOpaque ? 'rgb' : 'rgba');
}

interface Props {
  // The current color as a hex/hexa or rgb/rgba string, e.g. '#ff0000', '#ff000080',
  // 'rgb(255, 0, 0)', or 'rgba(255, 0, 0, 0.5)'.
  color: string;
  setColor: (color: string) => void;
}

function ColorPicker({ color, setColor }: Props) {
  const [opened, setOpened] = useState(false);
  // Local state for the text fields so partial/invalid typing isn't overwritten by the
  // controlled value (prop `color`); re-sync whenever the color changes from elsewhere
  // (picker/other field).
  const [hexValue, setHexValue] = useState(() => toHexDisplay(color));
  const [rgbaValue, setRgbaValue] = useState(() => toRgbDisplay(color));

  useEffect(() => {
    setHexValue(toHexDisplay(color));
    setRgbaValue(toRgbDisplay(color));
  }, [color]);

  // Apply a typed field value as the new color, ignoring incomplete/invalid input.
  function applyColor(value: string) {
    if (isColorValid(value)) {
      setColor(toFormat(value, 'rgba'));
    }
  }

  return (
    <Popover opened={opened} onChange={setOpened} position={'bottom'} withArrow>
      <Popover.Target>
        <ColorSwatch
          color={color}
          size={64}
          radius={'xl'}
          style={{ cursor: 'pointer' }}
          onClick={() => setOpened((o) => !o)}
        />
      </Popover.Target>
      <Popover.Dropdown>
        <Stack gap={'sm'} w={230}>
          <MantineColorPicker
            format={'rgba'}
            value={color}
            onChange={setColor}
            fullWidth
            styles={{
              // We don't need the swatch preview since we already have the ColorSwatch
              preview: { display: 'none' },
              sliders: { margin: '0px' },
              saturation: { height: 180 }
            }}
          />
          <ColorInput
            label={'HEXA'}
            format={'hexa'}
            placeholder={'#RRGGBB'}
            withPicker={false}
            withEyeDropper={false}
            value={hexValue}
            onChange={setHexValue}
            onBlur={() => applyColor(hexValue)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.currentTarget.blur();
              }
            }}
            styles={{
              label: { display: 'block', textAlign: 'center' },
              section: { display: 'none' },
              input: { padding: '10px', textAlign: 'center' }
            }}
          />
          <ColorInput
            label={'RGBA'}
            format={'rgba'}
            placeholder={'rgba(r, g, b, a)'}
            withPicker={false}
            withEyeDropper={false}
            value={rgbaValue}
            onChange={setRgbaValue}
            onBlur={() => applyColor(rgbaValue)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.currentTarget.blur();
              }
            }}
            styles={{
              label: { display: 'block', textAlign: 'center' },
              section: { display: 'none' },
              input: { padding: '10px', textAlign: 'center' }
            }}
          />
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}

export { ColorPicker };
