import React, { ReactNode } from 'react';

interface ButtonProps {
  icon?: ReactNode;
  text?: string;
  onClick: () => void;
  className?: string;
  styleOptions?: {
    default: string;
    active: string;
    inactive: string;
  };
  width?: 'small' | 'large' | 'full' | 'auto';
}

const ButtonComponent: React.FC<ButtonProps> = ({
  icon,
  text,
  onClick,
  className = '',
  styleOptions = {
    default: 'bg-blue-500 hover:bg-blue-700',
    active: 'bg-blue-700',
    inactive: 'bg-gray-400',
  },
  width = 'auto',
}) => {
  const widthClasses = {
    small: 'w-24',
    large: 'w-56',
    full: 'w-full',
    auto: 'w-auto',
  };

  const baseClasses = `rounded text-white flex flex-row items-center justify-center px-4 py-2 font-bold ${widthClasses[width]} ${styleOptions.default} ${className}`;

  return (
    <button className={baseClasses} onClick={onClick}>
      {icon && (
        <span className="flex items-center justify-center rounded-full">
          {icon}
        </span>
      )}
      {text && <span className={icon ? 'ml-2' : ''}>{text}</span>}
    </button>
  );
};

export default ButtonComponent;
