import { useRef } from 'react';

import { useOpenSpaceApi } from '@/api/hooks';
import { ComponentContainer } from '@/components/ComponentContainer';
import { DisplayLabel } from '@/components/DisplayLabel';
import { Information } from '@/components/Information';
import { StatusBar, StatusBarRef } from '@/components/StatusBar';
import { componentActions } from '@/editor/componentActions';
import { useSubscribeToTime } from '@/hooks/topicSubscriptions';
import { SetTimeComponent as SetTimeType } from '@/store';

interface Props {
  component: SetTimeType;
}

function SetTimeWidget({ component }: Props) {
  const luaApi = useOpenSpaceApi();
  // Keep the time topic subscribed so jumpToTime has a current time to interpolate from.
  useSubscribeToTime();
  const disabled = !luaApi;

  // Fadetime is in seconds
  const fadeOutDuration = 400; // 1 second fade out
  const statusBarRef = useRef<StatusBarRef>(null);
  const triggerAnimation = () => {
    statusBarRef.current?.triggerAnimation();
  };
  return (
    <ComponentContainer
      backgroundImage={component.backgroundImage}
      backgroundColor={component.color}
      disabled={disabled}
      onClick={() => {
        componentActions.settime(component)();
        triggerAnimation();
      }}
    >
      {component?.interpolate && component.intDuration && (
        <StatusBar
          ref={statusBarRef}
          duration={component?.intDuration}
          fadeOutDuration={fadeOutDuration}
        />
      )}
      <DisplayLabel>
        {component.gui_name}
        <Information content={component.gui_description} />
      </DisplayLabel>
    </ComponentContainer>
  );
}

export { SetTimeWidget };
