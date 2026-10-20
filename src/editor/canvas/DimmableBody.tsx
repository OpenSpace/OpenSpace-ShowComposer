import type { PropsWithChildren, ReactNode } from 'react';
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
      pos={'relative'}
      w={'100%'}
      h={'100%'}
      opacity={inactive ? 0.25 : 1}
      style={{ zIndex: zIndex.body, transition: 'opacity 300ms' }}
    >
      {children}
      {inactive && (
        <Box
          pos={'absolute'}
          inset={0}
          bdrs={'md'}
          style={{ zIndex: zIndex.disabledOverlay, cursor: 'not-allowed' }}
        />
      )}
    </Box>
  );
}
