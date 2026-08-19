import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Group, InputLabel, NumberInput, SimpleGrid, Stack } from '@mantine/core';
import { AnyProperty } from 'openspace-api-js/types';
import { useShallow } from 'zustand/react/shallow';

import { Toggle as ToggleComponent } from '@/components/Toggle';
import { VirtualizedCombobox } from '@/components/VirtualizedCombobox';
import { WidgetSettings } from '@/components/WidgetSettings';
import { ModalFooter } from '@/editor/sidebar/modals/ModalFooter';
import {
  ComponentModalChildProps,
  useSaveComponent
} from '@/editor/sidebar/modals/saveComponent';
import { useProperty } from '@/hooks/properties';
import { useSubscribeToCamera, useSubscribeToProfile } from '@/hooks/topicSubscriptions';
import { usePropertyStore } from '@/store';
import { NavigationAnchorKey } from '@/store/apiStore';
import { ComponentBaseColors, FlyToComponent } from '@/types/components';
import { formatName, getStringBetween } from '@/utils/apiHelpers';

const DEFAULTS: Omit<FlyToComponent, 'id'> = {
  type: 'flyto',
  isMulti: 'false',
  gui_name: '',
  gui_description: '',
  intDuration: 4,
  backgroundImage: '',
  color: ComponentBaseColors.flyto
};

type Option = {
  name: string;
  shouldGeo: boolean;
};

function FlyToModal({
  component,
  componentId,
  initialData,
  onClose,
  onCancel
}: ComponentModalChildProps<'flyto'>) {
  const { t } = useTranslation('fly-to');
  const [data, setData] = useState<FlyToComponent>(
    () => component ?? { ...DEFAULTS, ...initialData, id: componentId ?? '' }
  );
  const saveComponent = useSaveComponent();
  const camera = useSubscribeToCamera(500);
  const [currentAnchor] = useProperty('StringProperty', NavigationAnchorKey);
  const profile = useSubscribeToProfile();
  const setFavorites = usePropertyStore((state) => state.setFavorites);
  const favorites = usePropertyStore((state) => state.favorites);
  const properties = usePropertyStore(
    useShallow((state) =>
      Object.keys(state.properties)
        .filter((a) => a.includes('.Renderable'))
        .reduce(
          (acc: Record<string, AnyProperty>, key: string) => {
            acc[key] = state.properties[key];
            return acc;
          },
          {} as Record<string, AnyProperty>
        )
    )
  );

  const geo = data.geo ?? false;
  const long = data.long ?? 0;
  const lat = data.lat ?? 0;
  const alt = data.alt ?? 0;
  const intDuration = data.intDuration ?? 4;
  const target = data.target ?? '';

  const placeholders = target
    ? {
        name: `Fly To ${formatName(target)}`,
        description: `Fly to ${formatName(target)}`
      }
    : { name: '', description: '' };

  const [options, setOptions] = useState<Option[]>();

  useEffect(() => {
    setFavorites(profile.markNodes);
  }, [profile, properties]);

  useEffect(() => {
    setOptions(
      favorites.map((favorite) => ({
        name: favorite,
        shouldGeo: true
      }))
    );
  }, [favorites]);

  const hasGeoOption: boolean = useMemo(
    () =>
      (options && target && options.find((option) => option.name === target)?.shouldGeo) ||
      false,
    [target, options]
  );

  // A target without geo support can't be flown to geographically, so clear the flag.
  useEffect(() => {
    if (!hasGeoOption && geo) {
      setData((prev) => ({ ...prev, geo: false }));
    }
  }, [hasGeoOption, geo]);

  const setFromOpenspace = () => {
    const shouldGeo = options?.find((option) => option.name === currentAnchor)?.shouldGeo;
    if (shouldGeo) {
      handleData({
        target: String(currentAnchor),
        lat: camera.latitude || 0,
        long: camera.longitude || 0,
        alt: Math.round(camera.altitudeMeters || 0),
        geo: true
      });
    } else {
      handleData({ target: String(currentAnchor) });
    }
  };

  const sortedKeys: Record<string, string> = useMemo(
    () =>
      Object.keys(properties)
        .sort((a, b) => {
          const periodCountA = (a.match(/\./g) || []).length;
          const periodCountB = (b.match(/\./g) || []).length;
          if (periodCountA !== periodCountB) {
            return periodCountA - periodCountB;
          }
          return a.localeCompare(b);
        })
        .reduce((acc: Record<string, string>, key) => {
          const newValue = getStringBetween(key, 'Scene.', '.Renderable');
          acc[formatName(newValue)] = newValue;
          return acc;
        }, {}),
    [properties]
  );

  function handleData(patch: Partial<FlyToComponent>) {
    setData((prev) => ({ ...prev, ...patch }));
  }

  function save() {
    saveComponent(data, placeholders);
    onClose();
  }

  return (
    <Stack gap={'md'}>
      <Stack gap={'xs'}>
        <InputLabel>{t('target')}</InputLabel>
        <VirtualizedCombobox
          options={Object.keys(sortedKeys)}
          selectOption={(v: string) => handleData({ target: sortedKeys[v] })}
          selectedOption={
            Object.keys(sortedKeys).find((key) => sortedKeys[key] === target) || ''
          }
          searchPlaceholder={'Search the Scene...'}
          presets={options?.map((v) => v.name) || null}
        />
      </Stack>
      <Group grow align={'flex-end'} wrap={'nowrap'}>
        <NumberInput
          id={'duration'}
          label={t('flight-duration')}
          placeholder={'Duration to Flight'}
          value={intDuration}
          onChange={(value) =>
            handleData({
              intDuration: typeof value === 'number' ? value : parseFloat(value)
            })
          }
        />
        <Button variant={'filled'} size={'xs'} onClick={setFromOpenspace}>
          {t('set-target-from-openspace')}
        </Button>
        <ToggleComponent
          value={geo}
          disabled={!hasGeoOption}
          setValue={(value) => handleData({ geo: value })}
          label={t('set-coordinates-altitude')}
        />
      </Group>
      {hasGeoOption && geo && (
        <SimpleGrid cols={3}>
          <NumberInput
            id={'alt'}
            label={t('alt')}
            placeholder={'Altitude'}
            value={alt}
            onChange={(value) =>
              handleData({ alt: typeof value === 'number' ? value : parseFloat(value) })
            }
          />
          <NumberInput
            id={'lat'}
            label={t('latitude')}
            placeholder={t('latitude')}
            value={lat}
            onChange={(value) =>
              handleData({ lat: typeof value === 'number' ? value : parseFloat(value) })
            }
          />
          <NumberInput
            id={'long'}
            label={t('longitude')}
            placeholder={t('longitude')}
            value={long}
            onChange={(value) =>
              handleData({ long: typeof value === 'number' ? value : parseFloat(value) })
            }
          />
        </SimpleGrid>
      )}
      <WidgetSettings
        data={data}
        handleData={handleData}
        placeholders={placeholders}
      />
      <ModalFooter isEdit={!!component} onSave={save} onCancel={onCancel} />
    </Stack>
  );
}

export { FlyToModal };
