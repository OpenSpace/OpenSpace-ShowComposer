import { useRef } from 'react';

import { ComponentContainer } from '@/components/ComponentContainer';
import { StatusBar, type StatusBarRef } from '@/components/StatusBar';
import { WidgetLabel } from '@/components/WidgetLabel';
import { componentActions } from '@/editor/componentActions';
import type { FlyToComponent } from '@/types/components';

interface Props {
  component: FlyToComponent;
}

export function FlyToWidget({ component }: Props) {
  const statusBarRef = useRef<StatusBarRef>(null);

  return (
    <ComponentContainer
      backgroundImage={component.backgroundImage}
      backgroundColor={component.color}
      onClick={() => {
        componentActions.flyto(component)();
        statusBarRef.current?.triggerAnimation();
      }}
    >
      {component.intDuration !== undefined && component.intDuration > 0 && (
        <StatusBar ref={statusBarRef} duration={component.intDuration} />
      )}
      <WidgetLabel name={component.gui_name} description={component.gui_description} />
    </ComponentContainer>
  );
}
