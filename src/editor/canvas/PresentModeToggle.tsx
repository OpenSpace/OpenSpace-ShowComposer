import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionIcon, Tooltip } from '@mantine/core';

import { EditIcon, PresentIcon } from '@/icons/icons';
import { useSettingsStore } from '@/store';
import { IconSize } from '@/types/enums';

function useQuery() {
  return new URLSearchParams(window.location.search);
}

export function PresentModeToggle() {
  const { t } = useTranslation('present-mode-toggle');
  const togglePresentMode = useSettingsStore((state) => state.togglePresentMode);
  const setPresentLocked = useSettingsStore((state) => state.setPresentLocked);
  const isPresentMode = useSettingsStore((state) => state.presentMode);
  const isPresentLocked = useSettingsStore((state) => state.presentLocked);
  const query = useQuery();

  useEffect(() => {
    if (query.has('show')) {
      setPresentLocked(true);
      if (!isPresentMode) {
        togglePresentMode();
      }
    }
  }, [query, isPresentMode, togglePresentMode, setPresentLocked]);

  if (isPresentLocked) return null;

  return (
    <Tooltip label={isPresentMode ? t('edit-show') : t('present-show')}>
      <ActionIcon
        onClick={togglePresentMode}
        size={'md'}
        opacity={isPresentMode ? 0.6 : 1}
        style={{ zIndex: 50 }}
      >
        {isPresentMode ? (
          <EditIcon strokeWidth={1.5} size={IconSize.md} />
        ) : (
          <PresentIcon strokeWidth={1.5} size={IconSize.md} />
        )}
      </ActionIcon>
    </Tooltip>
  );
}
