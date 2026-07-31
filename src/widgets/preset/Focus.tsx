import { useEffect } from 'react';

import { useOpenSpaceApi } from '@/api/hooks';
import ComponentContainer from '@/components/ComponentContainer';
import DisplayLabel from '@/components/DisplayLabel';
import { Information } from '@/components/Information';
import { useProperty, useSubscribeToProperty } from '@/hooks/properties';
import {
  NavigationAimKey,
  NavigationAnchorKey,
  RetargetAnchorKey
} from '@/store/apiStore';
import { useBoundStore } from '@/store/boundStore';
import { SetFocusComponent } from '@/types/components';

interface FocusGUIProps {
  component: SetFocusComponent;
  shouldRender?: boolean;
}

function FocusComponent({ component, shouldRender = true }: FocusGUIProps) {
  const luaApi = useOpenSpaceApi();
  const updateComponent = useBoundStore((state) => state.updateComponent);
  // Reading Renderable.Enabled lets us check whether the scene node exists.
  const [enabledValue] = useProperty(
    'BoolProperty',
    `Scene.${component.property}.Renderable.Enabled`
  );

  useSubscribeToProperty(NavigationAnchorKey);

  useEffect(() => {
    if (luaApi) {
      updateComponent(component.id, {
        triggerAction: () => {
          luaApi.setPropertyValueSingle(RetargetAnchorKey, null);
          luaApi.setPropertyValueSingle(NavigationAnchorKey, component.property);
          luaApi.setPropertyValueSingle(NavigationAimKey, '');
        },
        isDisabled: enabledValue === undefined
      });
    } else {
      updateComponent(component.id, {
        isDisabled: true
      });
    }
  }, [component.id, component.property, luaApi, enabledValue]);

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

export { FocusComponent };
