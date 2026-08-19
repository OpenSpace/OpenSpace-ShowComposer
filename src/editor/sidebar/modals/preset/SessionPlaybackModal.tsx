import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InputLabel, Select, Stack } from '@mantine/core';

import { useOpenSpaceApi } from '@/api/hooks';
import { PlaybackControls } from '@/components/PlaybackControls';
import { Toggle as ToggleComponent } from '@/components/Toggle';
import { WidgetSettings } from '@/components/WidgetSettings';
import { ModalFooter } from '@/editor/sidebar/modals/ModalFooter';
import {
  ComponentModalChildProps,
  useSaveComponent
} from '@/editor/sidebar/modals/saveComponent';
import { useSubscribeToSessionRecording } from '@/hooks/topicSubscriptions';
import { ComponentBaseColors, SessionPlaybackComponent } from '@/types/components';
import { RecordingState } from '@/types/enums';
import { RecordingsFolderKey } from '@/types/types';

const DEFAULTS: Omit<SessionPlaybackComponent, 'id'> = {
  type: 'sessionplayback',
  isMulti: 'false',
  gui_name: '',
  gui_description: '',
  file: '',
  loop: false,
  backgroundImage: '',
  color: ComponentBaseColors.sessionplayback
};

function SessionPlaybackModal({
  component,
  componentId,
  initialData,
  onClose,
  onCancel
}: ComponentModalChildProps<'sessionplayback'>) {
  const { t } = useTranslation('session-playback');
  const [data, setData] = useState<SessionPlaybackComponent>(
    () => component ?? { ...DEFAULTS, ...initialData, id: componentId ?? '' }
  );
  const saveComponent = useSaveComponent();
  const luaApi = useOpenSpaceApi();
  const sessionRecording = useSubscribeToSessionRecording();
  const fileList = sessionRecording.files || [];
  const recordingState = sessionRecording.state || RecordingState.Idle;

  const { file, loop } = data;

  const placeholders = file
    ? { name: `Playback ${file.split('.')[0]}`, description: '' }
    : { name: '', description: '' };

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

  function handleData(patch: Partial<SessionPlaybackComponent>) {
    setData((prev) => ({ ...prev, ...patch }));
  }

  function save() {
    saveComponent(data, placeholders);
    onClose();
  }

  return (
    <Stack gap={'md'}>
      <Stack gap={'xs'}>
        <InputLabel>{t('play-session')}</InputLabel>
        <ToggleComponent
          label={t('loop-playback')}
          value={loop}
          setValue={(v) => handleData({ loop: v })}
        />
        <Stack gap={'xs'}>
          <InputLabel>{t('playback-file')}</InputLabel>
          <Select
            allowDeselect={false}
            data={fileList}
            placeholder={'Select playback file...'}
            value={file || null}
            disabled={fileList.length === 0}
            onChange={(value) => value && handleData({ file: value })}
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
        data={data}
        handleData={handleData}
        placeholders={placeholders}
      />
      <ModalFooter isEdit={!!component} onSave={save} onCancel={onCancel} />
    </Stack>
  );
}

export { SessionPlaybackModal };
