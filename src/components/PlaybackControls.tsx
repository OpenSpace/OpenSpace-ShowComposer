import { useTranslation } from 'react-i18next';
import { Button, SimpleGrid } from '@mantine/core';

import { PauseIcon, PlayIcon, SquareIcon } from '@/icons/icons';
import { IconSize, RecordingState } from '@/types/enums';

interface Props {
  recordingState: RecordingState;
  file: string;
  onTogglePlayback: () => void;
  onTogglePlaybackPaused: () => void;
}

// Renders the play/pause/stop controls for the current session-recording state.
// Shared by both the canvas widget and its edit modal
export function PlaybackControls({
  recordingState,
  file,
  onTogglePlayback,
  onTogglePlaybackPaused
}: Props) {
  const { t } = useTranslation('session-playback');

  switch (recordingState) {
    case RecordingState.Idle:
      if (!file) {
        return null;
      }
      return (
        <Button leftSection={<PlayIcon size={IconSize.sm} />} onClick={onTogglePlayback}>
          {t('play')}
        </Button>
      );
    case RecordingState.Playing:
      return (
        <SimpleGrid cols={2} spacing={'xs'}>
          <Button
            leftSection={<PauseIcon size={IconSize.sm} />}
            onClick={onTogglePlaybackPaused}
          >
            {t('pause')}
          </Button>
          <Button
            leftSection={<SquareIcon size={IconSize.sm} />}
            onClick={onTogglePlayback}
          >
            {t('stop')}
          </Button>
        </SimpleGrid>
      );
    case RecordingState.Paused:
      return (
        <SimpleGrid cols={2} spacing={'xs'}>
          <Button
            leftSection={<PlayIcon size={IconSize.sm} />}
            onClick={onTogglePlaybackPaused}
          >
            {t('resume')}
          </Button>
          <Button
            leftSection={<SquareIcon size={IconSize.sm} />}
            onClick={onTogglePlayback}
          >
            {t('stop')}
          </Button>
        </SimpleGrid>
      );
    case RecordingState.Recording:
    default:
      return null;
  }
}
