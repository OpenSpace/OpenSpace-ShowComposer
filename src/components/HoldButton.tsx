import { ReactNode, useRef } from 'react';
import { ActionIcon, ActionIconProps } from '@mantine/core';

interface Props extends ActionIconProps {
  onClick: () => void;
  children: ReactNode;
}

function HoldButton({ onClick, children, ...props }: Props) {
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
}

export default HoldButton;
