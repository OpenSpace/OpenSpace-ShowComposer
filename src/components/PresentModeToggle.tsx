import { useSettingsStore } from '@/store';
import { TvMinimalPlay } from 'lucide-react';
import { Toggle } from './ui/toggle';
import { useEffect } from 'react';

const PresentModeToggle = () => {
  const togglePresentMode = useSettingsStore(
    (state) => state.togglePresentMode,
  );
  const isPresentMode = useSettingsStore((state) => state.presentMode); // Get the global state
  useEffect(() => {
    console.log('Present mode is', isPresentMode);
  }, [isPresentMode]);
  return (
    <Toggle
      variant={'outline'}
      pressed={isPresentMode}
      onPressedChange={(_pressed: boolean) => {
        togglePresentMode();
      }}
      className="z-50 p-1 transition-opacity"
    >
      <TvMinimalPlay
        strokeWidth="1.5"
        size="32"
        className={isPresentMode ? 'stroke-zinc-700/100' : 'stroke-zinc-700/70'}
      />
    </Toggle>

    // <div className="

    // <label className="absolute right-4 top-4 z-50 inline-flex cursor-pointer items-center">
    //   <span className="mx-3 text-sm font-medium text-black">Present Mode</span>
    //   <input
    //     type="checkbox"
    //     // value={sPresentMode}
    //     className="peer sr-only"
    //     onChange={togglePresentMode}
    //     checked={isPresentMode}
    //   />
    //   <div className="peer relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
    //   <span className="mx-3 text-sm font-medium text-black">
    //     {isPresentMode ? 'on' : 'off'}
    //   </span>
    // </label>
  );
};

export default PresentModeToggle;
