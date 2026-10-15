import { ComponentContainer } from '@/components/ComponentContainer';
import { WidgetLabel } from '@/components/WidgetLabel';
import { componentActions } from '@/editor/componentActions';
import { useOutlineStyle } from '@/hooks/outlineStyle';
import { useProperty } from '@/hooks/properties';
import type { BooleanComponent } from '@/store';

interface Props {
  component: BooleanComponent;
}

export function BooleanWidget({ component }: Props) {
  const [boolValue] = useProperty('BoolProperty', component.property);

  // Reflect the property state on the card outline: on (green), off (red),
  // unknown/disconnected (grey)
  const outlineStyle = useOutlineStyle(boolValue, (value) =>
    value === true ? 1 : value === false ? -1 : 0
  );

  return (
    <ComponentContainer
      backgroundImage={component.backgroundImage}
      backgroundColor={component.color}
      style={outlineStyle}
      onClick={componentActions.boolean(component)}
    >
      <WidgetLabel name={component.gui_name} description={component.gui_description} />
    </ComponentContainer>
  );
}
