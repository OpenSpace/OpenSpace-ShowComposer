// Assuming your store file is something like store.js or store.ts
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface State {
  presentMode: boolean;
  togglePresentMode: () => void;
  url: string; // New property for URL
  port: string; // New property for Port
  setConnectionSettings: (url: string, port: string) => void; // Action to update URL and Port
}

export const useSettingsStore = create<State>()(
  devtools(
    persist(
      immer((set) => ({
        // Existing store properties and actions
        presentMode: false, // New property to control drag and resize
        togglePresentMode: () =>
          set(
            (state) => ({ presentMode: !state.presentMode }),
            false,
            'settings/togglePresent',
          ),
        url: '', // Initial URL state
        port: '', // Initial Port state
        setConnectionSettings: (url: string, port: string) =>
          set(
            () => {
              //need to trigger openspace reconnect here
              return { url, port };
            },
            false,
            'settings/setConnectionSettings',
          ),
      })),
      { name: 'settings-storage' },
    ),
    { name: 'settings-storage' },
  ),
);

// export default useSettingsStore;
