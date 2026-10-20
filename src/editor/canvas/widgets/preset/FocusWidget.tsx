import { ComponentContainer } from '@/components/ComponentContainer';
import { WidgetLabel } from '@/components/WidgetLabel';
import { componentActions } from '@/editor/componentActions';
import { useSubscribeToProperty } from '@/hooks/properties';
import { NavigationAnchorKey } from '@/store/apiStore';
import type { SetFocusComponent } from '@/types/components';

interface Props {
  component: SetFocusComponent;
}

export function FocusWidget({ component }: Props) {
  useSubscribeToProperty(NavigationAnchorKey);

  return (
    <ComponentContainer
      backgroundImage={component.backgroundImage}
      backgroundColor={component.color}
      onClick={componentActions.setfocus(component)}
    >
      <WidgetLabel name={component.gui_name} description={component.gui_description} />
    </ComponentContainer>
  );
}
