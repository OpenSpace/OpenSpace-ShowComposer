import type { DefaultMantineSize } from '@mantine/core';

type ExtendedSpacing = 'xxs' | DefaultMantineSize;

declare module '@mantine/core' {
  export interface MantineThemeSizesOverride {
    spacing: Record<ExtendedSpacing, string>;
  }
}
