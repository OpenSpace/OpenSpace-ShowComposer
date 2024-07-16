import React, { PropsWithChildren, ButtonHTMLAttributes } from 'react';
import { IconContext } from 'react-icons';
import { IconType } from 'react-icons/lib';

// can we add generic button props
// can we add generic button props
// Define a type for the IconButton props
type IconButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement>
> & {
  icon: IconType; // Using IconType for the icon prop
  size?: '4' | '5' | '6' | '7' | '8'; // Restrict size to specific string literals
  onClick?: () => void; // Optional click handler
  classNames?: string; // Optional class names
};

// IconButton component

const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  size = '6',
  onClick,
  classNames,
  ...props
}) => {
  // Size mapping to Tailwind's width and height classes
  const sizeClass =
    {
      '4': 'w-4 h-4',
      '5': 'w-5 h-5',
      '6': 'w-6 h-6',
      '7': 'w-7 h-7',
      '8': 'w-8 h-8',
    }[size] || 'w-6 h-6';

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center rounded-full hover:bg-gray-100 ${sizeClass}  ${
        classNames || ''
      }`}
      {...props}
    >
      <IconContext.Provider value={{ className: `${sizeClass}` }}>
        <Icon />
      </IconContext.Provider>
    </button>
  );
};

export default IconButton;
