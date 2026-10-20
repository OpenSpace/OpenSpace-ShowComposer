import { useTranslation } from 'react-i18next';
import { Button, SimpleGrid } from '@mantine/core';

import { useOpenSpaceApi } from '@/api/hooks';
import { useSubscribeToSessionRecording } from '@/hooks/topicSubscriptions';
import { PauseIcon, PlayIcon, SquareIcon } from '@/icons/icons';
import { IconSize, RecordingState } from '@/types/enums';
import { RecordingsFolderKey } from '@/types/types';

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
  const { t } = useTranslation('session-panel');
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
        <Button leftSection={<PlayIcon size={IconSize.md} />} onClick={togglePlayback}>
          {t('play')}
        </Button>
      ) : null;
    case RecordingState.Recording:
      return (
        <Button leftSection={<SquareIcon size={IconSize.md} />} onClick={toggleRecording}>
          {t('stop-recording')}
        </Button>
      );
    case RecordingState.Playing:
      return (
        <SimpleGrid cols={2} spacing={'xs'}>
          <Button
            leftSection={<PauseIcon size={IconSize.md} />}
            onClick={togglePlaybackPaused}
          >
            {t('pause')}
          </Button>
          <Button
            leftSection={<SquareIcon size={IconSize.md} />}
            onClick={togglePlayback}
          >
            {t('stop')}
          </Button>
        </SimpleGrid>
      );
    case RecordingState.Paused:
      return (
        <SimpleGrid cols={2} spacing={'xs'}>
          <Button
            leftSection={<PlayIcon size={IconSize.md} />}
            onClick={togglePlaybackPaused}
          >
            {t('resume')}
          </Button>
          <Button
            leftSection={<SquareIcon size={IconSize.md} />}
            onClick={togglePlayback}
          >
            {t('stop')}
          </Button>
        </SimpleGrid>
      );
    default:
      return null;
  }
}
