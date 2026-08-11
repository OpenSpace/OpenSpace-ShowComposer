import { useOpenSpaceApi } from '@/api/hooks';
import { ComponentContainer } from '@/components/ComponentContainer';
import { DisplayLabel } from '@/components/DisplayLabel';
import { Information } from '@/components/Information';
import { componentActions } from '@/editor/componentActions';
import { useProperty } from '@/hooks/properties';
import { TriggerComponent } from '@/store';

interface Props {
  component: TriggerComponent;
}

function TriggerWidget({ component }: Props) {
  const luaApi = useOpenSpaceApi();
  // Trigger properties carry no value, so existence is checked via metadata.
  const [, , meta] = useProperty('TriggerProperty', component.property);
  const disabled = !luaApi || meta === undefined;

  return (
    <ComponentContainer
      backgroundImage={component.backgroundImage}
      backgroundColor={component.color}
      disabled={disabled}
      onClick={componentActions.trigger(component)}
    >
      <DisplayLabel>
        {component.gui_name}
        <Information content={component.gui_description} />
      </DisplayLabel>
    </ComponentContainer>
  );
}

export { TriggerWidget };
