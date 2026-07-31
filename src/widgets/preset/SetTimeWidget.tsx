import { useEffect, useRef } from 'react';

import { useOpenSpaceApi } from '@/api/hooks';
import ComponentContainer from '@/components/ComponentContainer';
import DisplayLabel from '@/components/DisplayLabel';
import { Information } from '@/components/Information';
import StatusBar, { StatusBarRef } from '@/components/StatusBar';
import { useSubscribeToTime } from '@/hooks/topicSubscriptions';
import { SetTimeComponent as SetTimeType } from '@/store';
import { useBoundStore } from '@/store/boundStore';
import { jumpToTime } from '@/utils/time';

interface SetTimeComponentProps {
  component: SetTimeType;
}

function SetTimeWidget({ component }: SetTimeComponentProps) {
  const luaApi = useOpenSpaceApi();
  useSubscribeToTime();
  const updateComponent = useBoundStore((state) => state.updateComponent);
  useEffect(() => {
    if (luaApi) {
      updateComponent(component.id, {
        triggerAction: () => {
          jumpToTime(
            new Date(component.time),
            component.interpolate,
            component.intDuration,
            component.fadeScene
          );
        },
        isDisabled: false
      });
    } else {
      updateComponent(component.id, {
        isDisabled: true
      });
    }
  }, [
    component.time,
    component.interpolate,
    component.intDuration,
    component.fadeScene,
    luaApi
  ]);

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
      onClick={() => {
        component.triggerAction?.();
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
