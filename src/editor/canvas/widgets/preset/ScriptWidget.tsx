import { ComponentContainer } from '@/components/ComponentContainer';
import { WidgetLabel } from '@/components/WidgetLabel';
import { componentActions } from '@/editor/componentActions';
import type { ScriptComponent } from '@/types/components';

interface Props {
  component: ScriptComponent;
}

export function ScriptWidget({ component }: Props) {
  return (
    <ComponentContainer
      backgroundImage={component.backgroundImage}
      backgroundColor={component.color}
      onClick={componentActions.script(component)}
    >
      <WidgetLabel name={component.gui_name} description={component.gui_description} />
    </ComponentContainer>
  );
}
