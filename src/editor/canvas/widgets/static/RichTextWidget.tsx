import { Box, Typography } from '@mantine/core';

import type { RichTextComponent } from '@/store';

interface Props {
  component: RichTextComponent;
}

function RichTextWidget({ component }: Props) {
  return (
    <Box
      pos={'absolute'}
      top={0}
      left={0}
      w={'100%'}
      h={'100%'}
      p={'sm'}
      bg={component.color}
      display={'flex'}
      bdrs={'md'}
      style={{
        overflow: 'hidden',
        alignItems: 'center'
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

export { RichTextWidget };
