import { useOpenSpaceApi } from '@/api/hooks';
import { ComponentContainer } from '@/components/ComponentContainer';
import { DisplayLabel } from '@/components/DisplayLabel';
import { Information } from '@/components/Information';
import { componentActions } from '@/editor/componentActions';
import { useProperty, useSubscribeToProperty } from '@/hooks/properties';
import { NavigationAnchorKey } from '@/store/apiStore';
import { SetFocusComponent } from '@/types/components';

interface Props {
  component: SetFocusComponent;
}

function FocusWidget({ component }: Props) {
  const luaApi = useOpenSpaceApi();
  useSubscribeToProperty(NavigationAnchorKey);
  // Reading Renderable.Enabled tells us whether the scene node exists.
  const [enabled] = useProperty(
    'BoolProperty',
    `Scene.${component.property}.Renderable.Enabled`
  );
  const disabled = !luaApi || enabled === undefined;

  return (
    <ComponentContainer
      backgroundImage={component.backgroundImage}
      backgroundColor={component.color}
      disabled={disabled}
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
