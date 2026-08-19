import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Group, InputLabel, NumberInput, Select, Stack } from '@mantine/core';

import { useOpenSpaceApi } from '@/api/hooks';
import { DisplayLabel } from '@/components/DisplayLabel';
import { Toggle as ToggleComponent } from '@/components/Toggle';
import { WidgetSettings } from '@/components/WidgetSettings';
import { ModalFooter } from '@/editor/sidebar/modals/ModalFooter';
import {
  ComponentModalChildProps,
  useSaveComponent
} from '@/editor/sidebar/modals/saveComponent';
import { useSubscribeToTime } from '@/hooks/topicSubscriptions';
import { AnchorIcon, ClockIcon } from '@/icons/icons';
import { ComponentBaseColors, SetNavComponent } from '@/types/components';
import { NavigationState } from '@/types/types';
import { formatDate } from '@/utils/time';

const DEFAULTS: Omit<SetNavComponent, 'id'> = {
  type: 'setnavstate',
  isMulti: 'false',
  gui_name: '',
  gui_description: '',
  time: '',
  setTime: true,
  mode: 'jump',
  intDuration: 1,
  backgroundImage: '',
  color: ComponentBaseColors.setnavstate
};

function SetNavModal({
  component,
  componentId,
  initialData,
  onClose,
  onCancel
}: ComponentModalChildProps<'setnavstate'>) {
  const { t } = useTranslation('set-navigation');
  const [data, setData] = useState<SetNavComponent>(
    () => component ?? { ...DEFAULTS, ...initialData, id: componentId ?? '' }
  );
  const saveComponent = useSaveComponent();
  const luaApi = useOpenSpaceApi();
  const { timeCapped: time } = useSubscribeToTime();

  const { navigationState } = data;
  const componentTime = data.time || time;
  const { intDuration, mode, setTime } = data;

  const placeholders = navigationState?.Anchor
    ? {
        name: `${mode.charAt(0).toUpperCase() + mode.slice(1)} to Navigation State : ${
          navigationState.Anchor
        }`,
        description: ''
      }
    : { name: '', description: '' };

  const getNavigationState = async () => {
    if (!luaApi) return;
    const navState = (await luaApi.navigation.getNavigationState()) as NavigationState;
    handleData({ navigationState: navState, time });
  };

  useEffect(() => {
    if (!data.navigationState) {
      getNavigationState();
    }
  }, [data.navigationState]);

  const timeLabel = useMemo(() => {
    if (componentTime) {
      try {
        return formatDate(new Date(time || ''));
      } catch {
        return componentTime;
      }
    }
    return componentTime;
  }, [componentTime, time]);

  function handleData(patch: Partial<SetNavComponent>) {
    setData((prev) => ({ ...prev, ...patch }));
  }

  function save() {
    saveComponent(data, placeholders);
    onClose();
  }

  return (
    <Stack gap={'md'}>
      <Button variant={'filled'} onClick={getNavigationState}>
        {t('save-current-navigation-state')}
      </Button>
      <Stack gap={'xs'}>
        <InputLabel>
          <Group gap={4} wrap={'nowrap'}>
            <AnchorIcon size={14} />
            Navigation State Anchor
          </Group>
        </InputLabel>
        <DisplayLabel showBorder>{navigationState?.Anchor}</DisplayLabel>
      </Stack>
      <Group grow align={'flex-end'} wrap={'nowrap'}>
        <Stack gap={'xs'} style={{ opacity: setTime ? 1 : 0.5 }}>
          <InputLabel>
            <Group gap={4} wrap={'nowrap'}>
              <ClockIcon size={14} />
              {t('navigation-state-time')}
            </Group>
          </InputLabel>
          <DisplayLabel showBorder>{timeLabel as string}</DisplayLabel>
        </Stack>
        <ToggleComponent
          label={'Include Time'}
          value={setTime}
          setValue={(v) => handleData({ setTime: v })}
        />
      </Group>
      <Group align={'flex-end'} wrap={'nowrap'}>
        <NumberInput
          flex={1}
          id={'duration'}
          label={t('fade-duration')}
          disabled={mode === 'jump'}
          style={{ opacity: mode !== 'jump' ? 1 : 0.5 }}
          placeholder={'Duration to Fade'}
          value={intDuration}
          onChange={(value) =>
            handleData({
              intDuration: typeof value === 'number' ? value : parseFloat(value)
            })
          }
        />
        <Stack flex={1} gap={'xs'}>
          <InputLabel>{t('transition-mode')}</InputLabel>
          <Select
            allowDeselect={false}
            data={[
              { label: 'Jump', value: 'jump' },
              { label: 'Fade In/Out', value: 'fade' },
              { label: 'Fly', value: 'fly' }
            ]}
            placeholder={'Select an option'}
            value={mode}
            onChange={(value) => {
              if (value === null) {
                return;
              }
              handleData({ mode: value as 'jump' | 'fade' | 'fly' });
            }}
          />
        </Stack>
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

export { SetNavModal };
