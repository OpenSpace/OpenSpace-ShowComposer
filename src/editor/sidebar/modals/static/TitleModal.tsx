import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Group, TextInput } from '@mantine/core';

import { TitleComponent } from '@/store';
import { useBoundStore } from '@/store/boundStore';

interface Props {
  component: TitleComponent | null;
  handleComponentData: (data: Partial<TitleComponent>) => void;
}

function TitleModal({ component, handleComponentData }: Props) {
  const { t } = useTranslation('title');
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
        label={t('title')}
        value={text}
        onChange={(e) => setText(e.currentTarget.value)}
        flex={1}
      />
      <Button variant={'default'} onClick={() => setText(currentPageTitle ?? '')}>
        {t('pagetitle')}
      </Button>
    </Group>
  );
}

export { TitleModal };
