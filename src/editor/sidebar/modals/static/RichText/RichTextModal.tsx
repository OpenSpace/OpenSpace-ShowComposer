import { useEffect, useState } from 'react';
import { InputLabel, Stack } from '@mantine/core';

import ColorPickerComponent from '@/components/ColorPickerComponent';
import { RichTextEditor } from '@/editor/canvas/widgets/static/RichText/RichTextEditor';
import { RichTextComponent } from '@/store';
import { ComponentBaseColors } from '@/types/components';

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
        <ColorPickerComponent color={color} setColor={setColor} />
      </Stack>
      <RichTextEditor content={text} setContent={setText} />
    </Stack>
  );
}

export { RichTextModal };
