import React, { useState } from 'react';

interface DropdownMenuItem {
  name: string;
  action: () => void;
}

interface DropdownMenuProps {
  className?: string;
  items: DropdownMenuItem[];
}

const DropdownMenuComponent: React.FC<DropdownMenuProps> = ({
  items,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`relative z-20 ${className}`}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        className="flex items-center justify-center rounded border-[1px] border-gray-500 bg-gray-100 bg-opacity-60 px-4 py-0 hover:bg-gray-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg
          className="h-4 w-4" // Adjust size as needed
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor" // Use current text color
          viewBox="0 0 24 24"
        >
          <circle cx="6" cy="12" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="18" cy="12" r="1.5" />
        </svg>
        <svg
          className="ml-1 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-0 w-full overflow-hidden rounded-md bg-white shadow-lg">
          {items.map((item, index) => (
            <button
              key={index}
              className="block  w-full  px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                item.action();
                setIsOpen(false);
              }}
            >
              {item.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownMenuComponent;
