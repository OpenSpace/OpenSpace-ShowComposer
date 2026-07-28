import { CSSProperties, ReactNode } from 'react';
import { Box } from '@mantine/core';

type DisplayLabelSize = 'sm' | 'md';

interface DisplayLabelProps {
  children: ReactNode;
  showBorder?: boolean;
  size?: DisplayLabelSize;
  style?: CSSProperties;
}

const sizeStyles: Record<DisplayLabelSize, CSSProperties> = {
  sm: {
    fontSize: 'var(--mantine-font-size-xs)',
    padding: '4px var(--mantine-spacing-xs)'
  },
  md: {
    fontSize: 'var(--mantine-font-size-sm)',
    padding: '8px var(--mantine-spacing-md)'
  }
};

function DisplayLabel({
  children,
  showBorder = false,
  size = 'md',
  style
}: DisplayLabelProps) {
  return (
    <Box
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--mantine-spacing-xs)',
        whiteSpace: 'nowrap',
        borderRadius: 'var(--mantine-radius-md)',
        backgroundColor: 'var(--mantine-color-body)',
        color: 'var(--mantine-color-white)',
        fontWeight: 500,
        maxWidth: '100%',
        maxHeight: '100%',
        border: showBorder ? '1px solid var(--mantine-color-default-border)' : undefined,
        ...sizeStyles[size],
        ...style
      }}
    >
      {children}
    </Box>
  );
}

export default DisplayLabel;
