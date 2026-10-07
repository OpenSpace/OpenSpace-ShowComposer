import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InputLabel, Stack } from '@mantine/core';

import { ImageUpload } from '@/components/ImageUpload/ImageUpload';
import { ModalFooter } from '@/editor/sidebar/modals/ModalFooter';
import {
  ComponentModalChildProps,
  useSaveComponent
} from '@/editor/sidebar/modals/saveComponent';
import { ImageComponent } from '@/store';
import { ComponentBaseColors } from '@/types/components';

const DEFAULTS: Omit<ImageComponent, 'id'> = {
  type: 'image',
  isMulti: 'false',
  gui_name: '',
  gui_description: '',
  backgroundImage: '',
  color: ComponentBaseColors.image
};

function ImageModal({
  component,
  componentId,
  initialData,
  onClose,
  onCancel
}: ComponentModalChildProps<'image'>) {
  const { t } = useTranslation('image');
  const [data, setData] = useState<ImageComponent>(
    () => component ?? { ...DEFAULTS, ...initialData, id: componentId ?? '' }
  );
  const saveComponent = useSaveComponent();
  const { backgroundImage } = data;

  function handleData(patch: Partial<ImageComponent>) {
    setData((prev) => ({ ...prev, ...patch }));
  }

  function save() {
    saveComponent(data);
    onClose();
  }

  return (
    <Stack gap={'md'}>
      <InputLabel>{t('image')}</InputLabel>
      <ImageUpload
        value={backgroundImage}
        onChange={(value) => handleData({ backgroundImage: value })}
      />
      <ModalFooter isEdit={!!component} onSave={save} onCancel={onCancel} />
    </Stack>
  );
}

export { ImageModal };
