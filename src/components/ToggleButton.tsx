import React from 'react';
import { ActionIcon } from '@mantine/core';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
    <Tooltip>
      <TooltipContent>{tooltipText}</TooltipContent>
      <TooltipTrigger asChild>
        <ActionIcon
          disabled={disabled}
          onClick={onClick}
          className={`z-40 ${!selected ? 'opacity-60' : 'opacity-100'}`}
        >
          {icon}
        </ActionIcon>
      </TooltipTrigger>
    </Tooltip>
  );
};

export default ToggleButton;
