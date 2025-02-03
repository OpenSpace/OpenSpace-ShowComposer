import { v4 as uuidv4 } from 'uuid';
import { Component, LayoutBase, Page } from './ComponentTypes';
import { PageSlice } from './pageSlice';
import { LayoutSlice } from './layoutSlice';
import { Position, PositionSlice } from './positionSlice';
import { useSettingsStore } from './settingsStore';
import { roundToNearest } from '@/utils/math';

import {
  TimeComponent,
  NavComponent,
  StatusComponent,
  RecordComponent,
  MultiComponent,
  MultiState,
  ImmerStateCreator,
} from './ComponentTypes';

export interface ComponentSlice {
  components: Record<string, Component>;
  timepanel: TimeComponent | null;
  navpanel: NavComponent | null;
  statuspanel: StatusComponent | null;
  recordpanel: RecordComponent | null;
  addComponent: (component: Component) => void;
  addComponents: (components: Component[]) => void;
  getComponentById: (id: Component['id']) => Component;
  addComponentToPageById: (
    componentId: Component['id'],
    pageId: Page['id'],
  ) => void;
  handleComponentDrop: (
    componentId: string,
    x: number,
    y: number,
    fromHistory?: boolean,
  ) => void;
  removeComponentToPageById: (
    componentId: Component['id'],
    pageId: Page['id'],
  ) => void;
  updateComponent: (id: Component['id'], updates: Partial<Component>) => void;
  removeComponent: (id: Component['id']) => void;
  copyComponent: (
    id: Component['id'],
    offset?: boolean,
    newData?: Partial<Position>,
  ) => string | null;
  //   //   copyLayout: (id: LayoutBase['id']) => void;
  removeAllComponents: () => void;
  asyncPreSubmitOperation: (() => any) | null;
  resetAsyncPreSubmitOperation: () => void;
  setAsyncPreSubmitOperation: (operation: (() => any) | null) => void;
  executeAndResetAsyncPreSubmitOperation: () => void;
  createPanels: () => void;
  updatePanel: (
    updates: Partial<
      TimeComponent | NavComponent | StatusComponent | RecordComponent
    >,
  ) => void;
  // Other component-related methods...
}

export const createComponentSlice: ImmerStateCreator<
  ComponentSlice & PageSlice & PositionSlice & LayoutSlice,
  ComponentSlice
