import { Box, Typography } from '@mantine/core';

import { RichTextComponent } from '@/store';

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

export { RichTextGUIComponent };
