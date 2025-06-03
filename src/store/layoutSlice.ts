import { v4 as uuidv4 } from 'uuid';

// import { PositionState, usePositionStore } from './positionStore';
import {
  calculateGridIndex,
  calculateTotalLayoutHeight,
  calculateTotalLayoutWidth
} from '@/utils/layoutCalculations';
import { roundToNearest } from '@/utils/math';

import { ImmerStateCreator, LayoutBase } from '../types/components';

import { ComponentSlice, isComponentOverlappingPage } from './componentSlice';
// import { StateCreator } from 'zustand';
import { PageSlice } from './pageSlice';
import { PositionSlice } from './positionSlice';
import { useSettingsStore } from './settingsStore';

export type LayoutType = 'row' | 'column' | 'grid';
interface Position {
  x: number;
  y: number;
}
export interface LayoutSlice {
  layouts: Record<string, LayoutBase>;
  addLayout: (config: {
    type: LayoutType;
    x: number;
    y: number;
    persistent: boolean;
    rows?: number;
    columns?: number;
    parentPage?: string;
  }) => string;
  addLayouts: (layouts: LayoutBase[]) => void;
  updateLayout: (id: string, updates: Partial<LayoutBase>) => void;
  deleteLayout: (layoutId: string) => void;
  copyLayout: (id: LayoutBase['id']) => LayoutBase['id'] | null;
  resizeComponentsInLayout: (layoutId: string) => void;
  handleLayoutDrop: (layoutId: string, x: number, y: number) => void;
  addComponentToLayout: (
    layoutId: string,
    componentId: string,
    x: number,
    y: number
  ) => void;
  getGridPosition: (layoutId: string, gridIndex: number) => Position;
  removeComponentFromLayout: (
    layoutId: string,
    componentId: string,
    x: number,
    y: number
  ) => void;
  reorderComponentInLayout: (
    layoutId: string,
    componentId: string,
    x: number,
    y: number
  ) => void;
}
export const createLayoutSlice: ImmerStateCreator<
  LayoutSlice & ComponentSlice & PageSlice & PositionSlice,
  LayoutSlice
