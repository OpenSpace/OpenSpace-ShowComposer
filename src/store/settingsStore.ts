// Assuming your store file is something like store.js or store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface State {
  presentMode: boolean;
  togglePresentMode: () => void;
}

export const useSettingsStore = create<State>()(
  devtools(
    immer((set) => ({
      // Existing store properties and actions
      presentMode: true, // New property to control drag and resize
      togglePresentMode: () =>
        set(
          (state) => ({ presentMode: !state.presentMode }),
          false,
          'settings/togglePresent',
        ),
    })),
    { name: 'settings-storage' },
  ),
);

export default useSettingsStore;
