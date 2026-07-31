import { useEffect } from 'react';

import { useOpenSpaceApi } from '@/api/hooks';
import ComponentContainer from '@/components/ComponentContainer';
import DisplayLabel from '@/components/DisplayLabel';
import { Information } from '@/components/Information';
import StatusBarControlled from '@/components/StatusBarControlled';
import { useProperty } from '@/hooks/properties';
import { FadeComponent } from '@/store';
import { useBoundStore } from '@/store/boundStore';
import { triggerFade } from '@/utils/triggerHelpers';

interface FadeGUIProps {
  component: FadeComponent;
  shouldRender?: boolean;
}

function FadeGUIComponent({ component, shouldRender = true }: FadeGUIProps) {
  const luaApi = useOpenSpaceApi();
  const updateComponent = useBoundStore((state) => state.updateComponent);
  const [opacity] = useProperty('FloatProperty', component.property);
  const [fadeValue] = useProperty(
    'FloatProperty',
    component?.property?.replace('.Opacity', '.Fade') ?? ''
  );

  useEffect(() => {
    if (luaApi) {
      updateComponent(component.id, {
        triggerAction: () => {
          triggerFade(component.property, component.intDuration, component.action);
        },
        isDisabled: opacity === undefined
      });
    } else {
      updateComponent(component.id, {
        isDisabled: true
      });
    }
  }, [
    component.id,
    component.action,
    component.intDuration,
    component.property,
    opacity,
    luaApi
  ]);

  if (!shouldRender) {
    return null;
  }

  // Reflect the value of fade on the card outline: faded in (green),
  // faded out (red), transitioning/disconnected (grey)
  const outlineColor =
    fadeValue === 1
      ? 'var(--mantine-color-green-6)'
      : fadeValue === 0
        ? 'var(--mantine-color-red-6)'
        : 'var(--mantine-color-gray-5)';

  return (
    <ComponentContainer
      backgroundImage={component.backgroundImage}
      backgroundColor={component.color}
      style={{
        top: '4px',
        left: '4px',
        width: 'calc(100% - 8px)', // Adjust width to account for outline width and offset
        height: 'calc(100% - 8px)', // Adjust height to account for outline width and offset
        outline: `4px solid ${outlineColor}`,
        outlineOffset: '2px',
        transition: 'outline-color 300ms'
      }}
      onClick={() => {
        component.triggerAction?.();
      }}
    >
      {fadeValue !== undefined ? (
        <StatusBarControlled progress={fadeValue} debounceDuration={0} />
      ) : null}
      {component.gui_name || component.gui_description ? (
        <DisplayLabel>
          {component.gui_name}
          <Information content={component.gui_description} />
        </DisplayLabel>
      ) : null}
    </ComponentContainer>
  );
}

export { FadeGUIComponent };
