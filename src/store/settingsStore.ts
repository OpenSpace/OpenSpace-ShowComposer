// Assuming your store file is something like store.js or store.ts
import { throttle } from 'lodash';
import { create } from 'zustand';
import { devtools,persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface ProjectSettings {
  projectName: string;
  projectDescription: string;
  ip: string;
  port: string;
  pageWidth: number;
  pageHeight: number;
  showPagination: boolean;
}

interface State {
  presentMode: boolean;
  togglePresentMode: () => void;
  ip: string; // New property for URL
  port: string; // New property for Port
  pageWidth: number;
  pageHeight: number;
  pageScale: number;
  pageScaleThrottled: number;
  presentLocked: boolean;
  gridSize: { rows: number; columns: number };
  projectName: string;
  projectDescription: string;
  showPagination: boolean;
  setShowPagination: (show: boolean) => void;
  setGridSize: (size: { rows: number; columns: number }) => void;
  setPresentLocked: (locked: boolean) => void;
  setScale: (scaleFunc: (prevScale: any) => number) => void;
  updatePageSize(width: number, height: number): void;
  setConnectionSettings: (url: string, port: string) => void; // Action to update URL and Port
  setProjectSettings: (settings: Partial<ProjectSettings>) => void;
}

export const useSettingsStore = create<State>()(
  devtools(
    persist(
      immer((set) => {
        // Throttled function to update pageScaleThrottled
        const throttledSetScale = throttle((newScale) => {
          set(
            (_state) => {
              return {
                pageScaleThrottled: newScale
              };
            },
            false,
            'settings/setScaleThrottled'
          );
        }, 1000); // Adjust the throttle delay as needed

        return {
          // Existing store properties and actions
          presentMode: false, // New property to control drag and resize
          presentLocked: false,
          projectName: '',
          projectDescription: '',
          showPagination: true,
          setShowPagination: (show: boolean) =>
            set(
              (_state) => ({ showPagination: show }),
              false,
              'settings/setShowPagination'
            ),
          setPresentLocked: (locked: boolean) =>
            set(
              (_state) => ({ presentLocked: locked }),
              false,
              'settings/setPresentLocked'
            ),
          togglePresentMode: () =>
            set(
              (state) => ({ presentMode: !state.presentMode }),
              false,
              'settings/togglePresent'
            ),
          pageWidth: 1000,
          pageHeight: 500,
          pageScale: 1,
          pageScaleThrottled: 1,
          setScale: (scaleFunc) => {
            set(
              (state) => {
                const newScale = scaleFunc(state.pageScale);
                throttledSetScale(newScale);
                return { pageScale: newScale };
              },
              false,
              'settings/setScale'
            );
          },
          ip: '', // Initial URL state
          port: '', // Initial Port state
          updatePageSize: (width: number, height: number) =>
            set(
              () => {
                return { pageWidth: width, pageHeight: height };
              },
              false,
              'settings/updatePageSize'
            ),
          setConnectionSettings: (ip: string, port: string) =>
            set(
              () => {
                return { ip, port };
              },
              false,
              'settings/setConnectionSettings'
            ),
          gridSize: { rows: 3, columns: 3 },
          setGridSize: (size: { rows: number; columns: number }) =>
            set(() => ({ gridSize: size }), false, 'settings/setGridSize'),
          setProjectSettings: (settings: Partial<ProjectSettings>) =>
            set(
              () => ({
                ...settings
              }),
              false,
              'settings/setProjectSettings'
            )
        };
      }),
      {
        name: 'settings-storage' // name of the storage
      }
    )
  )
);
