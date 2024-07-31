import SelectableDropdown from '@/components/common/SelectableDropdown';

import Information from '@/components/common/Information';
import {
  ConnectionState,
  useOpenSpaceApiStore,
  usePropertyStore,
  useComponentStore,
} from '@/store';
import { FlyToComponent } from '@/store/componentsStore';
import { useEffect, useState, useMemo, useRef } from 'react';
import StatusBar, { StatusBarRef } from '@/components/StatusBar';

// import { }
// react-icon for flight
import ImageUpload from '@/components/common/ImageUpload';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { NavigationAnchorKey } from '@/store/apiStore';
import ButtonLabel from '@/components/common/ButtonLabel';
import Toggle from '@/components/common/Toggle';

interface FlyToGUIProps {
  component: FlyToComponent;
  shouldRender?: boolean;
}

const FlyToGUIComponent: React.FC<FlyToGUIProps> = ({
  component,
  shouldRender = true,
}) => {
  const luaApi = useOpenSpaceApiStore((state) => state.luaApi);
  const updateComponent = useComponentStore((state) => state.updateComponent);

  const fadeOutDuration = 400; // 1 second fade out
  const statusBarRef = useRef<StatusBarRef>(null);
  const triggerAnimation = () => {
    statusBarRef.current?.triggerAnimation();
  };

  useEffect(() => {
    if (luaApi) {
      console.log('Registering trigger action');
      updateComponent(component.id, {
        triggerAction: () => {
          component.geo
            ? luaApi.globebrowsing.flyToGeo(
                component.target,
                component.lat,
                component.long,
                component.alt,
                component.intDuration,
              )
            : luaApi.pathnavigation.flyTo(
                component.target,
                component.intDuration,
              );
        },
      });
    }
  }, [
    component.geo,
    component.alt,
    component.target,
    component.long,
    component.intDuration,
    luaApi,
  ]);

  return shouldRender ? (
    <div
      className="absolute right-0 top-0 flex h-full w-full items-center justify-center"
      style={{
        //cover and center the background image
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundImage: `url(${component.backgroundImage})`,
      }}
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
      <ButtonLabel>
        {component.gui_name}
        <Information content={component.gui_description} />
      </ButtonLabel>
    </div>
  ) : null;
};

interface FlyToModalProps {
  component: FlyToComponent | null;
  handleComponentData: (data: Partial<FlyToComponent>) => void;
  isOpen: boolean;
}

