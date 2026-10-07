import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, InputLabel, Stack } from '@mantine/core';
import CodeEditor from '@uiw/react-textarea-code-editor';

import { WidgetSettings } from '@/components/WidgetSettings';
import { ModalFooter } from '@/editor/sidebar/modals/ModalFooter';
import {
  ComponentModalChildProps,
  useSaveComponent
} from '@/editor/sidebar/modals/saveComponent';
import { ComponentBaseColors, ScriptComponent } from '@/types/components';

const DEFAULTS: Omit<ScriptComponent, 'id'> = {
  type: 'script',
  isMulti: 'false',
  gui_name: '',
  gui_description: '',
  script: '',
  backgroundImage: '',
  color: ComponentBaseColors.script
};

function ScriptModal({
  component,
  componentId,
  initialData,
  onClose,
  onCancel
}: ComponentModalChildProps<'script'>) {
  const { t } = useTranslation('script');
  const [data, setData] = useState<ScriptComponent>(
    () => component ?? { ...DEFAULTS, ...initialData, id: componentId ?? '' }
  );
  const saveComponent = useSaveComponent();

  const { script } = data;
  const placeholders = { name: '', description: '' };

  function handleData(patch: Partial<ScriptComponent>) {
    setData((prev) => ({ ...prev, ...patch }));
  }

  function save() {
    saveComponent(data, placeholders);
    onClose();
  }

  return (
    <Stack gap={'md'}>
      <Stack gap={'xs'}>
        <InputLabel>{t('script')}</InputLabel>
        <Box style={{ maxHeight: '300px', overflowY: 'auto', resize: 'vertical' }}>
          <CodeEditor
            value={script}
            language={'lua'}
            placeholder={'Please enter Lua code.'}
            onChange={(evn: React.ChangeEvent<HTMLTextAreaElement>) =>
              handleData({ script: evn.target.value })
            }
            padding={15}
            style={{
              fontFamily:
                'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace'
            }}
          />
        </Box>
      </Stack>
      <WidgetSettings data={data} handleData={handleData} placeholders={placeholders} />
      <ModalFooter isEdit={!!component} onSave={save} onCancel={onCancel} />
    </Stack>
  );
}

export { ScriptModal };
