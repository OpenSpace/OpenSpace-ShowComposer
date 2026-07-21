import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Group,
  InputLabel,
  SimpleGrid,
  Stack,
  Textarea,
  TextInput
} from '@mantine/core';

import { useOpenSpaceApi } from '@/api/hooks';
import BackgroundHolder from '@/components/BackgroundHolder';
import ButtonLabel from '@/components/ButtonLabel';
import ComponentContainer from '@/components/ComponentContainer';
import { Information } from '@/components/Information';
import SelectableDropdown from '@/components/SelectableDropdown';
import ToggleComponent from '@/components/Toggle';
import { useSubscribeToSessionRecording } from '@/hooks/topicSubscriptions';
import { PauseIcon, PlayIcon, SquareIcon } from '@/icons/icons';
import { useBoundStore } from '@/store/boundStore';
import { ComponentBaseColors, SessionPlaybackComponent } from '@/types/components';
import { RecordingState } from '@/types/enums';
import { RecordingsFolderKey } from '@/types/types';
import { getCopy } from '@/utils/copyHelpers';

interface PlaybackControlsProps {
  recordingState: RecordingState;
  file: string;
  onTogglePlayback: () => void;
  onTogglePlaybackPaused: () => void;
}

// Renders the play/pause/stop controls for the current session-recording state.
// Shared by both the canvas widget and its edit modal
function PlaybackControls({
  recordingState,
  file,
  onTogglePlayback,
  onTogglePlaybackPaused
}: PlaybackControlsProps) {
  switch (recordingState) {
    case RecordingState.Idle:
      return file ? (
        <Button leftSection={<PlayIcon size={16} />} onClick={onTogglePlayback}>
          {getCopy('SessionPlayback', 'play')}
        </Button>
      ) : null;
    case RecordingState.Playing:
      return (
        <SimpleGrid cols={2} spacing={'xs'}>
          <Button leftSection={<PauseIcon size={16} />} onClick={onTogglePlaybackPaused}>
            {getCopy('SessionPlayback', 'pause')}
          </Button>
          <Button leftSection={<SquareIcon size={16} />} onClick={onTogglePlayback}>
            {getCopy('SessionPlayback', 'stop')}
          </Button>
        </SimpleGrid>
      );
    case RecordingState.Paused:
      return (
        <SimpleGrid cols={2} spacing={'xs'}>
          <Button leftSection={<PlayIcon size={16} />} onClick={onTogglePlaybackPaused}>
            {getCopy('SessionPlayback', 'resume')}
          </Button>
          <Button leftSection={<SquareIcon size={16} />} onClick={onTogglePlayback}>
            {getCopy('SessionPlayback', 'stop')}
          </Button>
        </SimpleGrid>
      );
    case RecordingState.Recording:
    default:
      return null;
  }
}

interface SessionPlaybackGUIProps {
  component: SessionPlaybackComponent;
  shouldRender?: boolean;
}

function SessionPlaybackGUIComponent({
  component,
  shouldRender = true
}: SessionPlaybackGUIProps) {
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

  useEffect(() => {
    if (luaApi) {
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

  if (!shouldRender) {
    return null;
  }

  return (
    <ComponentContainer
      backgroundImage={component.backgroundImage}
      backgroundColor={component.color}
    >
      <Stack align={'center'} gap={'xs'}>
        {gui_name || gui_description ? (
          <ButtonLabel>
            <Group gap={'xs'} wrap={'nowrap'}>
              {gui_name}
              <Information content={gui_description} />
            </Group>
          </ButtonLabel>
        ) : null}
        <PlaybackControls
          recordingState={recordingState}
          file={file}
          onTogglePlayback={togglePlayback}
          onTogglePlaybackPaused={togglePlaybackPaused}
        />
      </Stack>
    </ComponentContainer>
  );
}

interface SessionPlaybackModalProps {
  component: SessionPlaybackComponent | null;
  handleComponentData: (data: Partial<SessionPlaybackComponent>) => void;
}

function SessionPlaybackModal({
  component,
  handleComponentData
}: SessionPlaybackModalProps) {
  const luaApi = useOpenSpaceApi();
  const sessionRecording = useSubscribeToSessionRecording();
  const fileList = sessionRecording.files || [];
  const recordingState = sessionRecording.state || RecordingState.Idle;

  const [file, setFile] = useState<string>(component?.file || '');
  const [loop, setLoop] = useState<boolean>(component?.loop || false);
  const [guiName, setGuiName] = useState<string>(component?.gui_name || '');
  const [lockName, setLockName] = useState<boolean>(component?.lockName || false);
  const [guiDescription, setGuiDescription] = useState<string>(
    component?.gui_description || ''
  );
  const [backgroundImage, setBackgroundImage] = useState<string>(
    component?.backgroundImage || ''
  );
  const [color, setColor] = useState<string>(
    component?.color || ComponentBaseColors.sessionplayback
  );

  const isIdle = useMemo(() => recordingState === RecordingState.Idle, [recordingState]);

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
      gui_name: guiName,
      gui_description: guiDescription,
      backgroundImage,
      color
    });
  }, [
    file,
    loop,
    lockName,
    guiName,
    guiDescription,
    backgroundImage,
    color,
    handleComponentData
  ]);

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

  return (
    <Stack gap={'md'}>
      <Stack gap={'xs'}>
        <InputLabel>{getCopy('SessionPlayback', 'play_session')}</InputLabel>
        <ToggleComponent
          label={getCopy('SessionPlayback', 'loop_playback')}
          value={loop}
          setValue={setLoop}
        />
        <Stack gap={'xs'}>
          <InputLabel>{getCopy('SessionPlayback', 'playback_file')}</InputLabel>
          <SelectableDropdown
            placeholder={'Select playback file...'}
            options={fileList}
            setSelected={(value: string) => handleFileChange(value)}
            selected={file}
          />
          <PlaybackControls
            recordingState={recordingState}
            file={file}
            onTogglePlayback={togglePlayback}
            onTogglePlaybackPaused={togglePlaybackPaused}
          />
        </Stack>
      </Stack>
      <Group align={'flex-end'} wrap={'nowrap'}>
        <TextInput
          flex={3}
          id={'guiname'}
          label={getCopy('SessionPlayback', 'component_name')}
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
        label={getCopy('SessionPlayback', 'gui_description')}
        value={guiDescription}
        onChange={(e) => setGuiDescription(e.currentTarget.value)}
        placeholder={'Type your message here.'}
      />
    </Stack>
  );
}

export { SessionPlaybackGUIComponent, SessionPlaybackModal };
