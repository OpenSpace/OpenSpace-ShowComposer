import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Group, InputLabel, Modal, Stack, Text, TextInput } from '@mantine/core';

import { ColorPicker } from '@/components/ColorPicker';
import { useBoundStore } from '@/store/boundStore';
import { ComponentBaseColors, type Page } from '@/types/components';

interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  newPage: boolean;
}

export function NewPageModal({ isOpen, setIsOpen, newPage }: Props) {
  const { t } = useTranslation('new-page-modal');
  const currentPage: Page = useBoundStore((state) =>
    state.getPageById(state.currentPage)
  );

  const [pageName, setPageName] = useState<string>(
    newPage ? '' : currentPage?.name || ''
  );
  const [backgroundColor, setBackgroundColor] = useState<string>(
    newPage ? ComponentBaseColors.page : currentPage?.color || ComponentBaseColors.page
  );
  useEffect(() => {
    if (!newPage) {
      setPageName(currentPage?.name || '');
      setBackgroundColor(currentPage?.color || ComponentBaseColors.page);
    } else {
      setPageName('');
      setBackgroundColor(ComponentBaseColors.page);
    }
  }, [isOpen]);
  const addPage = useBoundStore((state) => state.addPage);
  const updatePage = useBoundStore((state) => state.updatePage);

  const handleSubmit = () => {
    if (newPage) {
      addPage(undefined, pageName, backgroundColor);
    } else {
      updatePage(currentPage.id, { name: pageName, color: backgroundColor });
    }
    setIsOpen(false);
  };

  return (
    <Modal
      opened={isOpen}
      onClose={() => setIsOpen(false)}
      centered
      title={newPage ? t('create-page-title') : t('update-page-title')}
    >
      <Text>{newPage ? t('create-page-description') : t('update-page-description')}</Text>
      <Stack gap={'md'}>
        <TextInput
          label={t('page-name')}
          size={'xs'}
          value={pageName}
          onChange={(e) => setPageName(e.currentTarget.value)}
          placeholder={t('page-name-placeholder')}
        />
        <Stack gap={'xs'}>
          <InputLabel>{t('background-color')}</InputLabel>
          <ColorPicker color={backgroundColor} setColor={setBackgroundColor} />
        </Stack>
      </Stack>
      <Group justify={'flex-end'} mt={'md'}>
        <Button variant={'default'} onClick={() => setIsOpen(false)}>
          {t('cancel')}
        </Button>
        <Button variant={'filled'} onClick={handleSubmit}>
          {newPage ? t('create-page') : t('update-page')}
        </Button>
      </Group>
    </Modal>
  );
}
