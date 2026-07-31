import { useEffect, useMemo, useState } from 'react';
import { Button, Group, NumberInput, Stack, Textarea, TextInput } from '@mantine/core';

import BackgroundPicker from '@/components/BackgroundPicker';
import { DateTimeStepper } from '@/components/DateTimeStepper';
import ToggleComponent from '@/components/Toggle';
import { useSubscribeToTime } from '@/hooks/topicSubscriptions';
import { SetTimeComponent as SetTimeType } from '@/store';
import { ComponentBaseColors } from '@/types/components';
import { getCopy } from '@/utils/copyHelpers';
import { formatDate } from '@/utils/time';

interface SetTimeModalProps {
  component: SetTimeType | null;
  handleComponentData: (data: Partial<SetTimeType>) => void;
}

function SetTimeModal({ component, handleComponentData }: SetTimeModalProps) {
  const { timeCapped: time } = useSubscribeToTime();
  const [componentTime, setCompontentTime] = useState(component?.time || time);
  const [interpolate, setInterpolate] = useState(component?.interpolate || false);
  const [intDuration, setIntDuration] = useState(component?.intDuration || 4);
  const [fadeScene, setFadeScene] = useState(component?.fadeScene || false);
  const [guiName, setGuiName] = useState(component?.gui_name);
  const [guiDescription, setGuiDescription] = useState(component?.gui_description);
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
        {getCopy('SetTime', 'set_time_to_now')}
      </Button>
      <Group align={'flex-end'} wrap={'nowrap'}>
        <TextInput
          flex={3}
          id={'guiname'}
          label={getCopy('SetTime', 'component_name')}
          placeholder={'Name of Component'}
          value={guiName}
          onChange={(e) => setGuiName(e.currentTarget.value)}
        />
        <ToggleComponent label={'Lock Name'} value={lockName} setValue={setLockName} />
      </Group>
      <Group align={'flex-end'} wrap={'nowrap'}>
        <NumberInput
          flex={1}
          id={'duration'}
          label={getCopy('SetTime', 'fade_duration')}
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
      <BackgroundPicker
        color={color}
        setColor={setColor}
        backgroundImage={backgroundImage}
        setBackgroundImage={setBackgroundImage}
      />
      <Textarea
        id={'description'}
        label={getCopy('SetTime', 'gui_description')}
        value={guiDescription}
        onChange={(e) => setGuiDescription(e.currentTarget.value)}
        placeholder={'Type your message here.'}
      />
    </Stack>
  );
}

export { SetTimeModal };
