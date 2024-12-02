import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, devtools } from 'zustand/middleware';

export interface Position {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  minimized: boolean;
  parentId?: string;
  selected?: boolean;
  isDragging?: boolean;
}

interface TempPositions {
  [key: string]: { x: number; y: number };
}

export interface PositionState {
  positions: Record<string, Position>;
  addPosition: (id: string, position: Partial<Position>) => void;
  updatePosition: (id: string, position: Partial<Position>) => void;
  deletePosition: (id: string) => void;
  deleteAllPosition: () => void;
  tempPositions: TempPositions;
  setTempPositions: (newPositions: TempPositions) => void;
  setTempPosition: (id: string, x: number, y: number) => void;
  selectComponent: (id: string) => void;
  deselectComponent: (id: string) => void;
  clearSelection: () => void;
  selectedComponents: string[];
  adjustPositionForParent: (
    id: string,
    x: number,
    y: number,
  ) => { x: number; y: number };
  adjustPositionForLayout: (
    // componentId: string,
    layoutId: string,
    x: number,
    y: number,
  ) => { x: number; y: number };
  isOverLayout: (x: number, y: number, layoutId: string) => boolean;
  //   checkComponentOverLayout: (componentId: string, layoutId: string) => boolean;
}

export const usePositionStore = create<PositionState>()(
  devtools(
    persist(
      immer((set, get) => ({
        positions: {},
        addPosition: (id, position) => {
          console.log('ID', id, 'POSITION: ', position);

          set((state) => ({
            positions: {
              ...state.positions,
              [id]: { ...position, id },
            },
          }));
        },
        updatePosition: (id, position) => {
          //   console.log('UPDATING POSITION: ', id, position),
          set((state) => {
            state.positions[id] = { ...state.positions[id], ...position };
          });
        },
        deletePosition: (id) =>
          set((state) => {
            delete state.positions[id];
          }),
        deleteAllPosition: () =>
          set((state) => {
            state.positions = {};
          }),
        tempPositions: {},
        setTempPositions: (newPositions: TempPositions) =>
          set({ tempPositions: newPositions }),
        setTempPosition: (id, x, y) =>
          set((state) => {
            state.tempPositions[id] = { x, y };
          }),

        selectedComponents: [],

        selectComponent: (id) =>
          set((state) => {
            console.log('SELECTING: ', id);
            state.selectedComponents.push(id);
            state.positions[id].selected = true;
          }),
        deselectComponent: (id) =>
          set((state) => {
            state.selectedComponents = state.selectedComponents.filter(
              (compId) => compId !== id,
            );
            state.positions[id].selected = false;
          }),
        clearSelection: () =>
          set((state) => {
            console.log('CLEARING ALL');
            state.selectedComponents = [];
            Object.keys(state.positions).forEach((id) => {
              state.positions[id].selected = false;
            });
          }),
        adjustPositionForLayout: (
          //   componentId: string,
          layoutId: string,
          x: number,
          y: number,
        ) => {
          const layoutPosition = get().positions[layoutId];
          if (layoutPosition) {
            return {
              x: x - layoutPosition.x,
              y: y - layoutPosition.y,
            };
          }
          return { x, y };
        },
        adjustPositionForParent: (id: string, x: number, y: number) => {
          const parentPosition = get().positions[id];
          if (parentPosition) {
            return { x: x + parentPosition.x, y: y + parentPosition.y };
          }
          return { x, y };
        },

        isOverLayout: (x: number, y: number, layoutId: string) => {
          const layoutPosition = get().positions[layoutId];
          if (!layoutPosition) {
            return false;
          }
          return (
            x >= layoutPosition.x &&
            x <= layoutPosition.x + layoutPosition.width &&
            y >= layoutPosition.y &&
            y <= layoutPosition.y + layoutPosition.height
          );
        },
      })),
      {
        name: 'position-store',
      },
    ),
    { name: 'position-store' },
  ),
);
