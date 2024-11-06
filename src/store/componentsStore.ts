// store.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, devtools } from 'zustand/middleware';
import { roundToNearest } from '@/utils/math';
import { v4 as uuidv4 } from 'uuid';
import {
  calculateComponentDimensions,
  calculateTotalLayoutWidth,
  calculateLayoutDimensions,
} from '@/utils/layoutCalculations';

export type LayoutType = 'row' | 'column' | 'grid';

export type ComponentType =
  | 'fade'
  | 'flyto'
  | 'statuspanel'
  | 'timepanel'
  | 'navpanel'
  | 'recordpanel'
  | 'sessionplayback'
  | 'settime'
  | 'setnavstate'
  | 'setfocus'
  | 'richtext'
  | 'title'
  | 'video'
  | 'image'
  | 'default'
  | 'boolean'
  | 'number'
  | 'trigger'
  | 'page'
  | 'multi';

export type Toggle = 'on' | 'off' | 'toggle';
export type MultiState = 'false' | 'pendingDelete' | 'pendingSave' | 'true';

export type Page = {
  components: Array<ComponentBase['id']>;
  id: string;
  x: number;
  y: number;
};

interface ComponentBase {
  id: string;
  isMulti: MultiState;
  type: ComponentType;
  lockName?: boolean;
  gui_name: string;
  gui_description: string;
  x: number;
  y: number;
  minWidth: number;
  minHeight: number;
  width: number;
  height: number;
  originalX?: number;
  originalY?: number;
  // originalWidth?: number;
  // originalHeight?: number;
}

export interface TimeComponent extends ComponentBase {
  type: 'timepanel';
  minimized: boolean;
}
export interface NavComponent extends ComponentBase {
  type: 'navpanel';
  minimized: boolean;
}
export interface StatusComponent extends ComponentBase {
  type: 'statuspanel';
  minimized: boolean;
}

export interface RecordComponent extends ComponentBase {
  type: 'recordpanel';
  minimized: boolean;
}

export interface RichTextComponent extends ComponentBase {
  type: 'richtext';
  text: string;
}

export interface TitleComponent extends ComponentBase {
  type: 'title';
  text: string;
}
export interface VideoComponent extends ComponentBase {
  type: 'video';
  url: string;
}

export interface ImageComponent extends ComponentBase {
  type: 'image';
  url: string;
}

export interface SessionPlaybackComponent extends ComponentBase {
  type: 'sessionplayback';
  file: string;
  loop: boolean;
  forceTime: boolean;
  backgroundImage: string;
  triggerAction: () => void;
}

export interface FlyToComponent extends ComponentBase {
  type: 'flyto';
  target?: string;
  geo?: boolean;
  intDuration?: number;
  lat?: number;
  long?: number;
  alt?: number;
  backgroundImage: string;
  triggerAction: () => void;
}

export interface FadeComponent extends ComponentBase {
  type: 'fade';
  property: string;
  intDuration: number;
  action: Toggle;
  backgroundImage: string;
  triggerAction: () => void;
}

export interface SetTimeComponent extends ComponentBase {
  type: 'settime';
  time: Date | string;
  intDuration: number;
  interpolate: boolean;
  fadeScene: boolean;
  backgroundImage: string;
  triggerAction: () => void;
}

export interface SetNavComponent extends ComponentBase {
  type: 'setnavstate';
  navigationState: any;
  time: Date | string;
  setTime: boolean;
  fadeScene: boolean;
  backgroundImage: string;
  intDuration: number;
  triggerAction: () => void;
}
export interface SetFocusComponent extends ComponentBase {
  type: 'setfocus';
  property: string;
  backgroundImage: string;
  triggerAction: () => void;
}

export interface BooleanComponent extends ComponentBase {
  type: 'boolean';
  property: string;
  action: Toggle;
  backgroundImage: string;
  triggerAction: () => void;
}
export interface NumberComponent extends ComponentBase {
  type: 'number';
  min: number;
  max: number;
  step: number;
  exponent: number;
  property: string;
  backgroundImage: string;
  triggerAction: (value: number) => void;
}
export interface TriggerComponent extends ComponentBase {
  type: 'trigger';
  property: string;
  backgroundImage: string;
  triggerAction: () => void;
}

export interface PageComponent extends ComponentBase {
  type: 'page';
  page: number;
  backgroundImage: string;
  triggerAction: () => void;
}

export interface LayoutBase {
  id: string;
  type: LayoutType;
  children: string[]; // Array of component IDs
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  isCollapsed?: boolean;
}

