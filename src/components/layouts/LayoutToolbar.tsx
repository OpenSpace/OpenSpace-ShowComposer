import { LayoutType } from '@/store';
import { cn } from '@/lib/utils';
import {
  LayoutGrid,
  AlignHorizontalJustifyCenterIcon,
  AlignVerticalJustifyCenter,
} from 'lucide-react';

interface LayoutToolbarProps {
  onLayoutCreate: (type: LayoutType) => void;
}

export const LayoutToolbar: React.FC<LayoutToolbarProps> = ({
  onLayoutCreate,
}) => {
  const buttonClasses = cn(
    'flex items-center gap-2 rounded-lg p-3',
    'border border-gray-300 dark:border-gray-600',
    'bg-white dark:bg-gray-800',
    'cursor-pointer shadow-sm',
    'hover:bg-gray-50 dark:hover:bg-gray-700',
    'active:bg-gray-100 dark:active:bg-gray-600',
    'transition-all duration-200',
  );

  return (
    <div className="flex flex-col gap-2 p-2">
      <button onClick={() => onLayoutCreate('row')} className={buttonClasses}>
        <AlignHorizontalJustifyCenterIcon className="h-5 w-5" />
        <span className="text-sm font-medium">Row Layout</span>
      </button>

      <button
        onClick={() => onLayoutCreate('column')}
        className={buttonClasses}
      >
        <AlignVerticalJustifyCenter className="h-5 w-5" />
        <span className="text-sm font-medium">Column Layout</span>
      </button>

      <button onClick={() => onLayoutCreate('grid')} className={buttonClasses}>
        <LayoutGrid className="h-5 w-5" />
        <span className="text-sm font-medium">Grid Layout</span>
      </button>
    </div>
  );
};
