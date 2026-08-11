import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InputLabel, Stack, Text } from '@mantine/core';

import { ComponentContainer } from '@/components/ComponentContainer';
import { DisplayLabel } from '@/components/DisplayLabel';
import { Information } from '@/components/Information';
import { StatusBar, StatusBarRef } from '@/components/StatusBar';
import { runComponentAction } from '@/editor/componentActions';
import { useBoundStore } from '@/store/boundStore';
import { MultiComponent, MultiOption } from '@/types/components';

interface Props {
  component: MultiComponent;
}

function MultiWidget({ component }: Props) {
  const { t } = useTranslation('multi');
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
  const timeoutIds = useRef<ReturnType<typeof setTimeout>[]>([]);

  const triggerComponents = useCallback(() => {
    component.components.forEach((item, index) => {
      const triggerComponent = () => {
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
              <InputLabel>{t('current-items')}</InputLabel>
              {currentItems.map((v) => (
                <InputLabel key={v}>{v}</InputLabel>
              ))}
            </Stack>
          )}
          <Information content={component?.gui_description} />
        </Stack>
      </DisplayLabel>
    </ComponentContainer>
  );
}

export { MultiWidget };
