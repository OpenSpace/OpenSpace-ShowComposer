import { Tooltip } from '@mantine/core';

interface TooltipHolderProps {
  children: React.ReactNode;
  content: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export function TooltipHolder({ children, content, side }: TooltipHolderProps) {
  return (
    <Tooltip label={content} position={side}>
      {children}
    </Tooltip>
  );
}
