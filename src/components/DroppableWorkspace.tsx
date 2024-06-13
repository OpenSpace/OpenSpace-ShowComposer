// DroppableWorkspace.tsx
import { useSettingsStore } from '@/store';
import React from 'react';
// import { useDrop } from 'react-dnd';
// import { useStore } from '../store/store';
// import useCombinedRefs from './useCombinedRefs';

const DroppableWorkspace: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const isPresentMode = useSettingsStore((state) => state.presentMode); // Get the global state

  return (
    <div
      className="relative h-full w-full"
      style={{
        overflow: 'hidden',
        backgroundPosition: '-12.5px -12.5px',
        backgroundSize: '25px 25px',
        backgroundImage: !isPresentMode
          ? 'radial-gradient(circle, #000000 1px, rgba(0, 0, 0, 0) 1px)'
          : 'none',
      }}
    >
      {children}
    </div>
  );
};

export default DroppableWorkspace;
