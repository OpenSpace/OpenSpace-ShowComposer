import { ReactNode, useState } from 'react';
import { ActionIcon, Popover } from '@mantine/core';

import { InfoIcon } from '@/icons/icons';

interface Props {
  content: ReactNode | string;
}

export function Information({ content }: Props) {
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
          <InfoIcon size={14} />
        </ActionIcon>
      </Popover.Target>

      <Popover.Dropdown maw={200}>{content}</Popover.Dropdown>
    </Popover>
  );
}
