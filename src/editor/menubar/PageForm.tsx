import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Group, InputLabel, Stack, TextInput } from '@mantine/core';

import { ColorPicker } from '@/components/ColorPicker';

interface Props {
  submitLabel: string;
  initialName: string;
  initialColor: string;
  onSubmit: (name: string, color: string) => void;
  onClose: () => void;
}

// The form shared by the modals for creating and editing a page
export function PageForm({
  submitLabel,
  initialName,
  initialColor,
  onSubmit,
  onClose
}: Props) {
  const { t } = useTranslation('new-page-modal');
  const [pageName, setPageName] = useState(initialName);
  const [backgroundColor, setBackgroundColor] = useState(initialColor);

  function handleSubmit() {
    onSubmit(pageName, backgroundColor);
    onClose();
  }

  return (
    <>
      <Stack gap={'md'}>
        <TextInput
          label={t('page-name')}
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
        <Button variant={'default'} onClick={onClose}>
          {t('cancel')}
        </Button>
        <Button variant={'filled'} onClick={handleSubmit}>
          {submitLabel}
        </Button>
      </Group>
    </>
  );
}
