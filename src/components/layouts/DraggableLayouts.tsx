import React from 'react';
import { LayoutType } from '@/store';
import { cn } from '@/lib/utils';
import {
  LayoutGrid,
  AlignHorizontalJustifyCenterIcon,
  AlignVerticalJustifyCenter,
} from 'lucide-react';

interface LayoutButtonProps {
  type: LayoutType;
  label: string;
  onLayoutCreate: (type: LayoutType) => void;
}

const layoutIcons = {
  row: AlignHorizontalJustifyCenterIcon,
  column: AlignVerticalJustifyCenter,
  grid: LayoutGrid,
};

export const DraggableLayout: React.FC<LayoutButtonProps> = ({
  type,
  label,
  onLayoutCreate,
}) => {
  const Icon = layoutIcons[type];

  return (
    <button
      onClick={() => onLayoutCreate(type)}
      className={cn(
        'flex items-center gap-2 rounded-lg p-3',
        'border border-gray-300 dark:border-gray-600',
        'bg-white dark:bg-gray-800',
        'cursor-pointer shadow-sm',
        'hover:bg-gray-50 dark:hover:bg-gray-700',
        'active:bg-gray-100 dark:active:bg-gray-600',
        'transition-all duration-200',
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};

interface LayoutToolbarProps {
  onLayoutCreate: (type: LayoutType) => void;
}

export const LayoutToolbar: React.FC<LayoutToolbarProps> = ({
  onLayoutCreate,
}) => {
  return (
    <div className="flex flex-col gap-2 p-2">
      <DraggableLayout
        type="row"
        label="Row Layout"
        onLayoutCreate={onLayoutCreate}
      />
      <DraggableLayout
        type="column"
        label="Column Layout"
        onLayoutCreate={onLayoutCreate}
      />
      <DraggableLayout
        type="grid"
        label="Grid Layout"
        onLayoutCreate={onLayoutCreate}
      />
    </div>
  );
};
