import { Tooltip } from '@mantine/core';

interface Props {
  children: React.ReactNode;
  content: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export function TooltipHolder({ children, content, side }: Props) {
  return (
    <Tooltip label={content} position={side}>
      {children}
    </Tooltip>
  );
}
