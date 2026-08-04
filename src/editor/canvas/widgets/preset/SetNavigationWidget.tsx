import { useEffect, useRef } from 'react';

import { useOpenSpaceApi } from '@/api/hooks';
import { ComponentContainer } from '@/components/ComponentContainer';
import { DisplayLabel } from '@/components/DisplayLabel';
import { Information } from '@/components/Information';
import { StatusBar, StatusBarRef } from '@/components/StatusBar';
import { useBoundStore } from '@/store/boundStore';
import { SetNavComponent } from '@/types/components';
import { jumpToNavState } from '@/utils/triggerHelpers';

interface Props {
  component: SetNavComponent;
  shouldRender?: boolean;
}

function SetNavigationWidget({ component, shouldRender = true }: Props) {
  const luaApi = useOpenSpaceApi();
  const updateComponent = useBoundStore((state) => state.updateComponent);
  const {
    navigationState,
    intDuration,
    mode,
    time,
    setTime,
    gui_description,
    gui_name,
    backgroundImage,
    color
  } = component;

  useEffect(() => {
    if (luaApi) {
      updateComponent(component.id, {
        triggerAction: () => {
          jumpToNavState(navigationState, setTime, mode, intDuration);
        },
        isDisabled: false
      });
    } else {
      updateComponent(component.id, {
        isDisabled: true
      });
    }
  }, [
    luaApi,
    updateComponent,
    component.id,
    navigationState,
    time,
    intDuration,
    mode,
    setTime
  ]);

  const fadeOutDuration = 400; // 1 second fade out
  const statusBarRef = useRef<StatusBarRef>(null);
  const triggerAnimation = () => {
    statusBarRef.current?.triggerAnimation();
  };

  if (!shouldRender) {
    return null;
  }

  return (
    <ComponentContainer
      backgroundImage={backgroundImage}
      backgroundColor={color}
      onClick={() => {
        component.triggerAction?.();
        triggerAnimation();
      }}
    >
      {component.intDuration > 0 && (
        <StatusBar
          ref={statusBarRef}
          duration={component?.intDuration}
          fadeOutDuration={fadeOutDuration}
        />
      )}
      {gui_name || gui_description ? (
        <DisplayLabel>
          {gui_name}
          <Information content={gui_description} />
        </DisplayLabel>
      ) : null}
    </ComponentContainer>
  );
}

export { SetNavigationWidget };
