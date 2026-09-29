import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Group, Stack, TextInput } from '@mantine/core';

import { ModalFooter } from '@/editor/sidebar/modals/ModalFooter';
import {
  ComponentModalChildProps,
  useSaveComponent
} from '@/editor/sidebar/modals/saveComponent';
import { TitleComponent } from '@/store';
import { useBoundStore } from '@/store/boundStore';
import { ComponentBaseColors } from '@/types/components';

const DEFAULTS: Omit<TitleComponent, 'id'> = {
  type: 'title',
  isMulti: 'false',
  gui_name: '',
  gui_description: '',
  text: '',
  color: ComponentBaseColors.title
};

function TitleModal({
  component,
  componentId,
  initialData,
  onClose,
  onCancel
}: ComponentModalChildProps<'title'>) {
  const { t } = useTranslation('title');
  const [data, setData] = useState<TitleComponent>(
    () => component ?? { ...DEFAULTS, ...initialData, id: componentId ?? '' }
  );
  const saveComponent = useSaveComponent();
  const currentPageTitle = useBoundStore(
    (state) => state.getPageById(state.currentPage).name ?? ''
  );
  const { text } = data;

  function handleData(patch: Partial<TitleComponent>) {
    setData((prev) => ({ ...prev, ...patch }));
  }

  function save() {
    saveComponent(data);
    onClose();
  }

  return (
    <Stack gap={'md'}>
      <Group align={'flex-end'}>
        <TextInput
          label={t('title')}
          placeholder={currentPageTitle}
          value={text}
          onChange={(e) => handleData({ text: e.currentTarget.value })}
          flex={1}
        />
        <Button
          variant={'default'}
          onClick={() => handleData({ text: currentPageTitle })}
        >
          {t('pagetitle')}
        </Button>
      </Group>
      <ModalFooter isEdit={!!component} onSave={save} onCancel={onCancel} />
    </Stack>
  );
}

export { TitleModal };
