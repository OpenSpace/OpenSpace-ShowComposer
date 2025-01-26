import { StateCreator } from 'zustand';
import { PageSlice } from './pageSlice';
import { ComponentSlice } from './componentSlice';
import { LayoutSlice } from './layoutSlice';
import { ImmerStateCreator } from './ComponentTypes';
import { debounce } from 'lodash';

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

export interface PositionSlice {
  positions: Record<string, Position>;
  startSaveCount: number;
  endSaveCount: number;
  startBatch: () => void;
  endBatch: () => void;
  debouncePositions: Record<string, Position>;
  debouncedUpdate: (id: string, position: Partial<Position>) => void;
  addPosition: (id: string, position: Partial<Position>) => void;
  addPositions: (positions: Position[]) => void;
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
    layoutId: string,
    x: number,
    y: number,
  ) => { x: number; y: number };
  isOverLayout: (x: number, y: number, layoutId: string) => boolean;
}

export const createPositionSlice: ImmerStateCreator<
  ComponentSlice & PositionSlice & LayoutSlice & PageSlice,
  PositionSlice
> = (set, get) => {
  const debouncedUpdate = debounce(
    (id: string, position: Partial<Position>) => {
      set((state) => ({
        debouncePositions: {
          ...state.debouncePositions,
          [id]: position,
        },
      }));
    },
    500,
  );
  return {
    positions: {},
    debouncePositions: {},
    debouncedUpdate: debouncedUpdate,
    startSaveCount: 0,
    endSaveCount: 0,
    startBatch: () => {
      set((state) => ({
        startSaveCount: state.startSaveCount + 1,
      }));
    },
    endBatch: () => {
      set((state) => ({
        endSaveCount: state.endSaveCount + 1,
      }));
    },
    addPosition: (id, position) => {
      set((state) => ({
        positions: {
          ...state.positions,
          [id]: { ...position, id },
        },
      }));
      debouncedUpdate(id, { ...get().positions[id] });
    },
    addPositions: (positions) => {
      set((state) => {
        positions.forEach((position) => {
          state.positions[position.id] = { ...position };
        });
      });
    },
    updatePosition: (id, position) => {
      set((state) => {
        state.positions[id] = { ...state.positions[id], ...position };
      });

      debouncedUpdate(id, { ...get().positions[id], ...position });
    },
    deletePosition: (id) =>
      set((state) => {
        delete state.positions[id];
        delete state.debouncePositions[id];
      }),
    deleteAllPosition: () =>
      set((state) => {
        state.positions = {};
        state.debouncePositions = {};
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
        //   console.log('CLEARING ALL');
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
  };
};
