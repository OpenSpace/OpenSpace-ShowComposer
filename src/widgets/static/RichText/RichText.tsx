import { useEffect, useState } from 'react';
import { Box, InputLabel, Stack, Typography } from '@mantine/core';

import ColorPickerComponent from '@/components/ColorPickerComponent';
import { RichTextComponent } from '@/store';
import { ComponentBaseColors } from '@/types/components';

import { RichTextEditor } from './RichTextEditor';

interface RichTextGUIProps {
  component: RichTextComponent;
}

function RichTextGUIComponent({ component }: RichTextGUIProps) {
  return (
    <Box
      pos={'absolute'}
      top={0}
      left={0}
      w={'100%'}
      h={'100%'}
      p={'sm'}
      style={{
        overflow: 'hidden',
        backgroundColor: component.color,
        display: 'flex',
        alignItems: 'center',
        borderRadius: 'var(--mantine-radius-md)'
      }}
    >
      {/* We need to add styling to the raw html that is rendered by component.text, hence
        the Typography tag, which applies Mantines default styling to raw html */}
      <Typography
        w={'100%'}
        c={'light-dark(var(--mantine-color-black), var(--mantine-color-white))'}
      >
        <Box dangerouslySetInnerHTML={{ __html: component.text }} />
      </Typography>
    </Box>
  );
}

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

export { RichTextGUIComponent, RichTextModal };
