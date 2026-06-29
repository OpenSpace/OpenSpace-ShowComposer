import { ReactNode, useState } from 'react';
import { ActionIcon, Popover } from '@mantine/core';
import { Info } from 'lucide-react';

interface InformationProps {
  content: ReactNode | string;
}

export function Information({ content }: InformationProps) {
  const [opened, setOpened] = useState(false);

  if (!content) {
    return null;
  }

  return (
    <Popover
      opened={opened}
      onDismiss={() => setOpened(false)}
      position={'top'}
      trapFocus
      withArrow
    >
      <Popover.Target>
        <ActionIcon
          radius={'xl'}
          size={'xs'}
          aria-label={'More information'}
          onClick={() => setOpened((o) => !o)}
        >
          <Info size={14} />
        </ActionIcon>
      </Popover.Target>

      <Popover.Dropdown maw={200}>{content}</Popover.Dropdown>
    </Popover>
  );
}
