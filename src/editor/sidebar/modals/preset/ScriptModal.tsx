import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, InputLabel, Stack } from '@mantine/core';
import CodeEditor from '@uiw/react-textarea-code-editor';

import { WidgetSettings } from '@/components/WidgetSettings';
import { ComponentBaseColors, ScriptComponent } from '@/types/components';

interface Props {
  component: ScriptComponent | null;
  handleComponentData: (data: Partial<ScriptComponent>) => void;
}

function ScriptModal({ component, handleComponentData }: Props) {
  const { t } = useTranslation('script');
  const [script, setScript] = useState<string>(component?.script || '');
  const [guiName, setGuiName] = useState<string>(component?.gui_name || '');
  const [lockName, setLockName] = useState<boolean>(component?.lockName || false);
  const [guiDescription, setGuiDescription] = useState<string>(
    component?.gui_description || ''
  );
  const [backgroundImage, setBackgroundImage] = useState<string>(
    component?.backgroundImage || ''
  );
  const [color, setColor] = useState<string>(
    component?.color || ComponentBaseColors.fade
  );

  useEffect(() => {
    handleComponentData({
      script,
      backgroundImage,
      lockName,
      gui_name: guiName,
      gui_description: guiDescription,
      color
    });
  }, [
    script,
    backgroundImage,
    guiName,
    guiDescription,
    lockName,
    color,
    handleComponentData
  ]);

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
              setScript(evn.target.value)
            }
            padding={15}
            style={{
              fontFamily:
                'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace'
            }}
          />
        </Box>
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

export { ScriptModal };
