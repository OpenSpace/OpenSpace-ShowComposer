import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Group, NumberInput, Stack } from '@mantine/core';

import { DateTimeStepper } from '@/components/DateTimeStepper';
import { Toggle as ToggleComponent } from '@/components/Toggle';
import { WidgetSettings } from '@/components/WidgetSettings';
import { useSubscribeToTime } from '@/hooks/topicSubscriptions';
import { SetTimeComponent as SetTimeType } from '@/store';
import { ComponentBaseColors } from '@/types/components';
import { formatDate } from '@/utils/time';

interface Props {
  component: SetTimeType | null;
  handleComponentData: (data: Partial<SetTimeType>) => void;
}

function SetTimeModal({ component, handleComponentData }: Props) {
  const { t } = useTranslation('set-time');
  const { timeCapped: time } = useSubscribeToTime();
  const [componentTime, setCompontentTime] = useState(component?.time || time);
  const [interpolate, setInterpolate] = useState(component?.interpolate || false);
  const [intDuration, setIntDuration] = useState(component?.intDuration || 4);
  const [fadeScene, setFadeScene] = useState(component?.fadeScene || false);
  const [guiName, setGuiName] = useState<string>(component?.gui_name || '');
  const [guiDescription, setGuiDescription] = useState<string>(
    component?.gui_description || ''
  );
  const [lockName, setLockName] = useState<boolean>(component?.lockName || false);
  const [backgroundImage, setBackgroundImage] = useState<string>(
    component?.backgroundImage || ''
  );
  const [color, setColor] = useState<string>(
    component?.color || ComponentBaseColors.settime
  );
  const timeLabel = useMemo(() => {
    if (componentTime) {
      try {
        return formatDate(componentTime as Date);
      } catch {
        return componentTime;
      }
    }
    return time;
  }, [componentTime]);

  useEffect(() => {
    if (timeLabel && !lockName) {
      setGuiName(`Go to ${timeLabel}`);
      if (interpolate) {
        setGuiDescription(
          `Interpolates Time to ${timeLabel} over ${intDuration} seconds.`
        );
      } else {
        setGuiDescription(`Sets Time to ${timeLabel}`);
      }
    }
  }, [timeLabel, intDuration, interpolate]);

  useEffect(() => {
    handleComponentData({
      time: componentTime,
      interpolate,
      intDuration,
      fadeScene,
      gui_name: guiName,
      lockName,
      gui_description: guiDescription,
      backgroundImage,
      color
    });
  }, [
    componentTime,
    interpolate,
    intDuration,
    handleComponentData,
    fadeScene,
    guiName,
    lockName,
    guiDescription,
    backgroundImage,
    color
  ]);
  return (
    <Stack gap={'md'}>
      {time && (
        <DateTimeStepper
          date={componentTime as Date}
          onChange={(data: {
            time: Date | string;
            interpolate: boolean;
            delta: number;
            relative: boolean;
          }) => {
            setCompontentTime(data.time);
          }}
        />
      )}
      <Button
        variant={'filled'}
        onClick={() => {
          const newTime = new Date();
          setCompontentTime(newTime);
        }}
      >
        {t('set-time-to-now')}
      </Button>
      <Group align={'flex-end'} wrap={'nowrap'}>
        <NumberInput
          flex={1}
          id={'duration'}
          label={t('fade-duration')}
          placeholder={'Duration to Fade'}
          value={intDuration}
          onChange={(value) =>
            setIntDuration(typeof value === 'number' ? value : parseFloat(value))
          }
        />
        <ToggleComponent
          label={'Interpolate'}
          value={interpolate}
          setValue={setInterpolate}
        />
        <ToggleComponent
          label={'Fade Scene'}
          disabled={!interpolate}
          value={fadeScene}
          setValue={setFadeScene}
        />
      </Group>
      <WidgetSettings
        guiName={guiName}
        setGuiName={setGuiName}
        lockName={lockName}
        setLockName={setLockName}
        color={color}
        setColor={setColor}
        backgroundImage={backgroundImage}
        setBackgroundImage={setBackgroundImage}
        guiDescription={guiDescription}
        setGuiDescription={setGuiDescription}
      />
    </Stack>
  );
}

export { SetTimeModal };
