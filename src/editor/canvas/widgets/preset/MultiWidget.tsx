import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InputLabel, Stack } from '@mantine/core';

import { ComponentContainer } from '@/components/ComponentContainer';
import { DisplayLabel } from '@/components/DisplayLabel';
import { StatusBar, type StatusBarRef } from '@/components/StatusBar';
import { WidgetLabel } from '@/components/WidgetLabel';
import { runComponentAction } from '@/editor/componentActions';
import { useBoundStore } from '@/store/boundStore';
import type { MultiComponent, MultiOption } from '@/types/components';

interface Props {
  component: MultiComponent;
}

// TODO @ylvse 2026-10-13: this widget is very messy and needs to be refactored. That is however
// a bigger change as the whole store architecture needs to be changed as well.
export function MultiWidget({ component }: Props) {
  const { t } = useTranslation('multi');

  const getComponentById = useBoundStore((state) => state.getComponentById);

  const [currentItems, setCurrentItems] = useState<string[]>([]);

  const statusBarRef = useRef<StatusBarRef>(null);
  const timeoutIds = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      timeoutIds.current.forEach(clearTimeout);
      timeoutIds.current = [];
    };
  }, []);

  const totalDelay = useMemo(() => {
    return component.components[component.components.length - 1]?.endTime || 0;
  }, [component.components]);

  const triggerComponents = useCallback(() => {
    component.components.forEach((item, index) => {
      function triggerComponent() {
        const tempComponent = getComponentById(item.component) as MultiOption | undefined;
        if (tempComponent) {
          setCurrentItems((items) => [...items, tempComponent.gui_name || '']);
          runComponentAction(tempComponent);
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
            setCurrentItems([]);
          }, item.endTime * 1000);
          timeoutIds.current.push(finalDelayTimeoutId);
        }
      }
      const totalOffsetTimeoutId = setTimeout(triggerComponent, item.startTime * 1000);
      timeoutIds.current.push(totalOffsetTimeoutId);
    });
  }, [component.components]);

  function triggerAnimation() {
    statusBarRef.current?.triggerAnimation();
  }

  return (
    <ComponentContainer
      backgroundImage={component.backgroundImage}
      backgroundColor={component.color}
      onClick={() => {
        triggerComponents();
        triggerAnimation();
      }}
    >
      <StatusBar ref={statusBarRef} duration={totalDelay} />
      <Stack align={'center'} gap={'xs'}>
        <WidgetLabel name={component.gui_name} description={component.gui_description} />
        {currentItems.length > 0 && (
          <DisplayLabel>
            <Stack gap={'xxs'}>
              <InputLabel>{t('current-items')}</InputLabel>
              {currentItems.map((v) => (
                <InputLabel key={v}>{v}</InputLabel>
              ))}
            </Stack>
          </DisplayLabel>
        )}
      </Stack>
    </ComponentContainer>
  );
}
