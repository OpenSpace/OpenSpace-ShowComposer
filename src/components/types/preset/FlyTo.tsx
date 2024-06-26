import SelectableDropdown from '@/components/common/SelectableDropdown';
import Button from '@/components/common/Button';
import Toggle from '@/components/common/Toggle';
import Information from '@/components/common/Information';
import {
  ConnectionState,
  useOpenSpaceApiStore,
  usePropertyStore,
  useComponentStore,
} from '@/store';
import { FlyToComponent } from '@/store/componentsStore';
import { useEffect, useState } from 'react';
// import { }
// react-icon for flight
import { FiAirplay } from 'react-icons/fi';

interface FlyToGUIProps {
  component: FlyToComponent;
}

const FlyToGUIComponent: React.FC<FlyToGUIProps> = ({ component }) => {
  const luaApi = useOpenSpaceApiStore((state) => state.luaApi);
  const updateComponent = useComponentStore((state) => state.updateComponent);

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
                component.duration,
              )
            : luaApi.pathnavigation.flyTo(component.target, component.duration);
        },
      });
    }
  }, [
    component.alt,
    component.target,
    component.long,
    component.duration,
    luaApi,
  ]);

  return (
    <div
      className="absolute right-0 top-0 flex h-full w-full items-center justify-center"
      onClick={() => component.triggerAction?.()}
    >
      <div className="flex flex-row gap-4">
        <h1 className="text-2xl"> {component.gui_name}</h1>{' '}
        <Information content={component.gui_description} />
      </div>
    </div>
  );
};

interface FlyToModalProps {
  component: FlyToComponent | null;
  handleComponentData: (data: Partial<FlyToComponent>) => void;
  isOpen: boolean;
}

const FlyToModal: React.FC<FlyToModalProps> = ({
  component,
  handleComponentData,
  isOpen,
}) => {
  const connectionState = useOpenSpaceApiStore(
    (state) => state.connectionState,
  );
  const camera = usePropertyStore(
    (state) => state.properties['camera'] || false,
  );

  const favorites = usePropertyStore((state) => state.favorites);

  const subscribeToTopic = usePropertyStore((state) => state.subscribeToTopic);
  const unsubscribeFromTopic = usePropertyStore(
    (state) => state.unsubscribeFromTopic,
  );

  useEffect(() => {
    if (connectionState !== ConnectionState.CONNECTED) return;
    subscribeToTopic('camera', 500);
    return () => {
      unsubscribeFromTopic('camera');
    };
  }, [connectionState]);

  const [geo, setGeo] = useState(component?.geo || false);

  const [long, setLong] = useState(component?.long || 0);
  const [lat, setLat] = useState(component?.lat) || 0;
  const [alt, setAlt] = useState(component?.alt || 0);
  const [duration, setDuration] = useState(component?.duration || 0);
  const [target, setTarget] = useState(component?.target || '');
  //   const [fadeScene, setFadeScene] = useState(component?.fadeScene || false); //
  const [gui_name, setGuiName] = useState(component?.gui_name); //
  const [gui_description, setGuiDescription] = useState(
    component?.gui_description,
  ); //

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
    setLat(camera?.latitude || 0);
    setLong(camera?.longitude || 0);
    setAlt(
      Math.round(camera?.altitude * unitMultiplier(camera.altitudeUnit)) || 0,
    );
    setGeo(true);
  };
  //   console.log(component);

  useEffect(() => {
    handleComponentData({
      geo,
      lat,
      long,
      alt,
      target,
      duration,
      gui_name,
      gui_description,
    });
  }, [
    geo,
    duration,
    lat,
    long,
    alt,
    target,
    handleComponentData,
    gui_name,
    gui_description,
  ]);

  return (
    <>
      <div className="mb-4">
        <div className="mb-1 flex flex-col gap-2">
          <div className="flex flex-row items-center justify-between">
            <div className="text-sm font-medium text-black">Gui Name</div>
            <input
              type="text"
              className="w-[50%] rounded border p-2"
              value={gui_name}
              onChange={(e) => setGuiName(e.target.value)}
            />
          </div>
          <div className="flex flex-row items-center justify-between">
            <div className="text-sm font-medium text-black">
              Gui Description
            </div>
            <input
              type="textbox"
              className="w-[50%] rounded border p-2"
              value={gui_description}
              onChange={(e) => setGuiDescription(e.target.value)}
            />
          </div>

          <div className="flex flex-row items-center justify-between">
            <div className="text-sm font-medium text-black">Target</div>
            <div className="w-[50%]">
              <SelectableDropdown
                options={favorites.map((v) => v.name)}
                selected={target}
                setSelected={setTarget}
              />
            </div>
          </div>
          <div className="flex flex-row items-center justify-between">
            <div className="text-sm font-medium text-black">Duration</div>
            <input
              type="number"
              className="w-[50%] rounded border p-2"
              value={duration}
              onChange={(e) => setDuration(parseFloat(e.target.value))}
            />
          </div>

          <Toggle label="Geo" value={geo} setValue={setGeo} />
          {geo && (
            <>
              <div className="flex flex-row items-center justify-between">
                <div className="text-sm font-medium text-black">Altitude</div>
                <input
                  type="number"
                  className="w-[50%] rounded border p-2"
                  value={alt}
                  onChange={(e) => setAlt(parseFloat(e.target.value))}
                />
              </div>
              <div className="flex flex-row items-center justify-between">
                <div className="text-sm font-medium text-black">Latitude</div>
                <input
                  type="number"
                  className="w-[50%] rounded border p-2"
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value))}
                />
              </div>
              <div className="flex flex-row items-center justify-between">
                <div className="text-sm font-medium text-black">Longitude</div>
                <input
                  type="number"
                  className="w-[50%] rounded border p-2"
                  value={long}
                  onChange={(e) => setLong(parseFloat(e.target.value))}
                />
              </div>

              <Button
                width="auto"
                //   className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
                onClick={setFromOpenspace}
                text={'Set from OpenSpace'}
                icon={<FiAirplay />}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export { FlyToModal, FlyToGUIComponent };
