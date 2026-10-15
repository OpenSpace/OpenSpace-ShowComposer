import { useRef } from 'react';

import { ComponentContainer } from '@/components/ComponentContainer';
import { StatusBar, type StatusBarRef } from '@/components/StatusBar';
import { WidgetLabel } from '@/components/WidgetLabel';
import { componentActions } from '@/editor/componentActions';
import { useSubscribeToTime } from '@/hooks/topicSubscriptions';
import type { SetTimeComponent as SetTimeType } from '@/store';

interface Props {
  component: SetTimeType;
}

export function SetTimeWidget({ component }: Props) {
  // Keep the time topic subscribed so jumpToTime has a current time to interpolate from.
  useSubscribeToTime();

  const statusBarRef = useRef<StatusBarRef>(null);
  function triggerAnimation() {
    statusBarRef.current?.triggerAnimation();
  };
  
  return (
    <ComponentContainer
      backgroundImage={component.backgroundImage}
      backgroundColor={component.color}
      onClick={() => {
        componentActions.settime(component)();
        triggerAnimation();
      }}
    >
      {component.interpolate && component.intDuration && (
        <StatusBar ref={statusBarRef} duration={component.intDuration} />
      )}
      <WidgetLabel name={component.gui_name} description={component.gui_description} />
    </ComponentContainer>
  );
}
