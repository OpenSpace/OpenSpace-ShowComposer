import { PropsWithChildren, ReactNode } from 'react';
import { Box } from '@mantine/core';

import { zIndex } from './zIndex';

interface Props extends PropsWithChildren {
  children: ReactNode;
  inactive: boolean;
}

// Dims the children and make them unclickable when the card is inactive (disconnected).
export function DimmableBody({ children, inactive }: Props) {
  return (
    <Box
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        zIndex: zIndex.body,
        opacity: inactive ? 0.25 : 1,
        transition: 'opacity 300ms'
      }}
    >
      {children}
      {inactive && (
        <Box
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: zIndex.disabledOverlay,
            borderRadius: 'var(--mantine-radius-md)',
            cursor: 'not-allowed'
          }}
        />
      )}
    </Box>
  );
}
