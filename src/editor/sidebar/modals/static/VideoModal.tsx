import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, Text, TextInput } from '@mantine/core';

import { VideoContent } from '@/components/VideoContent';
import { ModalFooter } from '@/editor/sidebar/modals/ModalFooter';
import {
  ComponentModalChildProps,
  useSaveComponent
} from '@/editor/sidebar/modals/saveComponent';
import { VideoComponent } from '@/store';
import { ComponentBaseColors } from '@/types/components';

const DEFAULTS: Omit<VideoComponent, 'id'> = {
  type: 'video',
  isMulti: 'false',
  gui_name: '',
  gui_description: '',
  url: '',
  color: ComponentBaseColors.video
};

function VideoModal({
  component,
  componentId,
  initialData,
  onClose,
  onCancel
}: ComponentModalChildProps<'video'>) {
  const { t } = useTranslation('video');
  const [data, setData] = useState<VideoComponent>(
    () => component ?? { ...DEFAULTS, ...initialData, id: componentId ?? '' }
  );
  const saveComponent = useSaveComponent();
  const { url } = data;

  function handleData(patch: Partial<VideoComponent>) {
    setData((prev) => ({ ...prev, ...patch }));
  }

  function save() {
    saveComponent(data);
    onClose();
  }

  return (
    <Stack gap={'md'}>
      <TextInput
        label={t('video')}
        placeholder={'URL'}
        value={url}
        onChange={(e) => handleData({ url: e.currentTarget.value })}
      />
      <Text size={'sm'} c={'dimmed'} mt={'xs'} mb={'md'}>
        {t('video-helper-text')}
      </Text>
      <VideoContent url={url} />
      <ModalFooter isEdit={!!component} onSave={save} onCancel={onCancel} />
    </Stack>
  );
}

export { VideoModal };
