import React, { useRef } from 'react';
import { ActionIcon, ActionIconProps } from '@mantine/core';

interface HoldButtonProps extends ActionIconProps {
  onClick: () => void;
  children: React.ReactNode;
}

const HoldButton: React.FC<HoldButtonProps> = ({ onClick, children, ...props }) => {
  const clickInterval = useRef<NodeJS.Timeout | null>(null);
  const handleMouseDown = () => {
    onClick();
    clickInterval.current = setInterval(onClick, 50);
  };

  const handleMouseUp = () => {
    if (clickInterval.current) {
      clearInterval(clickInterval.current);
    }
  };

  return (
    <ActionIcon
      {...props}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={onClick}
    >
      {children}
    </ActionIcon>
  );
};

export default HoldButton;
