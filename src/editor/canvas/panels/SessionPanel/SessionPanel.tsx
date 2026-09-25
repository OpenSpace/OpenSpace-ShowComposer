import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Checkbox,
  Divider,
  Group,
  InputLabel,
  Select,
  Stack,
  Text,
  TextInput
} from '@mantine/core';

import { useOpenSpaceApi } from '@/api/hooks';
import { useSubscribeToSessionRecording } from '@/hooks/topicSubscriptions';
import { CircleIcon } from '@/icons/icons';
import { RecordingState } from '@/types/enums';
import { RecordingsFolderKey } from '@/types/types';

import { PlaybackSwitch } from './PlaybackSwitch';

export function SessionPanel() {
  const { t } = useTranslation('session-panel');
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
        <InputLabel>{t('record-session')}</InputLabel>
        <Checkbox
          label={t('text-file-format')}
          checked={useTextFormat}
          onChange={(event) => setUseTextFormat(event.currentTarget.checked)}
        />
        <Stack gap={'xs'} w={'100%'}>
          <InputLabel>{t('name-of-recording')}</InputLabel>
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
              {t('record')}
            </Button>
          </Group>
          {nameIsTaken && isInputFocused && (
            <Text c={'red.5'} size={'sm'}>
              {t('name-is-already-taken')}
            </Text>
          )}
        </Stack>
      </Stack>
      <Divider />

      <Stack gap={'xs'}>
        <InputLabel>{t('play-session')}</InputLabel>
        <Stack gap={'xs'}>
          <Checkbox
            label={t('loop-playback')}
            checked={loopPlayback}
            onChange={(event) => onLoopPlaybackChange(event.currentTarget.checked)}
          />
          <Checkbox
            label={t('output-frames')}
            checked={shouldOutputFrames}
            onChange={(event) => onShouldUpdateFramesChange(event.currentTarget.checked)}
          />
        </Stack>
        <Stack gap={'xs'}>
          <InputLabel>{t('playback-file')}</InputLabel>
          <Stack w={'100%'} gap={'xs'}>
            <Select
              allowDeselect={false}
              data={files}
              placeholder={'Select playback file...'}
              value={filenamePlayback || null}
              disabled={files.length === 0}
              onChange={(value) => value && setFilenamePlayback(value)}
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
