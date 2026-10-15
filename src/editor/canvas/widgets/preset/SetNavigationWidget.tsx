import { useRef } from 'react';

import { ComponentContainer } from '@/components/ComponentContainer';
import { StatusBar, type StatusBarRef } from '@/components/StatusBar';
import { WidgetLabel } from '@/components/WidgetLabel';
import { componentActions } from '@/editor/componentActions';
import type { SetNavComponent } from '@/types/components';

interface Props {
  component: SetNavComponent;
}

export function SetNavigationWidget({ component }: Props) {
  const { gui_description, gui_name, backgroundImage, color } = component;

  const statusBarRef = useRef<StatusBarRef>(null);

  return (
    <ComponentContainer
      backgroundImage={backgroundImage}
      backgroundColor={color}
      onClick={() => {
        componentActions.setnavstate(component)();
        statusBarRef.current?.triggerAnimation();
      }}
    >
      {component.intDuration > 0 && (
        <StatusBar ref={statusBarRef} duration={component.intDuration} />
      )}
      <WidgetLabel name={gui_name} description={gui_description} />
    </ComponentContainer>
  );
}
