import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Group, NumberInput, Stack } from '@mantine/core';

import { DateTimeStepper } from '@/components/DateTimeStepper';
import { Toggle as ToggleComponent } from '@/components/Toggle';
import { WidgetSettings } from '@/components/WidgetSettings';
import { ModalFooter } from '@/editor/sidebar/modals/ModalFooter';
import {
  type ComponentModalChildProps,
  useSaveComponent
} from '@/editor/sidebar/modals/saveComponent';
import { useSubscribeToTime } from '@/hooks/topicSubscriptions';
import type { SetTimeComponent as SetTimeType } from '@/store';
import { ComponentBaseColors } from '@/types/components';
import { formatDate } from '@/utils/time';

const DEFAULTS: Omit<SetTimeType, 'id'> = {
  type: 'settime',
  isMulti: 'false',
  gui_name: '',
  gui_description: '',
  time: '',
  intDuration: 4,
  interpolate: false,
  fadeScene: false,
  backgroundImage: '',
  color: ComponentBaseColors.settime
};

export function SetTimeModal({
  component,
  componentId,
  initialData,
  onClose,
  onCancel
}: ComponentModalChildProps<'settime'>) {
  const { t } = useTranslation('set-time');
  const [data, setData] = useState<SetTimeType>(
    () => component ?? { ...DEFAULTS, ...initialData, id: componentId ?? '' }
  );
  const saveComponent = useSaveComponent();
  const { timeCapped: time } = useSubscribeToTime();

  const componentTime = data.time || time;
  const { interpolate, intDuration, fadeScene } = data;

  let timeLabel: Date | string | undefined;
  if (componentTime) {
    try {
      timeLabel = formatDate(componentTime as Date);
    } catch {
      timeLabel = componentTime;
    }
  } else {
    timeLabel = time;
  }

  const placeholders = timeLabel
    ? {
        name: t('placeholder-name', { time: timeLabel }),
        description: interpolate
          ? t('placeholder-description-interpolate', {
              time: timeLabel,
              duration: intDuration
            })
          : t('placeholder-description-set', { time: timeLabel })
      }
    : { name: '', description: '' };

  function handleData(patch: Partial<SetTimeType>) {
    setData((prev) => ({ ...prev, ...patch }));
  }

  function save() {
    saveComponent(data, placeholders);
    onClose();
  }

  return (
    <Stack gap={'md'}>
      {time && (
        <DateTimeStepper
          date={componentTime as Date}
          onChange={(stepperData: {
            time: Date | string;
            interpolate: boolean;
            delta: number;
            relative: boolean;
          }) => {
            handleData({ time: stepperData.time });
          }}
        />
      )}
      <Button
        variant={'filled'}
        onClick={() => {
          handleData({ time: new Date() });
        }}
      >
        {t('set-time-to-now')}
      </Button>
      <Group align={'flex-end'} wrap={'nowrap'}>
        <NumberInput
          flex={1}
          id={'duration'}
          label={t('fade-duration')}
          placeholder={t('duration-placeholder')}
          value={intDuration}
          onChange={(value) =>
            handleData({
              intDuration: typeof value === 'number' ? value : parseFloat(value)
            })
          }
        />
        <ToggleComponent
          label={t('interpolate')}
          value={interpolate}
          setValue={(v) => handleData({ interpolate: v })}
        />
        <ToggleComponent
          label={t('fade-scene')}
          disabled={!interpolate}
          value={fadeScene}
          setValue={(v) => handleData({ fadeScene: v })}
        />
      </Group>
      <WidgetSettings
        data={data}
        handleData={handleData}
        placeholders={placeholders}
      />
      <ModalFooter isEdit={!!component} onSave={save} onCancel={onCancel} />
    </Stack>
  );
}
