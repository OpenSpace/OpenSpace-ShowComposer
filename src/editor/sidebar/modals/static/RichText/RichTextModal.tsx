import { useEffect, useState } from 'react';
import { InputLabel, Stack } from '@mantine/core';

import ColorPicker from '@/components/ColorPicker';
import { RichTextComponent } from '@/store';
import { ComponentBaseColors } from '@/types/components';

import { RichTextEditor } from './RichTextEditor';

interface RichTextModalProps {
  component: RichTextComponent | null;
  handleComponentData: (data: Partial<RichTextComponent>) => void;
}

function RichTextModal({ component, handleComponentData }: RichTextModalProps) {
  const [text, setText] = useState(component?.text || '');
  const [color, setColor] = useState(component?.color || ComponentBaseColors.richtext);

  useEffect(() => {
    handleComponentData({ text, color });
  }, [text, color, handleComponentData]);

  return (
    <Stack gap={'md'}>
      <Stack gap={'xs'}>
        <InputLabel>Background Color</InputLabel>
        <ColorPicker color={color} setColor={setColor} />
      </Stack>
      <RichTextEditor content={text} setContent={setText} />
    </Stack>
  );
}

export { RichTextModal };
