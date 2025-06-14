import React, { useEffect, useMemo, useRef, useState } from 'react';

import BackgroundHolder from '@/components/common/BackgroundHolder';
import ButtonLabel from '@/components/common/ButtonLabel';
import ComponentContainer from '@/components/common/ComponentContainer';
import Information from '@/components/common/Information';
import Toggle from '@/components/common/Toggle';
import ToggleComponent from '@/components/common/Toggle';
import StatusBar, { StatusBarRef } from '@/components/StatusBar';
import DateComponent from '@/components/timepicker/DateComponent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ConnectionState, useOpenSpaceApiStore, usePropertyStore } from '@/store';
import { SetTimeComponent as SetTimeType } from '@/store';
import { useBoundStore } from '@/store/boundStore';
import { ComponentBaseColors } from '@/types/components';
import { getCopy } from '@/utils/copyHelpers';
import { formatDate, jumpToTime } from '@/utils/time';

interface SetTimeComponentProps {
  component: SetTimeType;
}
const SetTimeComponent: React.FC<SetTimeComponentProps> = ({ component }) => {
  const connectionState = useOpenSpaceApiStore((state) => state.connectionState);
  const luaApi = useOpenSpaceApiStore((state) => state.luaApi);
  const subscribeToTopic = usePropertyStore((state) => state.subscribeToTopic);
  const unsubscribeFromTopic = usePropertyStore((state) => state.unsubscribeFromTopic);
  useEffect(() => {
    if (connectionState != ConnectionState.CONNECTED) return;
    subscribeToTopic('time');
    return () => {
      unsubscribeFromTopic('time');
    };
  }, [connectionState]);
  const updateComponent = useBoundStore((state) => state.updateComponent);
  useEffect(() => {
    if (luaApi) {
      // console.log('Registering trigger action');
      updateComponent(component.id, {
        triggerAction: () => {
          jumpToTime(
            component.time as Date,
            component.interpolate,
            component.intDuration,
            component.fadeScene
          );
        },
        isDisabled: false
      });
    } else {
      updateComponent(component.id, {
        isDisabled: true
      });
    }
  }, [
    component.time,
    component.interpolate,
    component.intDuration,
    component.fadeScene,
    luaApi
  ]);

  // Fadetime is in seconds
  const fadeOutDuration = 400; // 1 second fade out
  const statusBarRef = useRef<StatusBarRef>(null);
  const triggerAnimation = () => {
    statusBarRef.current?.triggerAnimation();
  };
  return (
    <ComponentContainer
      backgroundImage={component.backgroundImage}
      backgroundColor={component.color}
      onClick={() => {
        component.triggerAction?.();
        triggerAnimation();
      }}
    >
      {component?.interpolate && component.intDuration && (
        <StatusBar
          ref={statusBarRef}
          duration={component?.intDuration}
          fadeOutDuration={fadeOutDuration}
        />
      )}
      <ButtonLabel>
        <div className={'flex flex-row gap-2'}>
          {component.gui_name}
          <Information content={component.gui_description} />
        </div>
      </ButtonLabel>
    </ComponentContainer>
  );
};
interface SetTimeModalProps {
  component: SetTimeType | null;
  handleComponentData: (data: Partial<SetTimeType>) => void;
  isOpen: boolean;
}
const SetTimeModal: React.FC<SetTimeModalProps> = ({
  component,
  handleComponentData
  // isOpen,
}) => {
  const time = usePropertyStore((state) => state.time?.['timeCapped']);
  const [componentTime, setCompontentTime] = useState(component?.time || time);
  const [interpolate, setInterpolate] = useState(component?.interpolate || false);
  const [intDuration, setIntDuration] = useState(component?.intDuration || 4);
  const [fadeScene, setFadeScene] = useState(component?.fadeScene || false); //
  const [gui_name, setGuiName] = useState(component?.gui_name); //
  const [gui_description, setGuiDescription] = useState(component?.gui_description); //
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
      gui_name,
      lockName,
      gui_description,
      backgroundImage,
      color
    });
  }, [
    componentTime,
    interpolate,
    intDuration,
    handleComponentData,
    fadeScene,
    gui_name,
    lockName,
    gui_description,
    backgroundImage,
    color
  ]);
  return (
    <>
      <div className={'grid grid-cols-1 gap-4'}>
        {time && (
          <DateComponent
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
          onClick={() => {
            const newTime = new Date();
            setCompontentTime(newTime);
          }}
        >
          {getCopy('SetTime', 'set_time_to_now')}
        </Button>
        <div className={'grid grid-cols-4 gap-4'}>
          <div className={'col-span-3 grid gap-2'}>
            <Label htmlFor={'guiname'}>{getCopy('SetTime', 'component_name')}</Label>
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
          <div className={'cols-span-1 mt-6 grid gap-2'}>
            <ToggleComponent
              label={'Lock Name'}
              value={lockName}
              setValue={setLockName}
            />
          </div>
        </div>
        <div className={'grid  gap-4'}>
          <div className={'grid grid-cols-4 gap-4'}>
            <div className={'col-span-2 grid gap-2'}>
              <Label htmlFor={'duration'}>{getCopy('SetTime', 'fade_duration')}</Label>
              <Input
                id={'duration'}
                placeholder={'Duration to Fade'}
                type={'number'}
                // className=""
                value={intDuration}
                onChange={(e) => setIntDuration(parseFloat(e.target.value))}
              />
            </div>
            <div className={'grid gap-2'}>
              <Label />
              <Toggle
                label={'Interpolate'}
                value={interpolate}
                setValue={setInterpolate}
              />
            </div>
            <div className={'grid gap-2'}>
              <Label />
              <Toggle
                label={'Fade Scene'}
                disabled={!interpolate}
                value={fadeScene}
                setValue={setFadeScene}
              />
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
              <Label htmlFor={'description'}>
                {getCopy('SetTime', 'gui_description')}
              </Label>
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
      </div>
    </>
  );
};
export { SetTimeComponent, SetTimeModal };