> = (set, get) => ({
  components: {},
  navpanel: null,
  timepanel: null,
  statuspanel: null,
  recordpanel: null,
  addComponent: (component) => {
    // console.log('component in addComponent', component);

    set((state) => {
      // console.log('component in addComponent', component);
      state.components[component.id] = { ...component };

      if (state.pages.length === 0) {
        // get().addPage();
      } else {
        const currentPage = get().getPageById(state.currentPage);
        if (
          isComponentOverlappingPage(
            { x: 0, y: 0, width: 300, height: 175 },
            currentPage,
            useSettingsStore.getState().pageWidth,
            useSettingsStore.getState().pageHeight,
          )
        ) {
          get().addComponentToPageById(component.id, currentPage.id);
          get().updateComponent(component.id, {
            parentPage: currentPage.id,
          });
        }
      }

      // console.log('positions', get().positions);
    });
    get().addPosition(component.id, {
      x: 0,
      y: 0,
      minWidth: 50,
      minHeight: 50,
      width: 300,
      height: 175,
    });
  },
  addComponents: (components: Component[]) => {
    set((state) => {
      components.forEach((component) => {
        state.components[component.id] = { ...component };
      });
    });
  },
  getComponentById: (id: Component['id']) => {
    const state = get();
    return state.components[id];
  },
  addComponentToPageById: (componentId, pageId) =>
    set((state) => {
      //push to pages if componentID is not already in
      if (!state.getPageById(pageId)?.components.includes(componentId)) {
        state.pages
          .find((page: Page) => page.id === pageId)
          ?.components.push(componentId);
      }
    }),
  handleComponentDrop: (componentId: string, x: number, y: number) => {
    get().startBatch();
    const componentUpdates: Partial<Component> = {};
    const currentPageId = get().currentPage;
    const currentPage = get().getPageById(currentPageId);
    const layouts = get().layouts;
    const filteredLayouts = Object.values(layouts).filter((v) => {
      return !v.parentPage || (v.parentPage && v.parentPage == currentPageId);
    });

    let targetLayout: LayoutBase | null = null;
    const currentLayoutId = get().positions[componentId].parentId;
    const { width, height } = get().positions[componentId];
    const adjustedPosition = { x, y };

    if (currentPage) {
      const { width, height } = get().positions[componentId];
      if (
        isComponentOverlappingPage(
          { x: adjustedPosition.x, y: adjustedPosition.y, width, height },
          currentPage,
          useSettingsStore.getState().pageWidth,
          useSettingsStore.getState().pageHeight,
        )
      ) {
        get().addComponentToPageById(componentId, currentPage.id);
        componentUpdates.parentPage = currentPage.id;
      } else {
        get().removeComponentToPageById(componentId, currentPage.id);
        componentUpdates.parentPage = undefined;
      }
    }

    // Find the layout the component is over
    filteredLayouts.forEach((layout) => {
      if (
        get().isOverLayout(
          adjustedPosition.x + width / 2.0,
          adjustedPosition.y + height / 2.0,
          layout.id,
        )
      ) {
        targetLayout = layout;
      }
    });

    if (currentLayoutId) {
      // Component belongs to a layout
      if (targetLayout) {
        if ((targetLayout as LayoutBase).id === currentLayoutId) {
          // Over the same layout, reorder if needed
          get().reorderComponentInLayout(currentLayoutId, componentId, x, y);
          get().resizeComponentsInLayout(currentLayoutId);
        } else {
          // Over a different layout, move to new layout
          get().removeComponentFromLayout(currentLayoutId, componentId, x, y);
          get().addComponentToLayout(
            (targetLayout as LayoutBase).id,
            componentId,
            adjustedPosition.x,
            adjustedPosition.y,
          );
          get().resizeComponentsInLayout((targetLayout as LayoutBase).id);
          get().resizeComponentsInLayout(currentLayoutId);
        }
      } else {
        // Not over any layout, remove from current layout
        get().removeComponentFromLayout(currentLayoutId, componentId, x, y);
        get().resizeComponentsInLayout(currentLayoutId);
      }
    } else {
      // Component does not belong to a layout
      if (targetLayout) {
        // Add to new layout
        get().addComponentToLayout(
          (targetLayout as LayoutBase).id,
          componentId,
          x,
          y,
        );
        // get().reorderComponentInLayout(
        //   (targetLayout as LayoutBase).id,
        //   componentId,
        //   x,
        //   y,
        // );
        get().resizeComponentsInLayout((targetLayout as LayoutBase).id);
      } else {
        // Update position normally
        get().updatePosition(componentId, {
          isDragging: false,
          x: roundToNearest(x, 25),
          y: roundToNearest(y, 25),
          parentId: undefined,
        });
      }
    }

    // Apply accumulated updates
    get().updateComponent(componentId, componentUpdates);
    get().endBatch();
  },
  removeComponentToPageById: (componentId, pageId) =>
    set((state) => {
      const page = state.pages.find((page: Page) => page.id === pageId);
      if (page) {
        page.components = page.components.filter(
          (id: string) => id !== componentId,
        );
      }
    }),
  updateComponent: (id: Component['id'], updates: Partial<Component>) =>
    set((state) => {
      state.components[id] = { ...state.components[id], ...updates };
    }),
  removeComponent: (id: Component['id']) => {
    set((state) => {
      delete state.components[id];
      get().deletePosition(id);
      const component = state.getComponentById(id);
      if (component?.type == 'multi') {
        (component as MultiComponent).components.forEach((c) => {
          if (state.components[c.component].isMulti == 'true') {
            state.updateComponent(c.component, { isMulti: 'false' });
          }
        });
      }
      state.pages = state.pages.map((page: Page) => ({
        ...page,
        components: page.components.filter((compId: string) => compId !== id),
      }));
    });
  },
  copyComponent: (
    id: Component['id'],
    offset: boolean = true,
    newData: Partial<Position> = {},
  ) => {
    const state = get();
    const component = state.components[id];
    if (component) {
      const newId = uuidv4();

      set((state) => {
        state.components[newId] = {
          ...component,
          parentPage: undefined,
          parentLayout: undefined,
          id: newId,
          //   ...newData,
        };
      });
      const { width, height, x, y } = get().positions[id];
      get().addPosition(newId, {
        x: offset ? x + 50 : x,
        y: offset ? y + 50 : y,
        minWidth: 50,
        minHeight: 50,
        width: width,
        height: height,
        parentId: undefined,
        ...newData,
      });
      return newId;
    }
    return null;
  },
  removeAllComponents: () => {
    set((state) => {
      //   state.deleteAllPosition();
      state.components = {};
      state.layouts = {};
      // state.overlappedComponents = {};
      state.selectedComponents = [];
      state.pages = [];
      //   state.addPage();
    });
    get().addPage();
    get().deleteAllPosition();
    get().createPanels();
  },
  asyncPreSubmitOperation: null, // Async operation placeholder, this is mainly used for saving photos to disk on component save
  resetAsyncPreSubmitOperation: () => set({ asyncPreSubmitOperation: null }),
  setAsyncPreSubmitOperation: (operation: (() => any) | null) =>
    set({
      asyncPreSubmitOperation: operation,
    }),
  executeAndResetAsyncPreSubmitOperation: async () => {
    const state = get(); // Get the current state
    if (state.asyncPreSubmitOperation) {
      await state.asyncPreSubmitOperation();
      set({ asyncPreSubmitOperation: null }); // Reset to null after execution
    }
  },
  createPanels: () => {
    const { timepanelId, navpanelId, statuspanelId, recordpanelId } = {
      timepanelId: uuidv4(),
      navpanelId: uuidv4(),
      statuspanelId: uuidv4(),
      recordpanelId: uuidv4(),
    };

    set((state) => {
      state.timepanel = {
        id: timepanelId,
        type: 'timepanel',
        isMulti: 'false' as MultiState,
        gui_name: 'Time Panel',
        gui_description: '',
        isDisabled: false,
      };

      state.navpanel = {
        id: navpanelId,
        type: 'navpanel',
        isMulti: 'false' as MultiState,
        gui_name: 'Nav Panel',
        gui_description: '',
        isDisabled: false,
      };
      state.statuspanel = {
        id: statuspanelId,
        type: 'statuspanel',
        isMulti: 'false' as MultiState,
        gui_name: 'Status Panel',
        gui_description: '',
        isDisabled: false,
      };
      state.recordpanel = {
        id: recordpanelId,
        type: 'recordpanel',
        isMulti: 'false' as MultiState,
        gui_name: 'Record Panel',
        gui_description: '',
        isDisabled: false,
      };
    });
    get().addPosition(navpanelId, {
      x: 0,
      y: 600,
      minWidth: 225,
      minHeight: 325,
      width: 225,
      height: 325,
      minimized: true,
    });

    get().addPosition(statuspanelId, {
      x: 600,
      y: 675,
      minWidth: 275,
      minHeight: 250,
      width: 275,
      height: 250,
      minimized: true,
    });

    get().addPosition(recordpanelId, {
      x: 895,
      y: 575,
      minWidth: 275,
      minHeight: 400,
      width: 275,
      height: 400,
      minimized: true,
    });
    // });
    get().addPosition(timepanelId, {
      x: 250,
      y: 500,
      minWidth: 325,
      minHeight: 425,
      width: 325,
      height: 425,
      minimized: true,
    });
  },
  updatePanel: (
    updates: Partial<
      TimeComponent | NavComponent | StatusComponent | RecordComponent
    >,
  ) => {
    set((state) => {
      switch (updates.type) {
        case 'timepanel': {
          const timeComponent = state.timepanel;
          if (timeComponent) {
            Object.assign(timeComponent, updates);
          }
          break;
        }
        case 'navpanel': {
          const navComponent = state.navpanel;
          if (navComponent) {
            Object.assign(navComponent, updates);
          }
          break;
        }
        case 'statuspanel': {
          const statusComponent = state.statuspanel;
          if (statusComponent) {
            Object.assign(statusComponent, updates);
          }
          break;
        }
        case 'recordpanel': {
          const recordComponent = state.recordpanel;
          if (recordComponent) {
            Object.assign(recordComponent, updates);
          }
          break;
        }
        default:
          break;
      }
    });
  },

  // Other component-related methods...
});

export function isComponentOverlappingPage(
  componentPosition: { x: number; y: number; width: number; height: number },
  page: Page,
  pageWidth: number,
  pageHeight: number,
): boolean {
  if (!componentPosition || !page) {
    return false;
  }
  //   const { pageWidth, pageHeight } = useSettingsStore.getState();

  const componentRight = componentPosition.x + componentPosition.width;
  const componentBottom = componentPosition.y + componentPosition.height;

  const pageRight = page.x + pageWidth; // Assuming page width
  const pageBottom = page.y + pageHeight; // Assuming page height

  return (
    componentPosition.x < pageRight &&
    componentRight > page.x &&
    componentPosition.y < pageBottom &&
    componentBottom > page.y
  );
}
