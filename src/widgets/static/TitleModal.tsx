import { useEffect, useState } from 'react';
import { Button, Group, TextInput } from '@mantine/core';

import { TitleComponent } from '@/store';
import { useBoundStore } from '@/store/boundStore';
import { getCopy } from '@/utils/copyHelpers';

interface TitleModalProps {
  component: TitleComponent | null;
  handleComponentData: (data: Partial<TitleComponent>) => void;
}

function TitleModal({ component, handleComponentData }: TitleModalProps) {
  const currentPageTitle = useBoundStore(
    (state) => state.getPageById(state.currentPage).name ?? ''
  );
  const [text, setText] = useState(component?.text ?? currentPageTitle);

  useEffect(() => {
    handleComponentData({ text });
  }, [text, handleComponentData]);

  return (
    <Group align={'flex-end'}>
      <TextInput
        label={getCopy('Title', 'title')}
        value={text}
        onChange={(e) => setText(e.currentTarget.value)}
        flex={1}
      />
      <Button variant={'default'} onClick={() => setText(currentPageTitle ?? '')}>
        {getCopy('Title', 'pageTitle')}
      </Button>
    </Group>
  );
}

export { TitleModal };
