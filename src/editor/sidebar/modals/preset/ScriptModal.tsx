import { useEffect, useState } from 'react';
import { Box, Group, InputLabel, Stack, Textarea, TextInput } from '@mantine/core';
import CodeEditor from '@uiw/react-textarea-code-editor';

import BackgroundPicker from '@/components/BackgroundPicker';
import ToggleComponent from '@/components/Toggle';
import { ComponentBaseColors, ScriptComponent } from '@/types/components';
import { getCopy } from '@/utils/copyHelpers';

interface Props {
  component: ScriptComponent | null;
  handleComponentData: (data: Partial<ScriptComponent>) => void;
}

function ScriptModal({ component, handleComponentData }: Props) {
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
        <InputLabel>{getCopy('Script', 'script')}</InputLabel>
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
      <Group align={'flex-end'} wrap={'nowrap'}>
        <TextInput
          flex={3}
          id={'guiname'}
          label={getCopy('Fade', 'component_name')}
          placeholder={'Name of Component'}
          value={guiName}
          onChange={(e) => setGuiName(e.currentTarget.value)}
        />
        <ToggleComponent label={'Lock Name'} value={lockName} setValue={setLockName} />
      </Group>
      <BackgroundPicker
        color={color}
        setColor={setColor}
        backgroundImage={backgroundImage}
        setBackgroundImage={setBackgroundImage}
      />
      <Textarea
        id={'description'}
        label={getCopy('Fade', 'gui_description')}
        value={guiDescription}
        onChange={(e) => setGuiDescription(e.currentTarget.value)}
        placeholder={'Type your message here.'}
      />
    </Stack>
  );
}

export { ScriptModal };
