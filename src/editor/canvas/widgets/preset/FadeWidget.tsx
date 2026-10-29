import { ComponentContainer } from '@/components/ComponentContainer';
import { StatusBarControlled } from '@/components/StatusBarControlled';
import { WidgetLabel } from '@/components/WidgetLabel';
import { componentActions } from '@/editor/componentActions';
import { useOutlineStyle } from '@/hooks/outlineStyle';
import { useProperty } from '@/hooks/properties';
import type { FadeComponent } from '@/store';
import { fadeTarget } from '@/utils/apiHelpers';

interface Props {
  component: FadeComponent;
}

export function FadeWidget({ component }: Props) {
  const [fadeValue] = useProperty(
    'FloatProperty',
    `${fadeTarget(component?.property)}.Fade`
  );
  // Reflect the value of fade on the card outline: faded in (green),
  // faded out (red), transitioning/disconnected (grey)
  const outlineStyle = useOutlineStyle(fadeValue, (value) =>
    value === 1 ? 1 : value === 0 ? -1 : 0
  );

  return (
    <ComponentContainer
      backgroundImage={component.backgroundImage}
      backgroundColor={component.color}
      style={outlineStyle}
      onClick={componentActions.fade(component)}
    >
      {fadeValue !== undefined && <StatusBarControlled progress={fadeValue} />}
      <WidgetLabel name={component.gui_name} description={component.gui_description} />
    </ComponentContainer>
  );
}
