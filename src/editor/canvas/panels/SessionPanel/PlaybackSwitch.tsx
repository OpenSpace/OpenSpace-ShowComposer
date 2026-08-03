import { Button, SimpleGrid } from '@mantine/core';

import { useOpenSpaceApi } from '@/api/hooks';
import { useSubscribeToSessionRecording } from '@/hooks/topicSubscriptions';
import { PauseIcon, PlayIcon, SquareIcon } from '@/icons/icons';
import { RecordingState } from '@/types/enums';
import { RecordingsFolderKey } from '@/types/types';
import { getCopy } from '@/utils/copyHelpers';

const OUTPUT_FRAMERATE = 60;

interface Props {
  shouldOutputFrames: boolean;
  loopPlayback: boolean;
  filenamePlayback: string;
  toggleRecording: () => void;
}

export function PlaybackSwitch({
  shouldOutputFrames,
  loopPlayback,
  filenamePlayback,
  toggleRecording
}: Props) {
  const luaApi = useOpenSpaceApi();
  const { state } = useSubscribeToSessionRecording();

  function startPlayback() {
    luaApi?.absPath(`${RecordingsFolderKey}${filenamePlayback}`).then((value) => {
      if (shouldOutputFrames) {
        luaApi?.sessionRecording.startPlayback(
          value,
          loopPlayback,
          true,
          OUTPUT_FRAMERATE
        );
      } else {
        luaApi?.sessionRecording.startPlayback(value, loopPlayback);
      }
    });
  }

  function stopPlayback() {
    luaApi?.sessionRecording.stopPlayback();
  }

  function togglePlayback() {
    if (state === RecordingState.Idle) {
      startPlayback();
    } else {
      stopPlayback();
    }
  }

  function togglePlaybackPaused() {
    luaApi?.sessionRecording.togglePlaybackPause();
  }
  switch (state) {
    case RecordingState.Idle:
      return filenamePlayback ? (
        <Button leftSection={<PlayIcon size={20} />} onClick={togglePlayback}>
          {getCopy('SessionPanel', 'play')}
        </Button>
      ) : null;
    case RecordingState.Recording:
      return (
        <Button leftSection={<SquareIcon size={20} />} onClick={toggleRecording}>
          {getCopy('SessionPanel', 'stop_recording')}
        </Button>
      );
    case RecordingState.Playing:
      return (
        <SimpleGrid cols={2} spacing={'xs'}>
          <Button leftSection={<PauseIcon size={20} />} onClick={togglePlaybackPaused}>
            {getCopy('SessionPanel', 'pause')}
          </Button>
          <Button leftSection={<SquareIcon size={20} />} onClick={togglePlayback}>
            {getCopy('SessionPanel', 'stop')}
          </Button>
        </SimpleGrid>
      );
    case RecordingState.Paused:
      return (
        <SimpleGrid cols={2} spacing={'xs'}>
          <Button leftSection={<PlayIcon size={20} />} onClick={togglePlaybackPaused}>
            {getCopy('SessionPanel', 'resume')}
          </Button>
          <Button leftSection={<SquareIcon size={20} />} onClick={togglePlayback}>
            {getCopy('SessionPanel', 'stop')}
          </Button>
        </SimpleGrid>
      );
    default:
      return null;
  }
}
