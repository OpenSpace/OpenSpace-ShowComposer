import { ComponentContainer } from '@/components/ComponentContainer';
import { WidgetLabel } from '@/components/WidgetLabel';
import { componentActions } from '@/editor/componentActions';
import type { TriggerComponent } from '@/store';

interface Props {
  component: TriggerComponent;
}

export function TriggerWidget({ component }: Props) {
  return (
    <ComponentContainer
      backgroundImage={component.backgroundImage}
      backgroundColor={component.color}
      onClick={componentActions.trigger(component)}
    >
      <WidgetLabel name={component.gui_name} description={component.gui_description} />
    </ComponentContainer>
  );
}
