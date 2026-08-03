import { useEffect } from 'react';

import { useOpenSpaceApi } from '@/api/hooks';
import ComponentContainer from '@/components/ComponentContainer';
import DisplayLabel from '@/components/DisplayLabel';
import { Information } from '@/components/Information';
import { useProperty } from '@/hooks/properties';
import { TriggerComponent } from '@/store';
import { useBoundStore } from '@/store/boundStore';
import { triggerTrigger } from '@/utils/triggerHelpers';

interface Props {
  component: TriggerComponent;
  shouldRender?: boolean;
}

function TriggerWidget({ component, shouldRender = true }: Props) {
  const luaApi = useOpenSpaceApi();
  const updateComponent = useBoundStore((state) => state.updateComponent);
  const [, , meta] = useProperty('TriggerProperty', component.property);

  useEffect(() => {
    if (luaApi) {
      updateComponent(component.id, {
        triggerAction: () => {
          triggerTrigger(component.property);
        },
        isDisabled: meta === undefined
      });
    } else {
      updateComponent(component.id, {
        isDisabled: true
      });
    }
  }, [component.id, component.property, luaApi, meta, updateComponent]);

  if (!shouldRender) {
    return null;
  }

  return (
    <ComponentContainer
      backgroundImage={component.backgroundImage}
      backgroundColor={component.color}
      onClick={() => component.triggerAction?.()}
    >
      <DisplayLabel>
        {component.gui_name}
        <Information content={component.gui_description} />
      </DisplayLabel>
    </ComponentContainer>
  );
}

export { TriggerWidget };