const FlyToModal: React.FC<FlyToModalProps> = ({
  component,
  handleComponentData,
  //   isOpen,
}) => {
  const connectionState = useOpenSpaceApiStore(
    (state) => state.connectionState,
  );
  const camera = usePropertyStore(
    (state) => state.properties['camera'] || false,
  );
  const CurrentAnchor = usePropertyStore(
    (state) => state.properties[NavigationAnchorKey],
  );
  type Option = {
    name: string;
    shouldGeo: boolean;
  };
  const [options, setOptions] = useState<Option[]>();
  const favorites = usePropertyStore((state) => state.favorites);
  const properties = usePropertyStore((state) => state.properties);
  useEffect(() => {
    console.log(favorites);
    console.log(properties);
    setOptions(
      favorites.map((favorite) => {
        return {
          name: favorite.name,
          shouldGeo: !favorite.tags.includes('earth_satellite'),
        };
      }),
    );
  }, [favorites]);

  //in array of ooptiosn, find current option and check if it should be geo

  const subscribeToTopic = usePropertyStore((state) => state.subscribeToTopic);
  const unsubscribeFromTopic = usePropertyStore(
    (state) => state.unsubscribeFromTopic,
  );
  const subscribeToProperty = usePropertyStore(
    (state) => state.subscribeToProperty,
  );
  const unsubscribeFromProperty = usePropertyStore(
    (state) => state.unsubscribeFromProperty,
  );
  useEffect(() => {
    if (connectionState !== ConnectionState.CONNECTED) return;
    subscribeToTopic('camera', 500);
    subscribeToProperty(NavigationAnchorKey, 1000);

    return () => {
      unsubscribeFromTopic('camera');
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
  const [intDuration, setIntDuration] = useState<number>(
    component?.intDuration || 4,
  );
  const [target, setTarget] = useState<string>(component?.target || '');
  const [gui_name, setGuiName] = useState<string>(component?.gui_name || '');
  const [gui_description, setGuiDescription] = useState<string>(
    component?.gui_description || '',
  );
  const [backgroundImage, setBackgroundImage] = useState<string>(
    component?.backgroundImage || '',
  );
  const [lastTarget, setLastTarget] = useState<string>(component?.target || '');

  const hasGeoOption: boolean = useMemo(() => {
    const shouldGeo =
      options &&
      target &&
      options.find((option) => option.name === target)?.shouldGeo;
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
    const shouldGeo = options?.find(
      (option) => option.name === CurrentAnchor.value,
    )?.shouldGeo;
    console.log(camera);
    setTarget(CurrentAnchor.value);
    if (shouldGeo) {
      setLat(camera?.latitude || 0);
      setLong(camera?.longitude || 0);
      setAlt(
        Math.round(camera?.altitude * unitMultiplier(camera.altitudeUnit)) || 0,
      );
      setGeo(true);
    }
  };

  useEffect(() => {
    if (target !== lastTarget) {
      setGuiName(`Fly To ${target}`);
      setGuiDescription(`Fly to ${target}`);
      setLastTarget(target);
    }
  }, [target]);

  useEffect(() => {
    handleComponentData({
      geo,
      lat,
      long,
      alt,
      target,
      intDuration,
      gui_name,
      gui_description,
      backgroundImage,
    });
  }, [
    geo,
    intDuration,
    lat,
    long,
    alt,
    target,
    handleComponentData,
    gui_name,
    gui_description,
    backgroundImage,
  ]);

  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Target</Label>
            <SelectableDropdown
              options={options?.map((v) => v.name) || []}
              selected={target}
              setSelected={setTarget}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="duration">Flight Duration</Label>
            <Input
              id="duration"
              placeholder="Duration to Flight"
              type="number"
              // className=""
              value={intDuration}
              onChange={(e) => setIntDuration(parseFloat(e.target.value))}
            />
          </div>
        </div>
        <div className="my-4 grid grid-cols-2 items-center gap-4">
          <Button onClick={setFromOpenspace}>Set Target from OpenSpace</Button>
          <div className="flex items-center space-x-2">
            <Toggle
              value={geo}
              disabled={!hasGeoOption}
              setValue={setGeo}
              label="Set Coordinates/Altitude"
            />
          </div>
        </div>
        {hasGeoOption && (
          <>
            {geo == true && (
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="alt">Alt</Label>
                  <Input
                    id="alt"
                    placeholder="Altitude"
                    type="number"
                    value={alt}
                    onChange={(e) => setAlt(parseFloat(e.target.value))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lat">Latitude</Label>
                  <Input
                    id="lat"
                    placeholder="Latitude"
                    type="number"
                    value={lat}
                    onChange={(e) => setLat(parseFloat(e.target.value))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="long">Longitude</Label>
                  <Input
                    id="long"
                    placeholder="Longitude"
                    type="number"
                    value={long}
                    onChange={(e) => setLong(parseFloat(e.target.value))}
                  />
                </div>
              </div>
            )}
          </>
        )}
        <div className="grid grid-cols-1 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="gioname">Component Name</Label>
            <Input
              id="guiname"
              placeholder="Name of Component"
              type="text"
              value={gui_name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setGuiName(e.target.value)
              }
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="description"> Background Image</Label>
            <ImageUpload
              value={backgroundImage}
              onChange={(v) => setBackgroundImage(v)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description"> Gui Description</Label>
            <Textarea
              className="w-full"
              id="description"
              value={gui_description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setGuiDescription(e.target.value)
              }
              placeholder="Type your message here."
            />
          </div>
        </div>
      </div>
    </>
  );
};

export { FlyToModal, FlyToGUIComponent };