export type MultiOption =
  | TriggerComponent
  | BooleanComponent
  | FadeComponent
  | SetFocusComponent
  | FlyToComponent
  | SetTimeComponent
  | SessionPlaybackComponent
  | PageComponent;

export const staticComponents = [
  { value: 'richtext', label: 'Rich Text' },
  { value: 'title', label: 'Title' },
  { value: 'video', label: 'Video' },
  { value: 'image', label: 'Image' },
];
export const presetComponents = [
  { value: 'fade', label: 'Fade' },
  { value: 'setfocus', label: 'Set Focus' },
  { value: 'setnavstate', label: 'Set Navigation' },
  { value: 'flyto', label: 'Fly To' },
  { value: 'settime', label: 'Set Time' },
  { value: 'multi', label: 'Multi' },
  { value: 'sessionplayback', label: 'Session Playback' },
  { value: 'page', label: 'Go To Page' },
];

export const propertyComponents = [
  { value: 'boolean', label: 'Boolean' },
  { value: 'number', label: 'Number' },
  { value: 'trigger', label: 'Trigger' },
];

export const allComponentLabels = [
  ...presetComponents,
  ...staticComponents,
  ...propertyComponents,
];

export const multiOptions = [
  { value: 'trigger', label: 'Trigger' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'fade', label: 'Fade' },
  { value: 'setfocus', label: 'Set Focus' },
  { value: 'flyto', label: 'Fly To' },
  { value: 'settime', label: 'Set Time' },
  { value: 'sessionplayback', label: 'Session Playback' },
  { value: 'setnavstate', label: 'Set Navigation' },
  { value: 'page', label: 'Go To Page' },
];

//create typeguard to determing if opbject is of type MultiOption
export const isMultiOption = (option: any): option is MultiOption => {
  return (
    option.type === 'trigger' ||
    option.type === 'boolean' ||
    option.type === 'fade' ||
    option.type === 'setfocus' ||
    option.type === 'flyto' ||
    option.type === 'settime' ||
    option.type === 'sessionplayback' ||
    option.type === 'setnavstate' ||
    option.type === 'page'
  );
};

export interface MultiComponent extends ComponentBase {
  type: 'multi';
  components: {
    component: MultiOption['id'];
    buffer: number;
    startTime: number;
    endTime: number;
    chained: boolean;
  }[];
  backgroundImage: string;
  triggerAction: () => void;
}

export type Component =
  | ComponentBase
  | FadeComponent
  | SetFocusComponent
  | FlyToComponent
  | SetTimeComponent
  | SetNavComponent
  | RichTextComponent
  | TitleComponent
  | VideoComponent
  | ImageComponent
  | BooleanComponent
  | TriggerComponent
  | NumberComponent
  | SessionPlaybackComponent
  | PageComponent
  | MultiComponent;

interface Position {
  x: number;
  y: number;
}

interface TempPositions {
  [key: string]: Position;
}

function addPage(state: State) {
  const newId = uuidv4();
  const newPage: Page = {
    id: newId,
    components: [],
    x: 100,
    y: 100,
  };
  state.pages.push(newPage);
  state.currentPageIndex = state.pages.length - 1;
  state.currentPage = newPage.id;
}

interface State {
  pages: Array<Page>;
  updatePage: (id: Page['id'], data: Partial<Page>) => void;
  currentPage: Page['id'];
  currentPageIndex: number;
  timepanel: TimeComponent | null;
  navpanel: NavComponent | null;
  statuspanel: StatusComponent | null;
  recordpanel: RecordComponent | null;
  tempPositions: TempPositions;
  setTempPositions: (newPositions: TempPositions) => void;
  setTempPosition: (id: string, x: number, y: number) => void;
  components: Record<string, Component>;
  overlappedComponents: { [key: Component['id']]: Component['id'][] }; // Map component ID to list of overlapping component IDs
  selectedComponents: Component['id'][];
  addComponentToPageById: (
    componentId: Component['id'],
    pageId: Page['id'],
  ) => void;
  removeComponentToPageById: (
    componentId: Component['id'],
    pageId: Page['id'],
  ) => void;
  getComponentById: (id: Component['id']) => Component;
  createPanels: () => void;
  updatePanel: (
    updates: Partial<
      TimeComponent | NavComponent | StatusComponent | RecordComponent
    >,
  ) => void;
  addPage: () => void;
  deletePage: (pageID: string) => void;
  goToPage: (page: number) => void;
  getPageById: (id: string) => Page;
  addComponent: (component: Component) => void;
  updateComponent: (id: Component['id'], updates: Partial<Component>) => void;
  updateComponentPosition: (id: Component['id'], x: number, y: number) => void;
  removeComponent: (id: Component['id']) => void;
  removeAllComponents: () => void;
  selectComponent: (id: Component['id']) => void;
  deselectComponent: (id: Component['id']) => void;
  clearSelection: () => void;
  checkOverlap: (component: Component) => Component | null;
  asyncPreSubmitOperation: (() => any) | null;
  resetAsyncPreSubmitOperation: () => void;
  setAsyncPreSubmitOperation: (operation: (() => any) | null) => void;
  executeAndResetAsyncPreSubmitOperation: () => void;
  layouts: Record<string, LayoutBase>;
  addLayout: (config: {
    type: LayoutType;
    x: number;
    y: number;
    width: number;
    height: number;
  }) => string;
  addComponentToLayout: (layoutId: string, componentId: string) => void;
  removeComponentFromLayout: (
    layoutId: string,
    componentId: string,
    x: number,
    y: number,
  ) => void;
  reorderLayoutComponents: (layoutId: string, newOrder: string[]) => void;
  updateLayout: (layoutId: string, updates: Partial<LayoutBase>) => void;
}

