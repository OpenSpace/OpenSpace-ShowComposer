import { useEffect, useState } from 'react';
import { Button, Group, InputLabel, Modal, Stack, Text, TextInput } from '@mantine/core';

import ColorPicker from '@/components/ColorPicker';
import { useBoundStore } from '@/store/boundStore';
import { ComponentBaseColors, Page } from '@/types/components';

interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  newPage: boolean;
}

function NewPageModal({ isOpen, setIsOpen, newPage }: Props) {
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
      title={newPage ? 'Create New Page' : 'Update Page Settings'}
    >
      <Text>
        {newPage
          ? 'Set the name and background color for the new page.'
          : 'Update the page name and background color.'}
      </Text>
      <Stack gap={'md'}>
        <TextInput
          label={'Page Name'}
          size={'xs'}
          value={pageName}
          onChange={(e) => setPageName(e.currentTarget.value)}
          placeholder={'Enter Page Name'}
        />
        <Stack gap={'xs'}>
          <InputLabel>Background Color</InputLabel>
          <ColorPicker color={backgroundColor} setColor={setBackgroundColor} />
        </Stack>
      </Stack>
      <Group justify={'flex-end'} mt={'md'}>
        <Button variant={'default'} onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
        <Button variant={'filled'} onClick={handleSubmit}>
          {newPage ? 'Create Page' : 'Update Page'}
        </Button>
      </Group>
    </Modal>
  );
}

export default NewPageModal;
