import { useRef } from 'react';

import { useOpenSpaceApi } from '@/api/hooks';
import { ComponentContainer } from '@/components/ComponentContainer';
import { DisplayLabel } from '@/components/DisplayLabel';
import { Information } from '@/components/Information';
import { StatusBar, StatusBarRef } from '@/components/StatusBar';
import { componentActions } from '@/editor/componentActions';
import { FlyToComponent } from '@/types/components';

interface Props {
  component: FlyToComponent;
}

function FlyToWidget({ component }: Props) {
  const luaApi = useOpenSpaceApi();
  const fadeOutDuration = 400; // 1 second fade out
  const statusBarRef = useRef<StatusBarRef>(null);
  const disabled = !luaApi;
  const triggerAnimation = () => {
    statusBarRef.current?.triggerAnimation();
  };

  return (
    <ComponentContainer
      backgroundImage={component.backgroundImage}
      backgroundColor={component.color}
      disabled={disabled}
      onClick={() => {
        componentActions.flyto(component)();
        triggerAnimation();
      }}
    >
      {component?.intDuration && (
        <StatusBar
          ref={statusBarRef}
          duration={component?.intDuration}
          fadeOutDuration={fadeOutDuration}
        />
      )}
      {component.gui_name || component.gui_description ? (
        <DisplayLabel>
          {component.gui_name}
          <Information content={component.gui_description} />
        </DisplayLabel>
      ) : null}
    </ComponentContainer>
  );
}

export { FlyToWidget };
