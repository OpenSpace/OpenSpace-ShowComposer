import { ComponentContainer } from '@/components/ComponentContainer';
import { WidgetLabel } from '@/components/WidgetLabel';
import { componentActions } from '@/editor/componentActions';
import { useProperty } from '@/hooks/properties';
import type { BooleanComponent } from '@/store';

interface Props {
  component: BooleanComponent;
}

export function BooleanWidget({ component }: Props) {
  const [value] = useProperty('BoolProperty', component.property);

  // Reflect the property state on the card outline: on (green), off (red),
  // unknown/disconnected (grey)
  const outlineColor =
    value === true
      ? 'var(--mantine-color-green-6)'
      : value === false
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
      onClick={componentActions.boolean(component)}
    >
      <WidgetLabel name={component.gui_name} description={component.gui_description} />
    </ComponentContainer>
  );
}
