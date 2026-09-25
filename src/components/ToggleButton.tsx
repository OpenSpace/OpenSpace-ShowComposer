import { ActionIcon, Tooltip } from '@mantine/core';

type Props = {
  tooltipText: string;
  icon: JSX.Element;
  selected: boolean;
  onClick: () => void;
};

function ToggleButton({ tooltipText, icon, selected, onClick }: Props) {
  return (
    <Tooltip label={tooltipText}>
      <ActionIcon onClick={onClick} style={{ zIndex: 40, opacity: selected ? 1 : 0.6 }}>
        {icon}
      </ActionIcon>
    </Tooltip>
  );
}

export { ToggleButton };