// First, let's create a type guard to check if something is a Component
function isComponent(item: Component | LayoutBase): item is Component {
  return 'isMulti' in item;
}

export const useComponentStore = create<State>()(
  devtools(
    persist(
      immer((set, get) => ({
        pages: [],
        currentPageIndex: 0,
        navpanel: null,
        timepanel: null,
        statuspanel: null,
        recordpanel: null,
        currentPage: '',
        components: {},
        tempPositions: {},
        overlappedComponents: {},
        selectedComponents: [],
        layouts: {},
        addLayout: (config) => {
          const id = uuidv4();

          set((state) => {
            // Create the layout
            state.layouts[id] = {
              id,
              type: config.type,
              children: [],
              x: config.x,
              y: config.y,
              width: config.width,
              height: config.height,
              minWidth: 200,
              minHeight: 100,
              isCollapsed: false,
            };

            // Add layout to current page
            const page = state.pages.find((p) => p.id === state.currentPage);
            if (page) {
              page.components.push(id);
            }
          });

          return id;
        },

        addComponentToLayout: (layoutId, componentId) =>
          set((state) => {
            const layout = state.layouts[layoutId];
            const component = state.components[componentId];

            if (layout && component && isComponent(component)) {
              if (!layout.children.includes(componentId)) {
                layout.children.push(componentId);

                const dimensions = calculateComponentDimensions(
                  layout,
                  layout.children.length - 1,
                  component,
                  layout.children.length,
                );

                Object.assign(component, dimensions);
              }

              // Update layout dimensions based on type
              const layoutDimensions = calculateLayoutDimensions(
                layout,
                state.components,
              );
              Object.assign(layout, layoutDimensions);
            }
          }),

        removeComponentFromLayout: (layoutId, componentId, x, y) =>
          set((state) => {
            const layout = state.layouts[layoutId];
            const component = state.components[componentId];

            if (layout && component && isComponent(component)) {
              layout.children = layout.children.filter(
                (id) => id !== componentId,
              );
              component.x = x + layout.x;
              component.y = y + layout.y;

              layout.children.forEach((childId, index) => {
                const child = state.components[childId];
                if (child && isComponent(child)) {
                  const dimensions = calculateComponentDimensions(
                    layout,
                    index,
                    child,
                    layout.children.length,
                  );
                  Object.assign(child, dimensions);
                }
              });

              layout.width = calculateTotalLayoutWidth(
                state.components,
                layout,
              );
            }
          }),

        reorderLayoutComponents: (layoutId, newOrder) =>
          set((state) => {
            const layout = state.layouts[layoutId];
            if (layout) {
              layout.children = newOrder;
              // Recalculate positions based on new order
              newOrder.forEach((componentId, index) => {
                const component = state.components[componentId];
                if (component) {
                  switch (layout.type) {
                    case 'row':
                      component.x =
                        layout.x + index * (layout.width / newOrder.length);
                      break;
                    case 'column':
                      component.y =
                        layout.y + index * (layout.height / newOrder.length);
                      break;
                    case 'grid': {
                      const cols = Math.ceil(Math.sqrt(newOrder.length));
                      const row = Math.floor(index / cols);
                      const col = index % cols;
                      component.x = layout.x + col * (layout.width / cols);
                      component.y = layout.y + row * (layout.height / cols);
                      break;
                    }
                  }
                }
              });
            }
          }),

        updateLayout: (layoutId, updates) =>
          set((state) => {
            const layout = state.layouts[layoutId];
            if (layout) {
              Object.assign(layout, updates);

              if (updates.width || updates.height) {
                layout.children.forEach((childId, index) => {
                  const component = state.components[childId];
                  if (component && isComponent(component)) {
                    const dimensions = calculateComponentDimensions(
                      layout,
                      index,
                      component,
                      layout.children.length,
                    );
                    Object.assign(component, dimensions);
                  }
                });

                layout.width = calculateTotalLayoutWidth(
                  state.components,
                  layout,
                );
              }
            }
          }),
        setTempPosition(id, x, y) {
          set((state) => {
            state.tempPositions[id] = { x, y };
          });
        },
        setTempPositions(newPositions: TempPositions) {
          set((state) => {
            state.tempPositions = newPositions;
          });
        },
        getComponentById: (id: Component['id']) => {
          const state = get();
          return state.components[id];
        },
        updatePage: (id: Page['id'], data: Partial<Page>) =>
          set(
            (state) => {
              const page = state.pages.find((page) => page.id === id);
              if (page) {
                Object.assign(page, data);
              }
            },
            false,
            'page/update',
          ),
        addPage: () =>
          set((state) => {
            addPage(state);
          }),
        deletePage: (pageID: string) =>
          set((state) => {
            state.pages
              .find((page) => page.id === pageID)
              ?.components.forEach((compId) => {
                delete state.components[compId];
              });
            state.pages = state.pages.filter((page) => page.id !== pageID);
            let newIndex = Math.min(
              Math.max(state.currentPageIndex, 0),
              state.pages.length - 1,
            );
            state.currentPageIndex = newIndex;
            if (state.pages.length === 0) {
              addPage(state);
              newIndex = 0;
            } else {
              state.currentPage = state.pages[newIndex].id;
            }
          }),
        goToPage: (page: number) =>
          set((state) => {
            if (page >= 0 && page < state.pages.length) {
              state.currentPageIndex = page;
              state.currentPage = state.pages[page].id;
            }
          }),
        getPageById: (id: string) => {
          const { pages } = get();
          return (
            pages.find((page) => page.id === id) || {
              id: '',
              components: [],
              x: 0,
              y: 0,
              width: 1920,
              height: 1080,
              minWidth: 400,
              minHeight: 400,
            }
          );
        },
        addComponentToPageById: (componentId, pageId) =>
          set((state) => {
            //push to pages if componentID is not already in
            state.pages
              .find((page) => page.id === pageId)
              ?.components.push(componentId);
          }),
        removeComponentToPageById: (componentId, pageId) =>
          set((state) => {
            state.pages
              .find((page) => page.id === pageId)
              ?.components.filter((compId) => compId !== componentId);
          }),
        createPanels: () =>
          set((state) => {
            state.timepanel = {
              id: uuidv4(),
              type: 'timepanel',
              isMulti: 'false' as MultiState,
              minimized: true,
              x: 250,
              y: 500,
              minWidth: 325,
              minHeight: 425,
              width: 325,
              height: 425,
              gui_name: 'Time Panel',
              gui_description: '',
            };
            state.navpanel = {
              id: uuidv4(),
              type: 'navpanel',
              isMulti: 'false' as MultiState,
              minimized: true,
              x: 0,
              y: 600,
              minWidth: 225,
              minHeight: 325,
              width: 225,
              height: 325,
              gui_name: 'Nav Panel',
              gui_description: '',
            };
            state.statuspanel = {
              id: uuidv4(),
              type: 'statuspanel',
              isMulti: 'false' as MultiState,
              minimized: true,
              x: 600,
              y: 675,
              minWidth: 275,
              minHeight: 250,
              width: 275,
              height: 250,
              gui_name: 'Status Panel',
              gui_description: '',
            };
            state.recordpanel = {
              id: uuidv4(),
              type: 'recordpanel',
              isMulti: 'false' as MultiState,
              minimized: true,
              x: 895,
              y: 575,
              minWidth: 275,
              minHeight: 400,
              width: 275,
              height: 400,
              gui_name: 'Record Panel',
              gui_description: '',
            };
          }),
        updatePanel: (
          updates: Partial<
            TimeComponent | NavComponent | StatusComponent | RecordComponent
          >,
        ) =>
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
          }),
        addComponent: (component: Component) =>
          set(
            (state) => {
              state.components[component.id] = {
                ...component,
              };
              if (state.pages.length === 0) {
                addPage(state);
              } else {
                state.pages
                  .find((page) => page.id === state.currentPage)
                  ?.components.push(component.id);
              }
            },
            false,
            'component/add',
          ),
        updateComponent: (id, updates) =>
          set(
            (state) => {
              const component = state.components[id];
              if (component) {
                Object.assign(component, updates);
              }
            },
            false,
            'component/update',
          ),
        updateComponentPosition: (id, x, y) =>
          set(
            (state) => {
              const component = state.getComponentById(id);
              if (component) {
                component.x = roundToNearest(Math.max(component.x + x, 0), 40);
                component.y = roundToNearest(Math.max(component.y + y, 0), 40);
              }
            },
            false,
            'component/updatePosition',
          ),
        removeComponent: (id) =>
          set(
            (state) => {
              // state.components = state.componentsfilter(
              //   (comp) => comp.id !== id,
              // );.
              delete state.components[id];
              // release multi
              // const component = state.components.find((v) => v.id == id);
              const component = state.getComponentById(id);
              if (component?.type == 'multi') {
                (component as MultiComponent).components.forEach((c) => {
                  if (state.components[c.component].isMulti == 'true') {
                    state.updateComponent(c.component, { isMulti: 'false' });
                  }
                });
              }
              state.pages = state.pages.map((page) => ({
                ...page,
                components: page.components.filter((compId) => compId !== id),
              }));
              delete state.overlappedComponents[id];
              for (const key in state.overlappedComponents) {
                state.overlappedComponents[key] = state.overlappedComponents[
                  key
                ].filter((overlapId) => overlapId !== id);
              }
            },
            false,
            'component/remove',
          ),
        removeAllComponents: () =>
          set(
            (state) => {
              // const newId = uuidv4();
              state.components = {};
              state.layouts = {};
              state.overlappedComponents = {};
              state.selectedComponents = [];
              state.pages = [];
              addPage(state);
            },
            false,
            'component/removeAll',
          ),
        selectComponent: (id) =>
          set(
            (state) => {
              if (!state.selectedComponents.includes(id)) {
                state.selectedComponents.push(id);
              }
            },
            false,
            'component/select',
          ),
        deselectComponent: (id) =>
          set(
            (state) => {
              state.selectedComponents = state.selectedComponents.filter(
                (compId) => compId !== id,
              );
            },
            false,
            'component/deselect',
          ),
        clearSelection: () =>
          set(
            (state) => {
              state.selectedComponents = [];
            },
            false,
            'component/clearSelections',
          ),
        checkOverlap: (component) => {
          const state = get();
          let maxOverlapComponent: Component | null = null;
          let maxOverlapArea = 0;
          const overlappingComponents: string[] = [];
          //find which page Index contains component.id

          for (const c of state.getPageById(state.currentPage).components) {
            const comp = state.components[c];
            if (comp.id !== component.id) {
              const overlapX = Math.max(
                0,
                Math.min(component.x + component.width, comp.x + comp.width) -
                  Math.max(component.x, comp.x),
              );
              const overlapY = Math.max(
                0,
                Math.min(component.y + component.height, comp.y + comp.height) -
                  Math.max(component.y, comp.y),
              );
              const overlapArea = overlapX * overlapY;
              if (overlapArea > 0) {
                overlappingComponents.push(comp.id);
              }
              if (overlapArea > maxOverlapArea) {
                maxOverlapArea = overlapArea;
                maxOverlapComponent = comp;
              }
            }
          }
          set((state) => {
            state.overlappedComponents[component.id] = overlappingComponents;
            //hacky way of doing this for now
            overlappingComponents.forEach((overlapId) => {
              state.overlappedComponents[overlapId] = [component.id];
            });
          });
          return maxOverlapComponent;
        },
        asyncPreSubmitOperation: null, // Async operation placeholder, this is mainly used for saving photos to disk on component save
        resetAsyncPreSubmitOperation: () =>
          set({ asyncPreSubmitOperation: null }),
        setAsyncPreSubmitOperation: (operation: (() => any) | null) =>
          set({
            asyncPreSubmitOperation: operation,
          }),
        executeAndResetAsyncPreSubmitOperation: async () => {
          const state = get(); // Get the current state
          if (state.asyncPreSubmitOperation) {
            // console.log('Executing asyncPreSubmitOperation');
            // console.log(state.asyncPreSubmitOperation);
            await state.asyncPreSubmitOperation();
            // console.log('Finished executing asyncPreSubmitOperation');
            set({ asyncPreSubmitOperation: null }); // Reset to null after execution
          }
        },
      })),

      { name: 'components-storage' },
    ),
    { name: 'components-storage' },
  ),
);
