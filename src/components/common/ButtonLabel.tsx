import React from 'react';

interface ButtonLabelProps {
  children: React.ReactNode;
}

const ButtonLabel: React.FC<ButtonLabelProps> = ({ children }) => {
  return (
    <div className="inline-flex flex-wrap items-center justify-center gap-2 whitespace-nowrap text-wrap rounded-md border-0 border-slate-200 bg-zinc-300 px-4 py-2 text-sm font-medium text-black ">
      {children}
    </div>
  );
};

export default ButtonLabel;
