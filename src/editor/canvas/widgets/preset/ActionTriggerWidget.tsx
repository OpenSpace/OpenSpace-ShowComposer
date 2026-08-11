import { useOpenSpaceApi } from '@/api/hooks';
import { ComponentContainer } from '@/components/ComponentContainer';
import { DisplayLabel } from '@/components/DisplayLabel';
import { Information } from '@/components/Information';
import { componentActions } from '@/editor/componentActions';
import { ActionTriggerComponent } from '@/types/components';

interface Props {
  component: ActionTriggerComponent;
}

function ActionTriggerWidget({ component }: Props) {
  const luaApi = useOpenSpaceApi();
  const disabled = !luaApi;

  return (
    <ComponentContainer
      backgroundImage={component.backgroundImage}
      backgroundColor={component.color}
      disabled={disabled}
      onClick={componentActions.action(component)}
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

export { ActionTriggerWidget };
