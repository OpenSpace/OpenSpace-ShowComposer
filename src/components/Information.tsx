import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionIcon, Popover } from '@mantine/core';

import { InfoIcon } from '@/icons/icons';
import { IconSize } from '@/types/enums';

interface Props {
  content: ReactNode;
}

export function Information({ content }: Props) {
  const { t } = useTranslation('information');
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
          aria-label={t('more-information')}
          onClick={() => setOpened((open) => !open)}
        >
          <InfoIcon size={IconSize.xs} />
        </ActionIcon>
      </Popover.Target>

      <Popover.Dropdown maw={200}>{content}</Popover.Dropdown>
    </Popover>
  );
}