> = (set, get) => ({
  layouts: {},
  addLayout: (config) => {
    const id = uuidv4();

    set((state) => {
      const rows = config.rows || 1;
      const columns = config.columns || 1;
      state.layouts[id] = {
        id,
        type: config.type,
        children: config.type === 'grid' ? new Array(rows * columns).fill(null) : [],
        rows,
        columns,
        padding: 25,
        childWidth: 200,
        childHeight: 200,
        persistent: config.persistent || false,
        parentPage: config.parentPage || undefined
      };
    });
    const layout = get().layouts[id];
    const width = (layout.childWidth + layout.padding) * layout.columns + layout.padding;
    const height = (layout.childHeight + layout.padding) * layout.rows + layout.padding;

    get().addPosition(id, {
      x: config.x,
      y: config.y,
      minWidth: 50,
      minHeight: 50,
      width,
      height
    });
    return id;
  },
  addLayouts: (layouts) => {
    set((state) => {
      layouts.forEach((layout) => {
        state.layouts[layout.id] = { ...layout };
      });
    });
  },
  updateLayout: (id, updates) => {
    set((state) => {
      const layout = state.layouts[id];
      if (layout.type === 'grid') {
        if (updates.rows || updates.columns) {
          const newRows = updates.rows || layout.rows;
          const newColumns = updates.columns || layout.columns;
          const newTotalCells = newRows * newColumns;
          const currentTotalCells = layout.rows * layout.columns;
          if (newTotalCells > currentTotalCells) {
            // Add new cells
            const newCells = new Array(newTotalCells - currentTotalCells).fill(null);
            layout.children = [...layout.children, ...newCells];
          } else if (newTotalCells < currentTotalCells) {
            // Remove cells
            layout.children = layout.children.slice(0, newTotalCells);
          }
          layout.rows = newRows;
          layout.columns = newColumns;

          const height = newRows * (layout.childHeight + layout.padding) + layout.padding;
          const width =
            newColumns * (layout.childWidth + layout.padding) + layout.padding;
          state.positions[id].height = height;
          state.positions[id].width = width;
        }
      }
      Object.assign(layout, updates);
    });
    get().resizeComponentsInLayout(id);
  },
  deleteLayout: (layoutId: string) =>
    set((state) => {
      const layout = state.layouts[layoutId];
      // Remove the layout ID from any pages that contain it
      state.pages.forEach((page) => {
        page.components = page.components.filter((id) => id !== layoutId);
      });
      // Offset Component positions from Layout position
      const layoutPosition = get().positions[layoutId];
      layout.children.forEach((componentId) => {
        if (componentId) {
          const position = get().positions[componentId];
          if (position && layoutPosition) {
            state.positions[componentId].x = position.x + layoutPosition.x;
            state.positions[componentId].y = position.y + layoutPosition.y;
            state.positions[componentId].parentId = undefined;

            const currentPage = get().getPageById(get().currentPage);
            if (currentPage) {
              if (
                isComponentOverlappingPage(
                  {
                    x: position.x + layoutPosition.x,
                    y: position.y + layoutPosition.y,
                    width: position.width,
                    height: position.height
                  },
                  currentPage,
                  useSettingsStore.getState().pageWidth,
                  useSettingsStore.getState().pageHeight
                )
              ) {
                get().addComponentToPageById(componentId, currentPage.id);
                if (state.components[componentId]) {
                  state.components[componentId].parentPage = currentPage.id;
                }
              } else {
                get().removeComponentToPageById(componentId, currentPage.id);
                state.components[componentId].parentPage = undefined;
              }
            }
          }
        }
      });
      // Delete Layout Position
      get().deletePosition(layoutId);
      // Remove the layout from the state
      delete state.layouts[layoutId];
    }),
  copyLayout: (id: LayoutBase['id']) => {
    const state = get();
    const layout = state.layouts[id];
    if (layout) {
      const newId = uuidv4();

      //   set((state) => {
      //     state.layouts[newId] = { ...layout, id: newId };
      //   });
      const { width, height, x, y } = get().positions[id];
      get().addPosition(newId, {
        x: x + 50,
        y: y + 50,
        minWidth: 50,
        minHeight: 50,
        width: width,
        height: height
      });
      const newChildren = layout.children.map((childId) => {
        if (childId) {
          return get().copyComponent(childId, false, {
            parentId: newId
          });
        }
        return null;
      });

      set((state) => {
        state.layouts[newId] = {
          ...layout,
          id: newId,
          children: newChildren
        };
      });
      return newId;
    }
    return null;
  },
  handleLayoutDrop: (layoutId: string, x: number, y: number) => {
    get().updatePosition(layoutId, {
      x: roundToNearest(x, 25),
      y: roundToNearest(y, 25)
    });
    const currentPage = get().getPageById(get().currentPage);
    if (currentPage) {
      const { width, height } = get().positions[layoutId];
      if (
        isComponentOverlappingPage(
          { x, y, width, height },
          currentPage,
          useSettingsStore.getState().pageWidth,
          useSettingsStore.getState().pageHeight
        )
      ) {
        get().addComponentToPageById(layoutId, currentPage.id);
        set((state) => {
          state.layouts[layoutId].parentPage = currentPage.id;
        });
      } else {
        get().removeComponentToPageById(layoutId, currentPage.id);
        set((state) => {
          state.layouts[layoutId].parentPage = undefined;
        });
      }
    }
  },
  resizeComponentsInLayout: (layoutId: string) => {
    const layout = get().layouts[layoutId];
    if (!layout) {
      console.error(`Layout with ID ${layoutId} not found.`);
      return;
    }
    set((state) => {
      const layout = state.layouts[layoutId];
      if (!layout) {
        console.error(`Layout with ID ${layoutId} not found.`);
        return;
      }
      console.log('RESIZING COMPONENTS IN LAYOUT');
      if (layout.type === 'row') {
        const totalLayoutWidth = calculateTotalLayoutWidth(
          layout,
          layout.children.length
        );
        state.positions[layoutId].width = totalLayoutWidth;
      } else if (layout.type === 'column') {
        const totalLayoutHeight = calculateTotalLayoutHeight(
          layout,
          layout.children.length
        );
        state.positions[layoutId].height = totalLayoutHeight;
      }
    });
    layout.children.forEach((childId, index) => {
      if (layout.type === 'row') {
        const child = get().positions[childId as string];
        if (child) {
          get().updatePosition(childId as string, {
            x: index * (layout.childWidth + layout.padding) + layout.padding,
            y: layout.padding,
            width: layout.childWidth,
            height: layout.childHeight
          });
        }
      } else if (layout.type === 'column') {
        const child = get().positions[childId as string];
        if (child) {
          get().updatePosition(child.id, {
            x: layout.padding,
            y: index * (layout.childHeight + layout.padding) + layout.padding,
            width: layout.childWidth,
            height: layout.childHeight
          });
        }
      } else {
        const position = get().getGridPosition(layoutId, index);
        get().updatePosition(childId as string, {
          x: position.x,
          y: position.y,
          width: layout.childWidth,
          height: layout.childHeight
        });
      }
    });
    // });
  },
  addComponentToLayout: (layoutId: string, componentId: string, x: number, y: number) => {
    set((state) => {
      const layout = state.layouts[layoutId];
      if (layout) {
        const adjustedPosition = get().adjustPositionForLayout(layoutId, x, y);
        if (layout.type === 'grid') {
          const { gridIndex, gridPosition } = calculateGridIndex(
            adjustedPosition.x,
            adjustedPosition.y,
            layout
          );
          if (layout.children[gridIndex] === null) {
            state.positions[componentId].parentId = layoutId;
            state.positions[componentId].x = gridPosition.x;
            state.positions[componentId].y = gridPosition.y;
            state.positions[componentId].width = layout.childWidth;
            state.positions[componentId].height = layout.childHeight;
            layout.children[gridIndex] = componentId;
          }
        } else {
          state.positions[componentId].parentId = layoutId;
          state.positions[componentId].x = adjustedPosition.x;
          state.positions[componentId].y = adjustedPosition.y;
          state.positions[componentId].width = layout.childWidth;
          state.positions[componentId].height = layout.childHeight;
          layout.children.push(componentId);
        }
      }
    });
  },
  getGridPosition: (layoutId: string, gridIndex: number) => {
    const layout = get().layouts[layoutId];
    const { columns, childWidth, childHeight, padding } = layout;
    return {
      x: padding + (gridIndex % columns) * (childWidth + padding),
      y: padding + Math.floor(gridIndex / columns) * (childHeight + padding)
    };
  },
  removeComponentFromLayout: (
    layoutId: string,
    componentId: string,
    x: number,
    y: number
  ) => {
    set((state) => {
      const layout = state.layouts[layoutId];
      if (layout) {
        if (layout.type === 'grid') {
          const gridIndex = layout.children.findIndex((id) => id === componentId);
          if (gridIndex !== -1) {
            layout.children[gridIndex] = null;
          }
        } else {
          layout.children = layout.children.filter((id) => id !== componentId);
        }
        //
        const position = get().positions[componentId];
        if (position) {
          state.positions[componentId].x = x;
          state.positions[componentId].y = y;
          state.positions[componentId].parentId = undefined;
        }
      }
    });
  },
  reorderComponentInLayout(layoutId: string, componentId: string, x: number, y: number) {
    const layout = get().layouts[layoutId];
    if (!layout) {
      console.error(`Layout with ID ${layoutId} not found.`);
      return;
    }
    const components = layout.children
      .filter((id) => id !== null)
      .map((id) => {
        return get().positions[id as string];
      });

    let newIndex: number | null = null;
    const currentIndex = layout.children.indexOf(componentId);

    const adjustedPosition = get().adjustPositionForLayout(layoutId, x, y);
    if (layout.type === 'row') {
      components.forEach((component, index) => {
        if (componentId !== layout.children[index]) {
          if (
            adjustedPosition.x + layout.childWidth / 2.0 > component.x &&
            adjustedPosition.x + layout.childWidth / 2.0 < component.x + component.width
          ) {
            newIndex = index;
          }
        }
      });

      if (newIndex !== null && newIndex !== currentIndex) {
        set((state) => {
          state.layouts[layoutId].children = state.layouts[layoutId].children.filter(
            (id) => id !== componentId
          );
          state.layouts[layoutId].children.splice(newIndex as number, 0, componentId);
        });
      }
    } else if (layout.type === 'column') {
      components.forEach((component, index) => {
        if (componentId !== layout.children[index]) {
          if (
            adjustedPosition.y + layout.childHeight / 2.0 > component.y &&
            adjustedPosition.y + layout.childHeight / 2.0 < component.y + component.height
          ) {
            newIndex = index;
          }
        }
      });

      if (newIndex !== null && newIndex !== currentIndex) {
        set((state) => {
          state.layouts[layoutId].children = state.layouts[layoutId].children.filter(
            (id) => id !== componentId
          );
          state.layouts[layoutId].children.splice(newIndex as number, 0, componentId);
        });
      }
    } else if (layout.type === 'grid') {
      const { gridIndex, gridPosition } = calculateGridIndex(
        adjustedPosition.x,
        adjustedPosition.y,
        layout
      );
      if (layout.children[gridIndex] === null) {
        get().updatePosition(componentId, {
          x: gridPosition.x,
          y: gridPosition.y,
          width: layout.childWidth,
          height: layout.childHeight,
          parentId: layoutId
        });

        set((state) => {
          state.layouts[layoutId].children[currentIndex] = null;
          state.layouts[layoutId].children[gridIndex] = componentId;
        });
      }
    }
  }
});
