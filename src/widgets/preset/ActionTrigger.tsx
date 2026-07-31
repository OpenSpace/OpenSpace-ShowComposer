import { useEffect } from 'react';

import { useOpenSpaceApi } from '@/api/hooks';
import ComponentContainer from '@/components/ComponentContainer';
import DisplayLabel from '@/components/DisplayLabel';
import { Information } from '@/components/Information';
import { useBoundStore } from '@/store/boundStore';
import { ActionTriggerComponent } from '@/types/components';
import { triggerAction } from '@/utils/triggerHelpers';

interface ActionTriggerGUIProps {
  component: ActionTriggerComponent;
  shouldRender?: boolean;
}

function ActionTriggerGUIComponent({
  component,
  shouldRender = true
}: ActionTriggerGUIProps) {
  const luaApi = useOpenSpaceApi();
  const updateComponent = useBoundStore((state) => state.updateComponent);

  useEffect(() => {
    if (luaApi) {
      updateComponent(component.id, {
        triggerAction: () => {
          triggerAction(component.action);
        },
        isDisabled: false
      });
    } else {
      updateComponent(component.id, {
        isDisabled: true
      });
    }
  }, [component.id, component.action, luaApi]);

  if (!shouldRender) {
    return null;
  }

  return (
    <ComponentContainer
      backgroundImage={component.backgroundImage}
      backgroundColor={component.color}
      onClick={() => {
        component.triggerAction?.();
      }}
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

export { ActionTriggerGUIComponent };
