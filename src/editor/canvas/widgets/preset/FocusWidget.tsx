import { ComponentContainer } from '@/components/ComponentContainer';
import { DisplayLabel } from '@/components/DisplayLabel';
import { Information } from '@/components/Information';
import { componentActions } from '@/editor/componentActions';
import { useSubscribeToProperty } from '@/hooks/properties';
import { NavigationAnchorKey } from '@/store/apiStore';
import { SetFocusComponent } from '@/types/components';

interface Props {
  component: SetFocusComponent;
}

function FocusWidget({ component }: Props) {
  useSubscribeToProperty(NavigationAnchorKey);

  return (
    <ComponentContainer
      backgroundImage={component.backgroundImage}
      backgroundColor={component.color}
      onClick={componentActions.setfocus(component)}
    >
      {component.gui_name || component.gui_description ? (
        <DisplayLabel>
          {component.gui_name}
          <Information content={component.gui_description} />
        </DisplayLabel>
      ) : null}
    </ComponentContainer>
  );
}

export { FocusWidget };
