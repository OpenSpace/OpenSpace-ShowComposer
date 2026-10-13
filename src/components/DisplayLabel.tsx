import type { ReactNode } from 'react';
import { Flex, type FlexProps } from '@mantine/core';

type DisplayLabelSize = 'sm' | 'md';

const sizeProps: Record<DisplayLabelSize, FlexProps> = {
  sm: { fz: 'xs', py: '4px', px: 'sm' },
  md: { fz: 'sm', py: '8px', px: 'md' }
};

interface Props extends FlexProps {
  children: ReactNode;
  showBorder?: boolean;
  size?: DisplayLabelSize;
}

export function DisplayLabel({
  children,
  showBorder = false,
  size = 'md',
  ...props
}: Props) {
  return (
    <Flex
      display={'inline-flex'}
      align={'center'}
      justify={'center'}
      gap={'xs'}
      bdrs={'md'}
      bg={'var(--mantine-color-body)'}
      c={'white'}
      fw={500}
      maw={'100%'}
      mah={'100%'}
      bd={showBorder ? '1px solid var(--mantine-color-default-border)' : undefined}
      {...sizeProps[size]}
      {...props}
    >
      {children}
    </Flex>
  );
}
