import { useEffect, useMemo } from 'react';
import { Button, SimpleGrid, Stack } from '@mantine/core';

import { useOpenSpaceApi } from '@/api/hooks';
import ComponentContainer from '@/components/ComponentContainer';
import DisplayLabel from '@/components/DisplayLabel';
import { Information } from '@/components/Information';
import { useSubscribeToSessionRecording } from '@/hooks/topicSubscriptions';
import { PauseIcon, PlayIcon, SquareIcon } from '@/icons/icons';
import { useBoundStore } from '@/store/boundStore';
import { SessionPlaybackComponent } from '@/types/components';
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

function SessionPlaybackWidget({
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
          <DisplayLabel>
            {gui_name}
            <Information content={gui_description} />
          </DisplayLabel>
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

export { PlaybackControls, SessionPlaybackWidget };
