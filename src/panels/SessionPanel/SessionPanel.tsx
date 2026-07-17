import { useCallback, useMemo, useState } from 'react';
import {
  Button,
  Checkbox,
  Divider,
  Group,
  InputLabel,
  SimpleGrid,
  Stack,
  Text,
  TextInput
} from '@mantine/core';

import { useOpenSpaceApi } from '@/api/hooks';
import SelectableDropdown from '@/components/SelectableDropdown';
import { useSubscribeToSessionRecording } from '@/hooks/topicSubscriptions';
import { CircleIcon, PauseIcon, PlayIcon, SquareIcon } from '@/icons/icons';
import { RecordingState } from '@/types/enums';
import { RecordingsFolderKey } from '@/types/types';
import { getCopy } from '@/utils/copyHelpers';

export function SessionPanel() {
  const [useTextFormat, _setUseTextFormat] = useState(false);
  const [filenameRecording, setFilenameRecording] = useState('');
  const [filenamePlayback, setFilenamePlayback] = useState<string>('');
  const [shouldOutputFrames, setShouldOutputFrames] = useState(false);
  const [outputFramerate, _setOutputFramerate] = useState(60);
  const [loopPlayback, setLoopPlayback] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false); // State to track input focus

  const sessionRecording = useSubscribeToSessionRecording();
  const fileList = sessionRecording.files || [];
  const recordingState = sessionRecording.state || RecordingState.Idle;

  const nameIsTaken = useMemo(() => {
    return fileList.map((v: string) => v.split('.')[0]).includes(filenameRecording);
  }, [fileList, filenameRecording]);

  const luaApi = useOpenSpaceApi();

  const isIdle = useMemo(() => recordingState === RecordingState.Idle, [recordingState]);

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
    if (isIdle) {
      startRecording();
    } else {
      const format = useTextFormat ? 'Ascii' : 'Binary';
      luaApi?.absPath(`${RecordingsFolderKey}${filenameRecording}`).then((value) => {
        luaApi?.sessionRecording.stopRecording(value, format);
      });
    }
  }

  function startPlayback() {
    if (shouldOutputFrames) {
      luaApi?.absPath(`${RecordingsFolderKey}${filenamePlayback}`).then((value) => {
        luaApi?.sessionRecording.startPlayback(
          value,
          loopPlayback,
          true,
          outputFramerate
        );
      });
    } else {
      luaApi?.absPath(`${RecordingsFolderKey}${filenamePlayback}`).then((value) => {
        luaApi?.sessionRecording.startPlayback(value, loopPlayback);
      });
    }
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
        return filenamePlayback ? (
          <Button leftSection={<PlayIcon size={16} />} onClick={() => togglePlayback()}>
            {getCopy('SessionPanel', 'play')}
          </Button>
        ) : null;
      case RecordingState.Recording:
        return (
          <Button
            leftSection={<SquareIcon size={16} />}
            onClick={() => toggleRecording()}
          >
            {getCopy('SessionPanel', 'stop_recording')}
          </Button>
        );
      case RecordingState.Playing:
        return (
          <SimpleGrid cols={2} spacing={'xs'}>
            <Button leftSection={<PauseIcon size={16} />} onClick={togglePlaybackPaused}>
              {getCopy('SessionPanel', 'pause')}
            </Button>
            <Button
              leftSection={<SquareIcon size={16} />}
              onClick={() => togglePlayback()}
            >
              {getCopy('SessionPanel', 'stop')}
            </Button>
          </SimpleGrid>
        );
      case RecordingState.Paused:
        return (
          <SimpleGrid cols={2} spacing={'xs'}>
            <Button leftSection={<PlayIcon size={16} />} onClick={togglePlaybackPaused}>
              {getCopy('SessionPanel', 'resume')}
            </Button>
            <Button
              leftSection={<SquareIcon size={16} />}
              onClick={() => togglePlayback()}
            >
              {getCopy('SessionPanel', 'stop')}
            </Button>
          </SimpleGrid>
        );
      default:
        return null;
    }
  }, [recordingState, filenameRecording, filenamePlayback]);

  return (
    <Stack m={'xs'} gap={'sm'}>
      <Stack gap={'sm'}>
        <InputLabel>{getCopy('SessionPanel', 'record_session')}</InputLabel>
        <Checkbox label={getCopy('SessionPanel', 'text_file_format')} />
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
              disabled={(isIdle && nameIsTaken) || !filenameRecording}
              leftSection={<CircleIcon size={12} fill={'red'} color={'red'} />}
              flex={'0 0 auto'}
              onClick={() => toggleRecording()}
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

      <Stack gap={'sm'}>
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
              options={fileList}
              setSelected={(value: string) => setFilenamePlayback(value)}
              selected={filenamePlayback}
            />
            {playbackSwitch()}
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}
