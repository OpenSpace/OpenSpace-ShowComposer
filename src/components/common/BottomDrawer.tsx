// BottomDrawer.tsx
import React from 'react';

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
      className={`fixed inset-x-0 bottom-0 z-40 transform transition-transform ${
        isOpen ? 'translate-y-0' : 'translate-y-full'
      } max-h-1/2 overflow-y-auto bg-white bg-opacity-85 shadow-lg`}
    >
      <button className="p-4" onClick={onClose}>
        Close
      </button>
      {children}
    </div>
  );
};

export default BottomDrawer;
