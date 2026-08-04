import { useEffect, useRef } from 'react';

import { useOpenSpaceApi } from '@/api/hooks';
import { ComponentContainer } from '@/components/ComponentContainer';
import { DisplayLabel } from '@/components/DisplayLabel';
import { Information } from '@/components/Information';
import { StatusBar, StatusBarRef } from '@/components/StatusBar';
import { useBoundStore } from '@/store/boundStore';
import { FlyToComponent } from '@/types/components';

interface Props {
  component: FlyToComponent;
  shouldRender?: boolean;
}

function FlyToWidget({ component, shouldRender = true }: Props) {
  const luaApi = useOpenSpaceApi();
  const updateComponent = useBoundStore((state) => state.updateComponent);
  const fadeOutDuration = 400; // 1 second fade out
  const statusBarRef = useRef<StatusBarRef>(null);
  const triggerAnimation = () => {
    statusBarRef.current?.triggerAnimation();
  };

  useEffect(() => {
    if (luaApi) {
      updateComponent(component.id, {
        triggerAction: () => {
          const { target, geo, lat, long, alt, intDuration } = component;
          if (!target) {
            return;
          }

          if (geo) {
            if (lat === undefined || long === undefined || alt === undefined) {
              return;
            }
            luaApi.navigation.flyToGeo(target, lat, long, alt, intDuration);
          } else {
            luaApi.navigation.flyTo(target, component.intDuration);
          }
        },
        isDisabled: false
      });
    } else {
      updateComponent(component.id, {
        isDisabled: true
      });
    }
  }, [
    component.geo,
    component.alt,
    component.target,
    component.long,
    component.intDuration,
    luaApi
  ]);

  if (!shouldRender) {
    return null;
  }

  return (
    <ComponentContainer
      backgroundImage={component.backgroundImage}
      backgroundColor={component.color}
      onClick={() => {
        component.triggerAction?.();
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
