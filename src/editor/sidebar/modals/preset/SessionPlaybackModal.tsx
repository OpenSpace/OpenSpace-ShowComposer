import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InputLabel, Select, Stack } from '@mantine/core';

import { useOpenSpaceApi } from '@/api/hooks';
import { PlaybackControls } from '@/components/PlaybackControls';
import { Toggle as ToggleComponent } from '@/components/Toggle';
import { WidgetSettings } from '@/components/WidgetSettings';
import { useSubscribeToSessionRecording } from '@/hooks/topicSubscriptions';
import { ComponentBaseColors, SessionPlaybackComponent } from '@/types/components';
import { RecordingState } from '@/types/enums';
import { RecordingsFolderKey } from '@/types/types';

interface Props {
  component: SessionPlaybackComponent | null;
  handleComponentData: (data: Partial<SessionPlaybackComponent>) => void;
}

function SessionPlaybackModal({ component, handleComponentData }: Props) {
  const { t } = useTranslation('session-playback');
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
        <InputLabel>{t('play-session')}</InputLabel>
        <ToggleComponent label={t('loop-playback')} value={loop} setValue={setLoop} />
        <Stack gap={'xs'}>
          <InputLabel>{t('playback-file')}</InputLabel>
          <Select
            allowDeselect={false}
            data={fileList}
            placeholder={'Select playback file...'}
            value={file || null}
            disabled={fileList.length === 0}
            onChange={(value) => value && handleFileChange(value)}
          />
          <PlaybackControls
            recordingState={recordingState}
            file={file}
            onTogglePlayback={togglePlayback}
            onTogglePlaybackPaused={togglePlaybackPaused}
          />
        </Stack>
      </Stack>
      <WidgetSettings
        guiName={guiName}
        setGuiName={setGuiName}
        lockName={lockName}
        setLockName={setLockName}
        color={color}
        setColor={setColor}
        backgroundImage={backgroundImage}
        setBackgroundImage={setBackgroundImage}
        guiDescription={guiDescription}
        setGuiDescription={setGuiDescription}
      />
    </Stack>
  );
}

export { SessionPlaybackModal };
