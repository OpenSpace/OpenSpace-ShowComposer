// import SelectableDropdown from '@/components/common/SelectableDropdown';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

import BackgroundHolder from '@/components/common/BackgroundHolder';
import ButtonLabel from '@/components/common/ButtonLabel';
import ComponentContainer from '@/components/common/ComponentContainer';
import Information from '@/components/common/Information';
import ToggleComponent from '@/components/common/Toggle';
import Toggle from '@/components/common/Toggle';
import { VirtualizedCombobox } from '@/components/common/VirtualizedCombobox';
import StatusBar, { StatusBarRef } from '@/components/StatusBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ConnectionState, useOpenSpaceApiStore, usePropertyStore } from '@/store';
import { NavigationAnchorKey } from '@/store/apiStore';
import { useBoundStore } from '@/store/boundStore';
import { FlyToComponent } from '@/types/components';
import { ComponentBaseColors } from '@/types/components';
import { AnyProperty } from '@/types/Property/property';
import { formatName, getStringBetween } from '@/utils/apiHelpers';
import { getCopy } from '@/utils/copyHelpers';

interface FlyToGUIProps {
  component: FlyToComponent;
  shouldRender?: boolean;
}
const FlyToGUIComponent: React.FC<FlyToGUIProps> = ({
  component,
  shouldRender = true
}) => {
  const luaApi = useOpenSpaceApiStore((state) => state.luaApi);
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
  return shouldRender ? (
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
        <ButtonLabel>
          <div className={'flex flex-row gap-2'}>
            {component.gui_name}
            <Information content={component.gui_description} />
          </div>
        </ButtonLabel>
      ) : null}
    </ComponentContainer>
  ) : null;
};

