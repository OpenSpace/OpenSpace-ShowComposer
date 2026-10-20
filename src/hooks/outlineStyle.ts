import type { CSSProperties } from 'react';

import type { AnyProperty } from '@/types/Property/property';

// What getState returns: 1 is green, -1 is red and 0 is grey
type OutlineState = 1 | 0 | -1;

const OutlineColors: Record<OutlineState, string> = {
  1: 'var(--mantine-color-green-6)',
  [-1]: 'var(--mantine-color-red-6)',
  0: 'var(--mantine-color-gray-5)'
};

/**
 * Get the style for a widget with an outline that reflects the state of a property.
 *
 * @param value The property value, undefined when it is unknown, e.g. while disconnected.
 * @param getState Decides the color from the value: return 1 for green, -1 for red and 0
 * for grey.
 * @returns The style to give to the widget's container.
 */
export function useOutlineStyle(
  value: AnyProperty['value'] | undefined,
  getState: (value: AnyProperty['value'] | undefined) => OutlineState
): CSSProperties {
  return {
    top: '4px',
    left: '4px',
    width: 'calc(100% - 8px)', // Adjust width to account for outline width and offset
    height: 'calc(100% - 8px)', // Adjust height to account for outline width and offset
    outline: `4px solid ${OutlineColors[getState(value)]}`,
    outlineOffset: '2px',
    transition: 'outline-color 300ms'
  };
}
