import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonLabelProps {
  children: React.ReactNode;
  className?: string;
}

const ButtonLabel: React.FC<ButtonLabelProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        'inline-flex flex-wrap items-center justify-center gap-2 whitespace-nowrap text-wrap rounded-md border-0 border-slate-200 bg-zinc-300 px-4 py-2 text-sm font-medium text-black',
        className,
      )}
    >
      {children}
    </div>
  );
};

export default ButtonLabel;
