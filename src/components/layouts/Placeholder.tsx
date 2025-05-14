import { Plus } from 'lucide-react';

import { LayoutType } from '@/store/ComponentTypes';

const Placeholder = ({
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
}) => {
  //
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
    <div
      className={`absolute flex items-center justify-center rounded-md border border-dashed border-gray-400`}
      style={{
        height: `${childHeight}px`,
        width: `${childWidth}px`,
        top: top,
        left: left,
        right: right,
        bottom: bottom,
        visibility: hidden ? 'hidden' : 'visible'
      }}
    >
      <Plus
        className={'text-gray-400'}
        style={{
          width: '100%',
          height: '100%',
          maxWidth: '64px',
          maxHeight: '64px'
        }}
      />
    </div>
  );
};

export default Placeholder;
