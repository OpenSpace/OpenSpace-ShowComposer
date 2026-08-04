import { Box } from '@mantine/core';

import { PlusIcon } from '@/icons/icons';
import { LayoutType } from '@/types/components';

export function Placeholder({
  childWidth,
  childHeight,
  type,
  padding,
  hidden = false,
  columns = 1,
  index = 0
}: {
  childWidth: number;
  childHeight: number;
  type: LayoutType;
  padding: number;
  index?: number;
  hidden?: boolean;
  columns?: number;
}) {
  // Determine dimensions based on type
  let top, left, right, bottom;
  if (type === 'row') {
    bottom = `${padding}px`;
    right = `${padding}px`;
  } else if (type === 'column') {
    bottom = `${padding}px`;
    left = `${padding}px`;
  } else if (type === 'grid') {
    const rowIndex = Math.floor(index / columns);
    const columnIndex = index % columns;
    top = `${padding + rowIndex * (childHeight + padding)}px`;
    left = `${padding + columnIndex * (childWidth + padding)}px`;
  }

  return (
    <Box
      style={{
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--mantine-radius-md)',
        border: '1px dashed var(--mantine-color-dimmed)',
        height: `${childHeight}px`,
        width: `${childWidth}px`,
        top: top,
        left: left,
        right: right,
        bottom: bottom,
        visibility: hidden ? 'hidden' : 'visible'
      }}
    >
      <PlusIcon
        style={{
          width: '100%',
          height: '100%',
          maxWidth: 64,
          maxHeight: 64,
          color: 'var(--mantine-color-dimmed)'
        }}
      />
    </Box>
  );
}
