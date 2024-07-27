import { useSettingsStore } from '@/store';
import { TvMinimalPlay } from 'lucide-react';
import { Button } from './ui/button';

const PresentModeToggle = () => {
  const togglePresentMode = useSettingsStore(
    (state) => state.togglePresentMode,
  );
  const isPresentMode = useSettingsStore((state) => state.presentMode); // Get the global state

  return (
    <Button
      size="icon"
      variant={'outline'}
      // pressed={isPresentMode}
      onClick={togglePresentMode}
      className={`z-50 p-1 transition-opacity duration-100 ${
        isPresentMode ? 'opacity-60' : 'opacity-100'
      }`}
    >
      <TvMinimalPlay
        strokeWidth="1.5"
        size="32"
        // className={isPresentMode ? 'stroke-zinc-700/100' : 'stroke-zinc-700/70'}
      />
    </Button>
  );
};

export default PresentModeToggle;
