import React, { useEffect, useState } from 'react';
import Information from '@/components/common/Information';
import Toggle from '@/components/common/Toggle';
import DateComponent from '@/components/timepicker/DateComponent';
import {
  usePropertyStore,
  useOpenSpaceApiStore,
  ConnectionState,
  useComponentStore,
} from '@/store';
import { SetTimeComponent as SetTimeType } from '@/store';
import { isDate, jumpToTime } from '@/utils/time';

import { FiClock } from 'react-icons/fi'; // Example icon, choose as per need
import ImageUpload from '@/components/common/ImageUpload';

interface SetTimeComponentProps {
  component: SetTimeType;
}

const SetTimeComponent: React.FC<SetTimeComponentProps> = ({ component }) => {
  const content: string = isDate(component?.time)
    ? (component?.time as Date).toUTCString()
    : (component?.time as string);

  const connectionState = useOpenSpaceApiStore(
    (state) => state.connectionState,
  );

  const subscribeToTopic = usePropertyStore((state) => state.subscribeToTopic);
  const unsubscribeFromTopic = usePropertyStore(
    (state) => state.unsubscribeFromTopic,
  );

  useEffect(() => {
    console.log('CONNETION STATE:', connectionState);
    if (connectionState != ConnectionState.CONNECTED) return;

    subscribeToTopic('time');
    return () => {
      unsubscribeFromTopic('time');
    };
  }, [connectionState]);

  const updateComponent = useComponentStore((state) => state.updateComponent);

  useEffect(() => {
    if (!component.triggerAction) {
      console.log('Registering trigger action');
      updateComponent(component.id, {
        triggerAction: () => {
          jumpToTime(
            component.time as Date,
            component.interpolate,
            component.intDuration,
            component.fadeScene,
          );
        },
      });
      component;
    }
  }, [component]);

  // Fadetime is in seconds

  return (
    <div
      className="absolute right-0 top-0 flex h-full w-full flex-col items-center justify-center"
      style={{
        //cover and center the background image
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundImage: `url(${component.backgroundImage})`,
      }}
      onClick={() => {
        component.triggerAction?.();
      }}
    >
      <div className="absolute left-0 top-8 m-4"></div>
      <FiClock className="mr-2" />
      <div className="flex flex-row gap-4">
        <h1 className="text-2xl"> {component.gui_name}</h1>{' '}
        <Information content={component.gui_description} />
      </div>
      <h1 className="text-2xl"> {content}</h1>
      {/* <h2>Interpolate: {component.interpolate ? 'Yes' : 'No'}</h2>
      <h3>Duration: {component.intDuration}</h3>
      <h2>Fade Scene: {component.fadeScene ? 'Yes' : 'No'}</h2> */}
    </div>
  );
};

interface SetTimeModalProps {
  component: SetTimeType | null;
  handleComponentData: (data: Partial<SetTimeType>) => void;
  isOpen: boolean;
}

const SetTimeModal: React.FC<SetTimeModalProps> = ({
  component,
  handleComponentData,
  // isOpen,
}) => {
  const time = usePropertyStore(
    (state) => state.properties['time']?.['timeCapped'],
  );

  const [componentTime, setCompontentTime] = useState(component?.time || time);
  const [interpolate, setInterpolate] = useState(
    component?.interpolate || false,
  );
  const [intDuration, setIntDuration] = useState(component?.intDuration || 0);
  const [fadeScene, setFadeScene] = useState(component?.fadeScene || false); //
  const [gui_name, setGuiName] = useState(component?.gui_name); //
  const [gui_description, setGuiDescription] = useState(
    component?.gui_description,
  ); //
  const [backgroundImage, setBackgroundImage] = useState<string>(
    component?.backgroundImage || '',
  );

  useEffect(() => {
    handleComponentData({
      time: componentTime,
      interpolate,
      intDuration,
      fadeScene,
      gui_name,
      gui_description,
      backgroundImage,
    });
  }, [
    componentTime,
    interpolate,
    intDuration,
    handleComponentData,
    fadeScene,
    gui_name,
    gui_description,
    backgroundImage,
  ]);

  return (
    <>
      <div className="mb-4">
        <div className="mb-1 block flex flex-col gap-4">
          {time && (
            <DateComponent
              date={componentTime}
              onChange={(data: {
                time: Date | string;
                interpolate: boolean;
                delta: number;
                relative: boolean;
              }) => {
                console.log(data);
                setCompontentTime(data.time);
              }}
            />
          )}
          <button
            className="rounded bg-blue-500 p-2 text-white"
            onClick={() => {
              const newTime = new Date();
              console.log(newTime.toJSON());
              try {
                const fixedTimeString = newTime.toJSON().replace('Z', '');
                setCompontentTime(fixedTimeString);
              } catch {
                setCompontentTime(newTime);
              }
            }}
          >
            Set Time to Now
          </button>
          <div className="flex flex-row items-center justify-between">
            <div className="text-sm font-medium text-black">Gui Name</div>
            <input
              type="text"
              className="w-half rounded border p-2"
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
              className="w-half rounded border p-2"
              value={gui_description}
              onChange={(e) => setGuiDescription(e.target.value)}
            />
          </div>
          <div className="flex flex-row items-center justify-between">
            <div className="text-sm font-medium text-black">
              Interpolation Duration:
            </div>
            <input
              type="number"
              className="w-half rounded border p-2"
              value={intDuration}
              onChange={(e) => setIntDuration(parseInt(e.target.value))}
            />
          </div>
          <Toggle
            label="Interpolate"
            value={interpolate}
            setValue={setInterpolate}
          />
          <Toggle
            label="Fade Scene"
            value={fadeScene}
            setValue={setFadeScene}
          />
        </div>
        <ImageUpload
          value={backgroundImage}
          onChange={(v) => setBackgroundImage(v)}
        />
      </div>
    </>
  );
};

export { SetTimeModal, SetTimeComponent };
