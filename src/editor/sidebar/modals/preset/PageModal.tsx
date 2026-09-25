import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InputLabel, Select, Stack } from '@mantine/core';

import { WidgetSettings } from '@/components/WidgetSettings';
import { ModalFooter } from '@/editor/sidebar/modals/ModalFooter';
import {
  ComponentModalChildProps,
  useSaveComponent
} from '@/editor/sidebar/modals/saveComponent';
import { useBoundStore } from '@/store/boundStore';
import { ComponentBaseColors, PageComponent } from '@/types/components';

const DEFAULTS: Omit<PageComponent, 'id'> = {
  type: 'page',
  isMulti: 'false',
  gui_name: '',
  gui_description: '',
  page: 1,
  backgroundImage: '',
  color: ComponentBaseColors.page
};

function PageModal({
  component,
  componentId,
  initialData,
  onClose,
  onCancel
}: ComponentModalChildProps<'page'>) {
  const { t } = useTranslation('page');
  const [data, setData] = useState<PageComponent>(
    () => component ?? { ...DEFAULTS, ...initialData, id: componentId ?? '' }
  );
  const saveComponent = useSaveComponent();
  const pages = useBoundStore((state) => state.pages);

  const { page } = data;
  const pageData = pages[page - 1];

  const placeholders = pageData
    ? {
        name: `Go to ${pageData.name ? pageData.name : 'Page ' + page}`,
        description: ''
      }
    : { name: '', description: '' };

  function handleData(patch: Partial<PageComponent>) {
    setData((prev) => ({ ...prev, ...patch }));
  }

  function save() {
    saveComponent(data, placeholders);
    onClose();
  }

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
          onChange={(value) => value && handleData({ page: parseInt(value) })}
        />
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

export { PageModal };
