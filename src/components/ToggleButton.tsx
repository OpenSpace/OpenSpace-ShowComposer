import React from 'react';
import { ActionIcon, Tooltip } from '@mantine/core';

type ToggleButtonProps = {
  tooltipText: string;
  icon: JSX.Element;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
};

const ToggleButton: React.FC<ToggleButtonProps> = ({
  tooltipText,
  icon,
  selected,
  disabled,
  onClick
}) => {
  return (
    <Tooltip label={tooltipText}>
      <ActionIcon
        disabled={disabled}
        onClick={onClick}
        className={`z-40 ${!selected ? 'opacity-60' : 'opacity-100'}`}
      >
        {icon}
      </ActionIcon>
    </Tooltip>
  );
};

export default ToggleButton;
