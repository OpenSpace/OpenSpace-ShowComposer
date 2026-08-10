import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InputLabel, Select, Stack } from '@mantine/core';

import { WidgetSettings } from '@/components/WidgetSettings';
import { useBoundStore } from '@/store/boundStore';
import { ComponentBaseColors, PageComponent } from '@/types/components';

interface Props {
  component: PageComponent | null;
  handleComponentData: (data: Partial<PageComponent>) => void;
}

function PageModal({ component, handleComponentData }: Props) {
  const { t } = useTranslation('page');
  const pages = useBoundStore((state) => state.pages);
  const [page, setPage] = useState<number>(component?.page || 1);
  const [guiName, setGuiName] = useState<string>(component?.gui_name || 'Go to Page 1');
  const [lockName, setLockName] = useState<boolean>(component?.lockName || false);
  const [guiDescription, setGuiDescription] = useState<string>(
    component?.gui_description || ''
  );
  const [backgroundImage, setBackgroundImage] = useState<string>(
    component?.backgroundImage || ''
  );
  const [color, setColor] = useState<string>(
    component?.color || ComponentBaseColors.page
  );

  const handlePageChange = (page: number) => {
    setPage(page);
    if (!lockName) {
      const pageData = pages[page - 1];
      setGuiName(`Go to ${pageData.name ? pageData.name : 'Go to Page ' + page}`);
    }
  };

  useEffect(() => {
    handleComponentData({
      page,
      backgroundImage,
      gui_name: guiName,
      lockName,
      gui_description: guiDescription,
      color
    });
  }, [
    page,
    backgroundImage,
    guiName,
    lockName,
    guiDescription,
    color,
    handleComponentData
  ]);

  return (
    <Stack gap={'md'}>
      <Stack gap={'xs'}>
        <InputLabel>{t('page-number')}</InputLabel>
        <Select
          allowDeselect={false}
          data={pages.map((v, i) => ({
            value: (i + 1).toString(),
            label: v.name ? v.name : 'Page ' + (i + 1).toString()
          }))}
          placeholder={'Select an option'}
          value={page.toString()}
          disabled={pages.length === 0}
          onChange={(value) => value && handlePageChange(parseInt(value))}
        />
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

export { PageModal };
