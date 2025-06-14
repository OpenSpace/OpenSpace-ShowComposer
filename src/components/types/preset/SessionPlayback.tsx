import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pause, Play, Square } from 'lucide-react';

import BackgroundHolder from '@/components/common/BackgroundHolder';
import ButtonLabel from '@/components/common/ButtonLabel';
import ComponentContainer from '@/components/common/ComponentContainer';
import Information from '@/components/common/Information';
import SelectableDropdown from '@/components/common/SelectableDropdown';
import ToggleComponent from '@/components/common/Toggle';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ConnectionState, useOpenSpaceApiStore, usePropertyStore } from '@/store';
import { useBoundStore } from '@/store/boundStore';
import { SessionPlaybackComponent } from '@/types/components';
import { ComponentBaseColors } from '@/types/components';
import { RecordingsFolderKey } from '@/types/types';
import { getCopy } from '@/utils/copyHelpers';
//set up recording state
export const SessionStateIdle = 'idle';
export const SessionStateRecording = 'recording';
export const SessionStatePlaying = 'playing';
export const SessionStatePaused = 'playing-paused';
interface SessionPlaybackModalProps {
  component: SessionPlaybackComponent | null;
  handleComponentData: (data: Partial<SessionPlaybackComponent>) => void;
  // isOpen: boolean;
}
const SessionPlaybackModal: React.FC<SessionPlaybackModalProps> = ({
  component,
  handleComponentData
  //   isOpen,
}) => {
  const connectionState = useOpenSpaceApiStore((state) => state.connectionState);
  const luaApi = useOpenSpaceApiStore((state) => state.luaApi);
  const fileList = usePropertyStore((state) => state.sessionRecording.files || []);
  const recordingState = usePropertyStore(
    (state) => state.sessionRecording.state || SessionStateIdle
  );
  const subscribeToTopic = usePropertyStore((state) => state.subscribeToTopic);
  // const refreshTopic = usePropertyStore((state) => state.refreshTopic);
  const unsubscribeFromTopic = usePropertyStore((state) => state.unsubscribeFromTopic);
  useEffect(() => {
    if (connectionState != ConnectionState.CONNECTED) return;
    subscribeToTopic('sessionRecording', 0, ['state', 'files']);
    return () => {
      unsubscribeFromTopic('sessionRecording');
    };
  }, [connectionState]);

  useEffect(() => {
    console.log('recordingState', recordingState);
    console.log('fileList', fileList);
  }, [recordingState, fileList]);

  const [file, setFile] = useState<string>(component?.file || '');
  const [loop, setLoop] = useState<boolean>(component?.loop || false);

  const [gui_name, setGuiName] = useState<string>(component?.gui_name || '');
  const [lockName, setLockName] = useState<boolean>(component?.lockName || false);
  const [gui_description, setGuiDescription] = useState<string>(
    component?.gui_description || ''
  );
  const [backgroundImage, setBackgroundImage] = useState<string>(
    component?.backgroundImage || ''
  );
  const [color, setColor] = useState<string>(
    component?.color || ComponentBaseColors.sessionplayback
  );
  const handleFileChange = (file: string) => {
    setFile(file);
    if (!lockName) {
      setGuiName(`Playback ${file.split('.')[0]}`);
    }
  };

  useEffect(() => {
    handleComponentData({
      file,
      loop,
      lockName,
      gui_name,
      gui_description,
      backgroundImage,
      color
    });
  }, [
    file,
    loop,
    lockName,
    gui_name,
    gui_description,
    backgroundImage,
    color,
    handleComponentData
  ]);
  const isIdle = useMemo(() => recordingState === SessionStateIdle, [recordingState]);

  function onLoopPlaybackChange(newLoopPlayback: boolean) {
    if (newLoopPlayback) {
      setLoop(true);
      // setShouldOutputFrames(false);
    } else {
      setLoop(newLoopPlayback);
    }
  }

  function startPlayback() {
    luaApi?.absPath(`${RecordingsFolderKey}${file}`).then((value) => {
      luaApi?.sessionRecording.startPlayback(value['1'], loop);
    });
  }

  function stopPlayback() {
    luaApi?.sessionRecording.stopPlayback();
  }
  function togglePlayback() {
    if (isIdle) {
      startPlayback();
    } else {
      stopPlayback();
    }
  }
  function togglePlaybackPaused() {
    luaApi?.sessionRecording.togglePlaybackPause();
  }
  const playbackSwitch = useCallback(() => {
    switch (recordingState) {
      case SessionStateIdle:
        return file ? (
          <Button
            variant={'outline'}
            //   size={'sm'}
            //   disabled={(isIdle && nameIsTaken) || !filenameRecording}
            className={'gap-2'}
            onClick={() => togglePlayback()}
          >
            <Play />
            {getCopy('SessionPlayback', 'play')}
          </Button>
        ) : null;
      case SessionStateRecording:
        return null;
      case SessionStatePlaying:
        return (
          <div className={'grid grid-cols-2 gap-2'}>
            <Button
              variant={'outline'}
              //   size={'sm'}
              // disabled={!filenamePlayback}
              className={'gap-2'}
              onClick={togglePlaybackPaused}
            >
              <Pause />
              {getCopy('SessionPlayback', 'pause')}
            </Button>
            <Button
              variant={'outline'}
              //   size={'sm'}
              // disabled={(isIdle && nameIsTaken) || !filenameRecording}
              className={'gap-2'}
              onClick={() => togglePlayback()}
            >
              <Square />
              {getCopy('SessionPlayback', 'stop')}
            </Button>
          </div>
        );
      case SessionStatePaused:
        return (
          <div className={'grid grid-cols-2 gap-2'}>
            <Button
              variant={'outline'}
              //   size={'sm'}
              // disabled={!filenamePlayback}
              className={'gap-2'}
              onClick={togglePlaybackPaused}
            >
              <Play />
              {getCopy('SessionPlayback', 'resume')}
            </Button>
            <Button
              variant={'outline'}
              //   size={'sm'}
              // disabled={(isIdle && nameIsTaken) || !filenameRecording}
              className={'gap-2'}
              onClick={() => togglePlayback()}
            >
              <Square />
              {getCopy('SessionPlayback', 'stop')}
            </Button>
          </div>
        );
      default:
        return null;
    }
  }, [recordingState, file]);
  return (
    <div className={'grid grid-cols-1 gap-4'}>
      <div className={'grid grid-cols-1 gap-4'}>
        <div className={'grid gap-2'}>
          <Label className={'flex items-center justify-start gap-2'}>
            {getCopy('SessionPlayback', 'play_session')}
          </Label>
          <div className={'grid gap-2'}>
            <div className={'flex items-center space-x-2'}>
              <Checkbox
                id={'loop'}
                checked={loop}
                onCheckedChange={(checked: boolean | 'indeterminate') => {
                  if (checked !== 'indeterminate') onLoopPlaybackChange(checked);
                }}
              />
              <Label htmlFor={'loop'}>
                {getCopy('SessionPlayback', 'loop_playback')}
              </Label>
            </div>
          </div>
          <div className={'grid grid-cols-1 gap-2'}>
            <Label htmlFor={'playback'}>
              {getCopy('SessionPlayback', 'playback_file')}
            </Label>
            <div className={'flex w-full flex-col gap-2'}>
              {/* <div className="grow"> */}
              <SelectableDropdown
                placeholder={'Select playback file...'}
                options={fileList}
                setSelected={(value: string) => handleFileChange(value)}
                selected={file}
              />
              {playbackSwitch()}
            </div>
          </div>
        </div>
        <div className={'grid grid-cols-4 gap-4'}>
          <div className={'col-span-3 grid gap-2'}>
            <Label htmlFor={'gioname'}>
              {getCopy('SessionPlayback', 'component_name')}
            </Label>
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
        <div className={'grid grid-cols-1 gap-4'}>
          <BackgroundHolder
            color={color}
            setColor={setColor}
            backgroundImage={backgroundImage}
            setBackgroundImage={setBackgroundImage}
          />
          <div className={'grid gap-2'}>
            <Label htmlFor={'description'}>
              {getCopy('SessionPlayback', 'gui_description')}
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
  );
};
interface SessionPlaybackGUIProps {
  component: SessionPlaybackComponent;
  shouldRender?: boolean;
}
const SessionPlaybackGUIComponent: React.FC<SessionPlaybackGUIProps> = ({
  component,
  shouldRender = true
}) => {
  const { file, loop, gui_name, gui_description } = component;
  const recordingState = usePropertyStore(
    (state) => state.sessionRecording.state || SessionStateIdle
  );
  const connectionState = useOpenSpaceApiStore((state) => state.connectionState);
  const luaApi = useOpenSpaceApiStore((state) => state.luaApi);
  const updateComponent = useBoundStore((state) => state.updateComponent);
  const subscribeToTopic = usePropertyStore((state) => state.subscribeToTopic);
  // const refreshTopic = usePropertyStore((state) => state.refreshTopic);
  const unsubscribeFromTopic = usePropertyStore((state) => state.unsubscribeFromTopic);
  useEffect(() => {
    if (connectionState != ConnectionState.CONNECTED) return;
    subscribeToTopic('sessionRecording', 0, ['state', 'files']);
    return () => {
      unsubscribeFromTopic('sessionRecording');
    };
  }, [connectionState]);
  const isIdle = useMemo(() => recordingState === SessionStateIdle, [recordingState]);

  function startPlayback() {
    luaApi?.absPath(`${RecordingsFolderKey}${file}`).then((value) => {
      luaApi?.sessionRecording.startPlayback(value['1'], loop);
    });
  }

  function stopPlayback() {
    luaApi?.sessionRecording.stopPlayback();
  }

  function togglePlayback() {
    if (isIdle) {
      startPlayback();
    } else {
      stopPlayback();
    }
  }
  function togglePlaybackPaused() {
    luaApi?.sessionRecording.togglePlaybackPause();
  }
  // function refreshPlaybackFilesList() {
  //   refreshTopic('sessionRecording', ['state', 'files']);
  // }
  useEffect(() => {
    if (luaApi) {
      // console.log('Registering trigger action');
      updateComponent(component.id, {
        triggerAction: () => {
          togglePlayback();
        },
        isDisabled: false
      });
    } else {
      updateComponent(component.id, {
        isDisabled: true
      });
    }
  }, [luaApi, file, loop, isIdle]);

  const playbackSwitch = useCallback(() => {
    switch (recordingState) {
      case SessionStateIdle:
        return file ? (
          <Button
            variant={'outline'}
            className={'gap-2'}
            onClick={() => togglePlayback()}
          >
            <Play />
            {getCopy('SessionPlayback', 'play')}
          </Button>
        ) : null;
      case SessionStateRecording:
        return null;
      case SessionStatePlaying:
        return (
          <div className={'grid grid-cols-2 gap-2'}>
            <Button
              variant={'outline'}
              className={'gap-2'}
              onClick={togglePlaybackPaused}
            >
              <Pause />
              {getCopy('SessionPlayback', 'pause')}
            </Button>
            <Button
              variant={'outline'}
              className={'gap-2'}
              onClick={() => togglePlayback()}
            >
              <Square />
              {getCopy('SessionPlayback', 'stop')}
            </Button>
          </div>
        );
      case SessionStatePaused:
        return (
          <div className={'grid grid-cols-2 gap-2'}>
            <Button
              variant={'outline'}
              className={'gap-2'}
              onClick={togglePlaybackPaused}
            >
              <Play />
              {getCopy('SessionPlayback', 'resume')}
            </Button>
            <Button
              variant={'outline'}
              className={'gap-2'}
              onClick={() => togglePlayback()}
            >
              <Square />
              {getCopy('SessionPlayback', 'stop')}
            </Button>
          </div>
        );
      default:
        return null;
    }
  }, [file, recordingState]);
  return shouldRender ? (
    <ComponentContainer
      backgroundImage={component.backgroundImage}
      backgroundColor={component.color}
    >
      <div className={'flex flex-col items-center justify-center gap-2'}>
        {gui_name || gui_description ? (
          <ButtonLabel>
            {gui_name}
            <Information content={gui_description} />
          </ButtonLabel>
        ) : null}
        {playbackSwitch()}
      </div>
    </ComponentContainer>
  ) : null;
};
export { SessionPlaybackGUIComponent, SessionPlaybackModal };
