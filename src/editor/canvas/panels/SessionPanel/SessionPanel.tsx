import { useMemo, useState } from 'react';
import {
  Button,
  Checkbox,
  Divider,
  Group,
  InputLabel,
  Stack,
  Text,
  TextInput
} from '@mantine/core';

import { useOpenSpaceApi } from '@/api/hooks';
import SelectableDropdown from '@/components/SelectableDropdown';
import { useSubscribeToSessionRecording } from '@/hooks/topicSubscriptions';
import { CircleIcon } from '@/icons/icons';
import { RecordingState } from '@/types/enums';
import { RecordingsFolderKey } from '@/types/types';
import { getCopy } from '@/utils/copyHelpers';

import { PlaybackSwitch } from './PlaybackSwitch';

export function SessionPanel() {
  const [useTextFormat, setUseTextFormat] = useState(false);
  const [filenameRecording, setFilenameRecording] = useState('');
  const [filenamePlayback, setFilenamePlayback] = useState<string>('');
  const [shouldOutputFrames, setShouldOutputFrames] = useState(false);
  const [loopPlayback, setLoopPlayback] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false); // State to track input focus

  const { state, files = [] } = useSubscribeToSessionRecording();

  const nameIsTaken = useMemo(() => {
    return files.map((v: string) => v.split('.')[0]).includes(filenameRecording);
  }, [files, filenameRecording]);

  const luaApi = useOpenSpaceApi();

  function onLoopPlaybackChange(newLoopPlayback: boolean) {
    if (newLoopPlayback) {
      setLoopPlayback(true);
      setShouldOutputFrames(false);
    } else {
      setLoopPlayback(newLoopPlayback);
    }
  }

  function onShouldUpdateFramesChange(newValue: boolean) {
    if (newValue) {
      setLoopPlayback(false);
      setShouldOutputFrames(true);
    } else {
      setShouldOutputFrames(newValue);
    }
  }

  function updateRecordingFilename(evt: React.ChangeEvent<HTMLInputElement>) {
    setFilenameRecording(evt.currentTarget.value);
  }

  function startRecording() {
    luaApi?.sessionRecording.startRecording();
  }

  function toggleRecording() {
    if (state === RecordingState.Idle) {
      startRecording();
    } else {
      const format = useTextFormat ? 'Ascii' : 'Binary';
      luaApi?.absPath(`${RecordingsFolderKey}${filenameRecording}`).then((value) => {
        luaApi?.sessionRecording.stopRecording(value, format);
      });
    }
  }

  return (
    <Stack m={'xs'} gap={'xs'}>
      <Stack gap={'xs'}>
        <InputLabel>{getCopy('SessionPanel', 'record_session')}</InputLabel>
        <Checkbox
          label={getCopy('SessionPanel', 'text_file_format')}
          checked={useTextFormat}
          onChange={(event) => setUseTextFormat(event.currentTarget.checked)}
        />
        <Stack gap={'xs'} w={'100%'}>
          <InputLabel>{getCopy('SessionPanel', 'name_of_recording')}</InputLabel>
          <Group w={'100%'} gap={'xs'} wrap={'nowrap'} align={'center'}>
            <TextInput
              flex={1}
              value={filenameRecording}
              placeholder={'Enter recording filename...'}
              onChange={updateRecordingFilename}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
            />
            <Button
              disabled={
                (state === RecordingState.Idle && nameIsTaken) || !filenameRecording
              }
              leftSection={<CircleIcon size={12} fill={'red'} color={'red'} />}
              flex={'0 0 auto'}
              onClick={toggleRecording}
            >
              {getCopy('SessionPanel', 'record')}
            </Button>
          </Group>
          {nameIsTaken && isInputFocused && (
            <Text c={'red.5'} size={'sm'}>
              {getCopy('SessionPanel', 'name_is_already_taken.')}
            </Text>
          )}
        </Stack>
      </Stack>
      <Divider />

      <Stack gap={'xs'}>
        <InputLabel>{getCopy('SessionPanel', 'play_session')}</InputLabel>
        <Stack gap={'xs'}>
          <Checkbox
            label={getCopy('SessionPanel', 'loop_playback')}
            checked={loopPlayback}
            onChange={(event) => onLoopPlaybackChange(event.currentTarget.checked)}
          />
          <Checkbox
            label={getCopy('SessionPanel', 'output_frames')}
            checked={shouldOutputFrames}
            onChange={(event) => onShouldUpdateFramesChange(event.currentTarget.checked)}
          />
        </Stack>
        <Stack gap={'xs'}>
          <InputLabel>{getCopy('SessionPanel', 'playback_file')}</InputLabel>
          <Stack w={'100%'} gap={'xs'}>
            <SelectableDropdown
              placeholder={'Select playback file...'}
              options={files}
              setSelected={(value: string) => setFilenamePlayback(value)}
              selected={filenamePlayback}
            />
            <PlaybackSwitch
              shouldOutputFrames={shouldOutputFrames}
              loopPlayback={loopPlayback}
              filenamePlayback={filenamePlayback}
              toggleRecording={toggleRecording}
            />
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}
