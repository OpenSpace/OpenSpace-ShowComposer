import { Button, SimpleGrid } from '@mantine/core';

import { PauseIcon, PlayIcon, SquareIcon } from '@/icons/icons';
import { RecordingState } from '@/types/enums';
import { getCopy } from '@/utils/copyHelpers';

interface Props {
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
}: Props) {
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

export { PlaybackControls };
