import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Group,
  InputLabel,
  NumberInput,
  SimpleGrid,
  Stack,
  Textarea,
  TextInput
} from '@mantine/core';
import { AnyProperty } from 'openspace-api-js/types';
import { useShallow } from 'zustand/react/shallow';

import { useOpenSpaceApi } from '@/api/hooks';
import BackgroundHolder from '@/components/BackgroundHolder';
import ComponentContainer from '@/components/ComponentContainer';
import DisplayLabel from '@/components/DisplayLabel';
import { Information } from '@/components/Information';
import StatusBar, { StatusBarRef } from '@/components/StatusBar';
import ToggleComponent from '@/components/Toggle';
import { VirtualizedCombobox } from '@/components/VirtualizedCombobox';
import { useProperty } from '@/hooks/properties';
import { useSubscribeToCamera, useSubscribeToProfile } from '@/hooks/topicSubscriptions';
import { usePropertyStore } from '@/store';
import { NavigationAnchorKey } from '@/store/apiStore';
import { useBoundStore } from '@/store/boundStore';
import { ComponentBaseColors, FlyToComponent } from '@/types/components';
import { formatName, getStringBetween } from '@/utils/apiHelpers';
import { getCopy } from '@/utils/copyHelpers';

interface FlyToGUIProps {
  component: FlyToComponent;
  shouldRender?: boolean;
}

function FlyToGUIComponent({ component, shouldRender = true }: FlyToGUIProps) {
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
          <Group gap={'xs'} wrap={'nowrap'}>
            {component.gui_name}
            <Information content={component.gui_description} />
          </Group>
        </DisplayLabel>
      ) : null}
    </ComponentContainer>
  );
}

interface FlyToModalProps {
  component: FlyToComponent | null;
  handleComponentData: (data: Partial<FlyToComponent>) => void;
}

type Option = {
  name: string;
  shouldGeo: boolean;
};

function FlyToModal({ component, handleComponentData }: FlyToModalProps) {
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

  const [options, setOptions] = useState<Option[]>();
  const [geo, setGeo] = useState<boolean>(component?.geo || false);
  const [long, setLong] = useState<number>(component?.long || 0);
  const [lat, setLat] = useState<number>(component?.lat || 0);
  const [alt, setAlt] = useState<number>(component?.alt || 0);
  const [intDuration, setIntDuration] = useState<number>(component?.intDuration || 4);
  const [target, setTarget] = useState<string>(component?.target || '');
  const [lockName, setLockName] = useState<boolean>(component?.lockName || false);
  const [guiName, setGuiName] = useState<string>(component?.gui_name || '');
  const [guiDescription, setGuiDescription] = useState<string>(
    component?.gui_description || ''
  );
  const [backgroundImage, setBackgroundImage] = useState<string>(
    component?.backgroundImage || ''
  );
  const [color, setColor] = useState<string>(
    component?.color || ComponentBaseColors.flyto
  );

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

  useEffect(() => {
    if (component) {
      setGeo(component?.geo || false);
    }
  }, [component]);

  const hasGeoOption: boolean = useMemo(() => {
    const shouldGeo =
      options && target && options.find((option) => option.name === target)?.shouldGeo;
    if (!shouldGeo) {
      setGeo(false);
    }
    return shouldGeo || false;
  }, [target, options]);

  const setFromOpenspace = () => {
    const shouldGeo = options?.find((option) => option.name === currentAnchor)?.shouldGeo;
    setTarget(String(currentAnchor));
    if (shouldGeo) {
      setLat(camera.latitude || 0);
      setLong(camera.longitude || 0);
      setAlt(Math.round(camera.altitudeMeters || 0));
      setGeo(true);
    }
  };

  const handleTargetChange = (target: string) => {
    setTarget(target);
    if (!lockName) {
      setGuiName(`Fly To ${formatName(target)}`);
      setGuiDescription(`Fly to ${formatName(target)}`);
    }
  };

  useEffect(() => {
    handleComponentData({
      geo,
      lat,
      long,
      alt,
      target,
      intDuration,
      lockName,
      gui_name: guiName,
      gui_description: guiDescription,
      backgroundImage,
      color
    });
  }, [
    geo,
    intDuration,
    lat,
    long,
    alt,
    target,
    lockName,
    guiName,
    guiDescription,
    backgroundImage,
    color,
    handleComponentData
  ]);

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

  return (
    <Stack gap={'md'}>
      <Stack gap={'xs'}>
        <InputLabel>{getCopy('FlyTo', 'target')}</InputLabel>
        <VirtualizedCombobox
          options={Object.keys(sortedKeys)}
          selectOption={(v: string) => handleTargetChange(sortedKeys[v])}
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
          label={getCopy('FlyTo', 'flight_duration')}
          placeholder={'Duration to Flight'}
          value={intDuration}
          onChange={(value) =>
            setIntDuration(typeof value === 'number' ? value : parseFloat(value))
          }
        />
        <Button variant={'filled'} size={'xs'} onClick={setFromOpenspace}>
          {getCopy('FlyTo', 'set_target_from_openspace')}
        </Button>
        <ToggleComponent
          value={geo}
          disabled={!hasGeoOption}
          setValue={setGeo}
          label={getCopy('FlyTo', 'set_coordinates/altitude')}
        />
      </Group>
      {hasGeoOption && geo && (
        <SimpleGrid cols={3}>
          <NumberInput
            id={'alt'}
            label={getCopy('FlyTo', 'alt')}
            placeholder={'Altitude'}
            value={alt}
            onChange={(value) =>
              setAlt(typeof value === 'number' ? value : parseFloat(value))
            }
          />
          <NumberInput
            id={'lat'}
            label={getCopy('FlyTo', 'latitude')}
            placeholder={getCopy('FlyTo', 'latitude')}
            value={lat}
            onChange={(value) =>
              setLat(typeof value === 'number' ? value : parseFloat(value))
            }
          />
          <NumberInput
            id={'long'}
            label={getCopy('FlyTo', 'longitude')}
            placeholder={getCopy('FlyTo', 'longitude')}
            value={long}
            onChange={(value) =>
              setLong(typeof value === 'number' ? value : parseFloat(value))
            }
          />
        </SimpleGrid>
      )}
      <Group align={'flex-end'} wrap={'nowrap'}>
        <TextInput
          flex={3}
          id={'guiname'}
          label={getCopy('Fade', 'component_name')}
          placeholder={'Name of Component'}
          value={guiName}
          onChange={(e) => setGuiName(e.currentTarget.value)}
        />
        <ToggleComponent label={'Lock Name'} value={lockName} setValue={setLockName} />
      </Group>
      <BackgroundHolder
        color={color}
        setColor={setColor}
        backgroundImage={backgroundImage}
        setBackgroundImage={setBackgroundImage}
      />
      <Textarea
        id={'description'}
        label={getCopy('FlyTo', 'gui_description')}
        value={guiDescription}
        onChange={(e) => setGuiDescription(e.currentTarget.value)}
        placeholder={'Type your message here.'}
      />
    </Stack>
  );
}

export { FlyToGUIComponent, FlyToModal };
