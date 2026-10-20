import { ComponentContainer } from '@/components/ComponentContainer';
import { WidgetLabel } from '@/components/WidgetLabel';
import { componentActions } from '@/editor/componentActions';
import type { ActionTriggerComponent } from '@/types/components';

interface Props {
  component: ActionTriggerComponent;
}

export function ActionTriggerWidget({ component }: Props) {
  return (
    <ComponentContainer
      backgroundImage={component.backgroundImage}
      backgroundColor={component.color}
      onClick={componentActions.action(component)}
    >
      <WidgetLabel name={component.gui_name} description={component.gui_description} />
    </ComponentContainer>
  );
}
