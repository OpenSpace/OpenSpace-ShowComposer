import { ActionIcon, Tooltip } from '@mantine/core';

type Props = {
  tooltipText: string;
  icon: JSX.Element;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
};

function ToggleButton({ tooltipText, icon, selected, disabled, onClick }: Props) {
  return (
    <Tooltip label={tooltipText}>
      <ActionIcon
        disabled={disabled}
        onClick={onClick}
        style={{ zIndex: 40, opacity: selected ? 1 : 0.6 }}
      >
        {icon}
      </ActionIcon>
    </Tooltip>
  );
}

export { ToggleButton };
