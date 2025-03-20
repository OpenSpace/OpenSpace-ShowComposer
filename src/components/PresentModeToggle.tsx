import { useSettingsStore } from '@/store';
import { Pencil, TvMinimalPlay } from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
const useQuery = () => {
  // return new URLSearchParams(useLocation().search);
  return new URLSearchParams(window.location.search);
};
const PresentModeToggle = () => {
  const togglePresentMode = useSettingsStore(
    (state) => state.togglePresentMode,
  );
  const setPresentLocked = useSettingsStore((state) => state.setPresentLocked);
  const isPresentMode = useSettingsStore((state) => state.presentMode); // Get the global state
  const isPresentLocked = useSettingsStore((state) => state.presentLocked);
  const query = useQuery();
  useEffect(() => {
    // console.log(query.get('show'));
    if (query.has('show')) {
      setPresentLocked(true);
      if (!isPresentMode) {
        togglePresentMode();
      }
    } else {
      // setPresentLocked(false);
    }
  }, [query, isPresentMode, togglePresentMode, setPresentLocked]);
  return isPresentLocked ? null : (
    <Tooltip>
      <TooltipContent>
        {isPresentMode ? 'Edit Show' : 'Present Show'}
      </TooltipContent>

      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant={'outline'}
          // pressed={isPresentMode}
          onClick={togglePresentMode}
          className={cn('z-50 p-1 transition-opacity duration-100', {
            'opacity-60': isPresentMode,
            'opacity-100': !isPresentMode,
          })}
        >
          {isPresentMode ? (
            <Pencil strokeWidth="1.5" size="32" />
          ) : (
            <TvMinimalPlay
              strokeWidth="1.5"
              size="32"
              // className={isPresentMode ? 'stroke-zinc-700/100' : 'stroke-zinc-700/70'}
            />
          )}
        </Button>
      </TooltipTrigger>
    </Tooltip>
  );
};
export default PresentModeToggle;
