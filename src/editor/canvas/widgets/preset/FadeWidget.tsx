import { ComponentContainer } from '@/components/ComponentContainer';
import { StatusBarControlled } from '@/components/StatusBarControlled';
import { WidgetLabel } from '@/components/WidgetLabel';
import { componentActions } from '@/editor/componentActions';
import { useProperty } from '@/hooks/properties';
import type { FadeComponent } from '@/store';

interface Props {
  component: FadeComponent;
}

export function FadeWidget({ component }: Props) {
  const [fadeValue] = useProperty(
    'FloatProperty',
    component?.property?.replace('.Opacity', '.Fade') ?? ''
  );

  // Reflect the value of fade on the card outline: faded in (green),
  // faded out (red), transitioning/disconnected (grey)
  const outlineColor =
    fadeValue === 1
      ? 'var(--mantine-color-green-6)'
      : fadeValue === 0
        ? 'var(--mantine-color-red-6)'
        : 'var(--mantine-color-gray-5)';

  return (
    <ComponentContainer
      backgroundImage={component.backgroundImage}
      backgroundColor={component.color}
      style={{
        top: '4px',
        left: '4px',
        width: 'calc(100% - 8px)', // Adjust width to account for outline width and offset
        height: 'calc(100% - 8px)', // Adjust height to account for outline width and offset
        outline: `4px solid ${outlineColor}`,
        outlineOffset: '2px',
        transition: 'outline-color 300ms'
      }}
      onClick={componentActions.fade(component)}
    >
      {fadeValue !== undefined && <StatusBarControlled progress={fadeValue} />}
      <WidgetLabel name={component.gui_name} description={component.gui_description} />
    </ComponentContainer>
  );
}
