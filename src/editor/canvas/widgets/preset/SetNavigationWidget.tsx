import { useRef } from 'react';

import { useOpenSpaceApi } from '@/api/hooks';
import { ComponentContainer } from '@/components/ComponentContainer';
import { DisplayLabel } from '@/components/DisplayLabel';
import { Information } from '@/components/Information';
import { StatusBar, StatusBarRef } from '@/components/StatusBar';
import { componentActions } from '@/editor/componentActions';
import { SetNavComponent } from '@/types/components';

interface Props {
  component: SetNavComponent;
}

function SetNavigationWidget({ component }: Props) {
  const { gui_description, gui_name, backgroundImage, color } = component;
  const luaApi = useOpenSpaceApi();
  const disabled = !luaApi;

  const fadeOutDuration = 400; // 1 second fade out
  const statusBarRef = useRef<StatusBarRef>(null);
  const triggerAnimation = () => {
    statusBarRef.current?.triggerAnimation();
  };

  return (
    <ComponentContainer
      backgroundImage={backgroundImage}
      backgroundColor={color}
      disabled={disabled}
      onClick={() => {
        componentActions.setnavstate(component)();
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
