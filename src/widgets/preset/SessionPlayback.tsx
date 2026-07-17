import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Checkbox, InputLabel, Textarea, TextInput } from '@mantine/core';
import { Pause, Play, Square } from 'lucide-react';

import { useOpenSpaceApi } from '@/api/hooks';
import BackgroundHolder from '@/components/BackgroundHolder';
import ButtonLabel from '@/components/ButtonLabel';
import ComponentContainer from '@/components/ComponentContainer';
import { Information } from '@/components/Information';
import SelectableDropdown from '@/components/SelectableDropdown';
import ToggleComponent from '@/components/Toggle';
import { useSubscribeToSessionRecording } from '@/hooks/topicSubscriptions';
import { useBoundStore } from '@/store/boundStore';
import { ComponentBaseColors, SessionPlaybackComponent } from '@/types/components';
import { RecordingState } from '@/types/enums';
import { RecordingsFolderKey } from '@/types/types';
import { getCopy } from '@/utils/copyHelpers';

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
  const luaApi = useOpenSpaceApi();
  const sessionRecording = useSubscribeToSessionRecording();
  const fileList = sessionRecording.files || [];
  const recordingState = sessionRecording.state || RecordingState.Idle;

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
  const isIdle = useMemo(() => recordingState === RecordingState.Idle, [recordingState]);

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
      luaApi?.sessionRecording.startPlayback(value, loop);
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
      case RecordingState.Idle:
        return file ? (
          <Button
            //   size={'sm'}
            //   disabled={(isIdle && nameIsTaken) || !filenameRecording}
            leftSection={<Play size={16} />}
            onClick={() => togglePlayback()}
          >
            {getCopy('SessionPlayback', 'play')}
          </Button>
        ) : null;
      case RecordingState.Recording:
        return null;
      case RecordingState.Playing:
        return (
          <div className={'grid grid-cols-2 gap-2'}>
            <Button
              //   size={'sm'}
              // disabled={!filenamePlayback}
              leftSection={<Pause size={16} />}
              onClick={togglePlaybackPaused}
            >
              {getCopy('SessionPlayback', 'pause')}
            </Button>
            <Button
              //   size={'sm'}
              // disabled={(isIdle && nameIsTaken) || !filenameRecording}
              leftSection={<Square size={16} />}
              onClick={() => togglePlayback()}
            >
              {getCopy('SessionPlayback', 'stop')}
            </Button>
          </div>
        );
      case RecordingState.Paused:
        return (
          <div className={'grid grid-cols-2 gap-2'}>
            <Button
              //   size={'sm'}
              // disabled={!filenamePlayback}
              leftSection={<Play size={16} />}
              onClick={togglePlaybackPaused}
            >
              {getCopy('SessionPlayback', 'resume')}
            </Button>
            <Button
              //   size={'sm'}
              // disabled={(isIdle && nameIsTaken) || !filenameRecording}
              leftSection={<Square size={16} />}
              onClick={() => togglePlayback()}
            >
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
          <InputLabel className={'flex items-center justify-start gap-2'}>
            {getCopy('SessionPlayback', 'play_session')}
          </InputLabel>
          <div className={'grid gap-2'}>
            <div className={'flex items-center space-x-2'}>
              <Checkbox
                id={'loop'}
                checked={loop}
                onChange={(event) => onLoopPlaybackChange(event.currentTarget.checked)}
              />
              <InputLabel htmlFor={'loop'}>
                {getCopy('SessionPlayback', 'loop_playback')}
              </InputLabel>
            </div>
          </div>
          <div className={'grid grid-cols-1 gap-2'}>
            <InputLabel htmlFor={'playback'}>
              {getCopy('SessionPlayback', 'playback_file')}
            </InputLabel>
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
            <InputLabel htmlFor={'gioname'}>
              {getCopy('SessionPlayback', 'component_name')}
            </InputLabel>
            <TextInput
              id={'guiname'}
              placeholder={'Name of Component'}
              value={gui_name}
              onChange={(e) => setGuiName(e.currentTarget.value)}
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
            <InputLabel htmlFor={'description'}>
              {getCopy('SessionPlayback', 'gui_description')}
            </InputLabel>
            <Textarea
              className={'w-full'}
              id={'description'}
              value={gui_description}
              onChange={(e) => setGuiDescription(e.currentTarget.value)}
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
  const recordingState = useSubscribeToSessionRecording().state || RecordingState.Idle;
  const luaApi = useOpenSpaceApi();
  const updateComponent = useBoundStore((state) => state.updateComponent);
  const isIdle = useMemo(() => recordingState === RecordingState.Idle, [recordingState]);

  function startPlayback() {
    luaApi?.absPath(`${RecordingsFolderKey}${file}`).then((value) => {
      luaApi?.sessionRecording.startPlayback(value, loop);
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
      case RecordingState.Idle:
        return file ? (
          <Button leftSection={<Play size={16} />} onClick={() => togglePlayback()}>
            {getCopy('SessionPlayback', 'play')}
          </Button>
        ) : null;
      case RecordingState.Recording:
        return null;
      case RecordingState.Playing:
        return (
          <div className={'grid grid-cols-2 gap-2'}>
            <Button leftSection={<Pause size={16} />} onClick={togglePlaybackPaused}>
              {getCopy('SessionPlayback', 'pause')}
            </Button>
            <Button leftSection={<Square size={16} />} onClick={() => togglePlayback()}>
              {getCopy('SessionPlayback', 'stop')}
            </Button>
          </div>
        );
      case RecordingState.Paused:
        return (
          <div className={'grid grid-cols-2 gap-2'}>
            <Button leftSection={<Play size={16} />} onClick={togglePlaybackPaused}>
              {getCopy('SessionPlayback', 'resume')}
            </Button>
            <Button leftSection={<Square size={16} />} onClick={() => togglePlayback()}>
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