interface FlyToModalProps {
  component: FlyToComponent | null;
  handleComponentData: (data: Partial<FlyToComponent>) => void;
  isOpen: boolean;
}
const FlyToModal: React.FC<FlyToModalProps> = ({
  component,
  handleComponentData
  //   isOpen,
}) => {
  // const throttledHandleComponentData = throttle(handleComponentData, 3000);

  const connectionState = useOpenSpaceApiStore((state) => state.connectionState);
  const camera = usePropertyStore((state) => state.camera);
  const CurrentAnchor = usePropertyStore(
    (state) => state.properties[NavigationAnchorKey]
  );
  type Option = {
    name: string;
    shouldGeo: boolean;
  };
  const [options, setOptions] = useState<Option[]>();

  const profile = usePropertyStore((state) => state.profile);
  const setFavorites = usePropertyStore((state) => state.setFavorites);
  // console.log("PROFILE", profile);
  const favorites = usePropertyStore((state) => state.favorites);
  // const properties = usePropertyStore((state) => state.properties);
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

  useEffect(() => {
    setFavorites(profile.markNodes);
  }, [profile, properties]);
  // FIX FAVORITESSSSSSS
  useEffect(() => {
    setOptions(
      favorites.map((favorite) => {
        return {
          name: favorite,
          shouldGeo: true
          // !favorites[favorite].tags.includes('earth_satellite')
        };
      })
    );
  }, [favorites]);
  //
  //in array of ooptiosn, find current option and check if it should be geo

  const subscribeToTopic = usePropertyStore((state) => state.subscribeToTopic);
  const unsubscribeFromTopic = usePropertyStore((state) => state.unsubscribeFromTopic);
  const subscribeToProperty = usePropertyStore((state) => state.subscribeToProperty);
  const unsubscribeFromProperty = usePropertyStore(
    (state) => state.unsubscribeFromProperty
  );
  const cancelTopic = usePropertyStore((state) => state.cancelTopic);

  useEffect(() => {
    if (connectionState !== ConnectionState.CONNECTED) return;
    subscribeToTopic('camera', 500);
    subscribeToTopic('profile', 1000);
    subscribeToProperty(NavigationAnchorKey, 1000);
    return () => {
      unsubscribeFromTopic('camera');
      cancelTopic('profile');
      unsubscribeFromProperty(NavigationAnchorKey);
    };
  }, [connectionState]);
  useEffect(() => {
    if (component) {
      setGeo(component?.geo || false);
    }
  }, [component]);

  const [geo, setGeo] = useState<boolean>(component?.geo || false);
  const [long, setLong] = useState<number>(component?.long || 0);
  const [lat, setLat] = useState<number>(component?.lat || 0);
  const [alt, setAlt] = useState<number>(component?.alt || 0);
  const [intDuration, setIntDuration] = useState<number>(component?.intDuration || 4);
  const [target, setTarget] = useState<string>(component?.target || '');
  const [lockName, setLockName] = useState<boolean>(component?.lockName || false);
  const [gui_name, setGuiName] = useState<string>(component?.gui_name || '');
  const [gui_description, setGuiDescription] = useState<string>(
    component?.gui_description || ''
  );
  const [backgroundImage, setBackgroundImage] = useState<string>(
    component?.backgroundImage || ''
  );
  const [color, setColor] = useState<string>(
    component?.color || ComponentBaseColors.flyto
  );
  const hasGeoOption: boolean = useMemo(() => {
    const shouldGeo =
      options && target && options.find((option) => option.name === target)?.shouldGeo;
    if (!shouldGeo) {
      setGeo(false);
    }
    return shouldGeo || false;
  }, [target, options]);

  const unitMultiplier = (unit: string) => {
    switch (unit) {
      case 'km':
        return 1000;
      case 'm':
        return 1;
      case 'ft':
        return 0.3048;
      case 'mi':
        return 1609.34;
      case 'nmi':
        return 1852;
      default:
        return 1;
    }
  };

  const setFromOpenspace = () => {
    const shouldGeo = options?.find((option) => option.name === CurrentAnchor.value)
      ?.shouldGeo;
    setTarget(String(CurrentAnchor.value));
    if (shouldGeo) {
      setLat(camera.latitude || 0);
      setLong(camera.longitude || 0);
      setAlt(
        Math.round(camera.altitude || 0) * unitMultiplier(camera.altitudeUnit || 'm')
      );
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
      gui_name,
      gui_description,
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
    gui_name,
    gui_description,
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
          // console.log(newValue);
          acc[formatName(newValue)] = getStringBetween(key, 'Scene.', '.Renderable');
          return acc;
        }, {}),
    [properties]
  );
  return (
    <>
      <div className={'grid grid-cols-1 gap-4'}>
        <div className={'grid grid-cols-1 gap-4'}>
          <div className={'grid gap-2'}>
            <Label>{getCopy('FlyTo', 'target')}</Label>
            <VirtualizedCombobox
              options={Object.keys(sortedKeys)}
              selectOption={(v: string) => handleTargetChange(sortedKeys[v])}
              selectedOption={
                Object.keys(sortedKeys).find((key) => sortedKeys[key] === target) || ''
              }
              searchPlaceholder={'Search the Scene...'}
              presets={
                options?.map((v) => ({
                  value: v.name,
                  label: v.name
                })) || null
              }
            />
          </div>
        </div>
        <div className={'my-4 grid grid-cols-3 justify-start gap-4'}>
          <div className={'grid gap-2'}>
            <Label htmlFor={'duration'}>{getCopy('FlyTo', 'flight_duration')}</Label>
            <Input
              id={'duration'}
              placeholder={'Duration to Flight'}
              type={'number'}
              // className=""
              value={intDuration}
              onChange={(e) => setIntDuration(parseFloat(e.target.value))}
            />
          </div>
          <Button
            size={'sm'}
            onClick={setFromOpenspace}
            className={'mt-6 whitespace-normal text-xs'}
          >
            {getCopy('FlyTo', 'set_target_from_openspace')}
          </Button>
          {/* <div className="flex items-center space-x-2"> */}
          <div className={'grid gap-2'}>
            <Label htmlFor={'duration'}>
              {getCopy('FlyTo', 'set_coordinates/altitude')}
            </Label>
            <Toggle
              value={geo}
              disabled={!hasGeoOption}
              setValue={setGeo}
              label={getCopy('FlyTo', 'set_coordinates/altitude')}
            />
          </div>
        </div>
        {hasGeoOption && (
          <>
            {geo == true && (
              <div className={'grid grid-cols-3 gap-4'}>
                <div className={'grid gap-2'}>
                  <Label htmlFor={'alt'}>{getCopy('FlyTo', 'alt')}</Label>
                  <Input
                    id={'alt'}
                    placeholder={'Altitude'}
                    type={'number'}
                    value={alt}
                    onChange={(e) => setAlt(parseFloat(e.target.value))}
                  />
                </div>
                <div className={'grid gap-2'}>
                  <Label htmlFor={'lat'}>{getCopy('FlyTo', 'latitude')}</Label>
                  <Input
                    id={'lat'}
                    placeholder={getCopy('FlyTo', 'latitude')}
                    type={'number'}
                    value={lat}
                    onChange={(e) => setLat(parseFloat(e.target.value))}
                  />
                </div>
                <div className={'grid gap-2'}>
                  <Label htmlFor={'long'}>{getCopy('FlyTo', 'longitude')}</Label>
                  <Input
                    id={'long'}
                    placeholder={getCopy('FlyTo', 'longitude')}
                    type={'number'}
                    value={long}
                    onChange={(e) => setLong(parseFloat(e.target.value))}
                  />
                </div>
              </div>
            )}
          </>
        )}
        <div className={'grid grid-cols-4 '}>
          <div className={'col-span-3 grid grid-cols-3 gap-4'}>
            <div className={'col-span-2 grid gap-2'}>
              <Label htmlFor={'gioname'}>{getCopy('Fade', 'component_name')}</Label>
              <Input
                id={'guiname'}
                placeholder={'Name of Component'}
                type={'text'}
                value={gui_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setGuiName(e.target.value)
                }
              />
            </div>
            <div className={'col-span-1 mt-6 grid gap-2'}>
              <ToggleComponent
                label={'Lock Name'}
                value={lockName}
                setValue={setLockName}
              />
            </div>
          </div>
        </div>
        <div className={'grid grid-cols-1 gap-4'}>
          <BackgroundHolder
            color={color}
            setColor={setColor}
            backgroundImage={backgroundImage}
            setBackgroundImage={setBackgroundImage}
          />
          <div className={'grid gap-2'}>
            <Label htmlFor={'description'}>{getCopy('FlyTo', 'gui_description')}</Label>
            <Textarea
              className={'w-full'}
              id={'description'}
              value={gui_description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setGuiDescription(e.target.value)
              }
              placeholder={'Type your message here.'}
            />
          </div>
        </div>
      </div>
    </>
  );
};
export { FlyToGUIComponent, FlyToModal };
