import { useEffect } from 'react';
import { ActionIcon, Tooltip } from '@mantine/core';

import { EditIcon, PresentIcon } from '@/icons/icons';
import { useSettingsStore } from '@/store';

const useQuery = () => {
  return new URLSearchParams(window.location.search);
};

export function PresentModeToggle() {
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
  return isPresentLocked ? null : (
    <Tooltip label={isPresentMode ? 'Edit Show' : 'Present Show'}>
      <ActionIcon
        onClick={togglePresentMode}
        size={28}
        style={{
          zIndex: 50,
          transition: 'opacity 100ms',
          opacity: isPresentMode ? 0.6 : 1
        }}
      >
        {isPresentMode ? (
          <EditIcon strokeWidth={1.5} size={18} />
        ) : (
          <PresentIcon strokeWidth={1.5} size={18} />
        )}
      </ActionIcon>
    </Tooltip>
  );
}
