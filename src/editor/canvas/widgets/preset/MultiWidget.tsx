import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { InputLabel, Stack, Text } from '@mantine/core';

import ComponentContainer from '@/components/ComponentContainer';
import DisplayLabel from '@/components/DisplayLabel';
import { Information } from '@/components/Information';
import StatusBar, { StatusBarRef } from '@/components/StatusBar';
import { useBoundStore } from '@/store/boundStore';
import {
  BooleanComponent,
  FadeComponent,
  FlyToComponent,
  MultiComponent,
  MultiOption,
  SetFocusComponent,
  TriggerComponent
} from '@/types/components';
import { getCopy } from '@/utils/copyHelpers';

import { BooleanWidget } from '../property/BooleanWidget';
import { TriggerWidget } from '../property/TriggerWidget';

import { FadeWidget } from './FadeWidget';
import { FlyToWidget } from './FlyToWidget';
import { FocusWidget } from './FocusWidget';

// Mounts each sub-component's GUI with shouldRender={false} so it registers its
// triggerAction/subscriptions in the store without drawing anything
function renderByType(component: MultiOption) {
  switch (component?.type) {
    case 'flyto':
      return (
        <FlyToWidget
          key={component.id}
          component={component as FlyToComponent}
          shouldRender={false}
        />
      );
    case 'fade':
      return (
        <FadeWidget
          key={component.id}
          component={component as FadeComponent}
          shouldRender={false}
        />
      );
    case 'setfocus':
      return (
        <FocusWidget
          key={component.id}
          component={component as SetFocusComponent}
          shouldRender={false}
        />
      );
    case 'boolean':
      return (
        <BooleanWidget
          key={component.id}
          component={component as BooleanComponent}
          shouldRender={false}
        />
      );
    case 'trigger':
      return (
        <TriggerWidget
          key={component.id}
          component={component as TriggerComponent}
          shouldRender={false}
        />
      );
    default:
      return null;
  }
}

interface Props {
  component: MultiComponent;
}

function MultiWidget({ component }: Props) {
  const getComponentById = useBoundStore((state) => state.getComponentById);
  const fadeOutDuration = 400; // 1 second fade out
  const statusBarRef = useRef<StatusBarRef>(null);
  const triggerAnimation = () => {
    statusBarRef.current?.triggerAnimation();
  };

  const totalDelay = useMemo(() => {
    return component.components[component.components.length - 1]?.endTime || 0;
  }, [component.components]);
  const [currentItems, setCurrentItems] = useState<string[]>([]);
  const [_trigger, setTrigger] = useState(false);
  const timeoutIds = useRef<ReturnType<typeof setTimeout>[]>([]);

  const triggerComponents = useCallback(() => {
    setTrigger(true);
    component.components.forEach((item, index) => {
      const triggerComponent = () => {
        const tempComponent = getComponentById(item.component) as MultiOption | undefined;
        if (tempComponent) {
          setCurrentItems((items) => [...items, tempComponent.gui_name || '']);
          tempComponent.triggerAction?.();
          if (item.endTime) {
            const intDurationTimeoutId = setTimeout(
              () => {
                setCurrentItems((items) =>
                  items.filter((i) => i !== tempComponent.gui_name)
                );
              },
              ((item.endTime == 0 ? 0.5 : item.endTime) - item.startTime) * 1000
            );
            timeoutIds.current.push(intDurationTimeoutId);
          }
          triggerAnimation();
        }
        if (index === component.components.length - 1) {
          const finalDelayTimeoutId = setTimeout(() => {
            setTrigger(false);
            setCurrentItems([]);
          }, item.endTime * 1000);
          timeoutIds.current.push(finalDelayTimeoutId);
        }
      };
      const totalOffsetTimeoutId = setTimeout(triggerComponent, item.startTime * 1000);
      timeoutIds.current.push(totalOffsetTimeoutId);
    });
  }, [component.components]);

  useEffect(() => {
    return () => {
      timeoutIds.current.forEach(clearTimeout);
      timeoutIds.current = [];
    };
  }, []);

  return (
    <ComponentContainer
      backgroundImage={component.backgroundImage}
      backgroundColor={component.color}
      onClick={() => {
        triggerComponents();
        triggerAnimation();
      }}
    >
      <StatusBar
        ref={statusBarRef}
        duration={totalDelay}
        fadeOutDuration={fadeOutDuration}
      />
      <DisplayLabel>
        <Stack gap={'xs'}>
          <Text>{component.gui_name}</Text>
          {currentItems.length > 0 && (
            <Stack gap={4}>
              <InputLabel>{getCopy('Multi', 'current_items:')}</InputLabel>
              {currentItems.map((v) => (
                <InputLabel key={v}>{v}</InputLabel>
              ))}
            </Stack>
          )}
          <Information content={component?.gui_description} />
        </Stack>
      </DisplayLabel>

      {/* add none rendered versions of components to dom to register their actions and subscriptions */}
      {component?.components.map((v) => {
        return renderByType(getComponentById(v.component) as MultiOption);
      })}
    </ComponentContainer>
  );
}

export { MultiWidget };
