import { useRef } from 'react';

import { ComponentContainer } from '@/components/ComponentContainer';
import { StatusBar, type StatusBarRef } from '@/components/StatusBar';
import { WidgetLabel } from '@/components/WidgetLabel';
import { componentActions } from '@/editor/componentActions';
import { useSubscribeToTime } from '@/hooks/topicSubscriptions';
import type { SetTimeComponent } from '@/store';

interface Props {
  component: SetTimeComponent;
}

export function SetTimeWidget({ component }: Props) {
  const statusBarRef = useRef<StatusBarRef>(null);

  // Keep the time topic subscribed so jumpToTime has a current time to interpolate from.
  useSubscribeToTime();

  return (
    <ComponentContainer
      backgroundImage={component.backgroundImage}
      backgroundColor={component.color}
      onClick={() => {
        componentActions.settime(component)();
        statusBarRef.current?.triggerAnimation();
      }}
    >
      {component.interpolate && component.intDuration > 0 && (
        <StatusBar ref={statusBarRef} duration={component.intDuration} />
      )}
      <WidgetLabel name={component.gui_name} description={component.gui_description} />
    </ComponentContainer>
  );
}
