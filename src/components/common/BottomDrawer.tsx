// BottomDrawer.tsx
import React from 'react';
import { getCopy } from '@/utils/copyHelpers';
import { cn } from '@/lib/utils';

interface BottomDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const BottomDrawer: React.FC<BottomDrawerProps> = ({
  isOpen,
  onClose,
  children,
}) => {
  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 transform transition-transform',
        'max-h-1/2 overflow-y-auto bg-white bg-opacity-85 shadow-lg',
        isOpen ? 'translate-y-0' : 'translate-y-full',
      )}
    >
      <button className={cn('p-4')} onClick={onClose}>
        {getCopy('BottomDrawer', 'close')}
      </button>
      {children}
    </div>
  );
};

export default BottomDrawer;
