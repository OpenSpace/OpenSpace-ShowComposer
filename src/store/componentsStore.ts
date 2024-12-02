// store.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, devtools } from 'zustand/middleware';
import { roundToNearest } from '@/utils/math';
import { v4 as uuidv4 } from 'uuid';
import {
  calculateTotalLayoutHeight,
  calculateTotalLayoutWidth,
  calculateGridIndex,
} from '@/utils/layoutCalculations';
import { usePositionStore } from './positionStore';
// import { usePropertyStore } from './propertyStore';

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
}

export interface TimeComponent extends ComponentBase {
  type: 'timepanel';
}
export interface NavComponent extends ComponentBase {
  type: 'navpanel';
}
export interface StatusComponent extends ComponentBase {
  type: 'statuspanel';
}

export interface RecordComponent extends ComponentBase {
  type: 'recordpanel';
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
  rows: number;
  columns: number;
  children: (string | null)[]; // Array of component IDs
  padding: number;
  childWidth: number;
  childHeight: number;
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

function addPage(state: ComponentState) {
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

export interface ComponentState {
  pages: Array<Page>;
  updatePage: (id: Page['id'], data: Partial<Page>) => void;
  currentPage: Page['id'];
  currentPageIndex: number;
  timepanel: TimeComponent | null;
  navpanel: NavComponent | null;
  statuspanel: StatusComponent | null;
  recordpanel: RecordComponent | null;
  components: Record<string, Component>;
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
  removeComponent: (id: Component['id']) => void;
  removeAllComponents: () => void;
  asyncPreSubmitOperation: (() => any) | null;
  resetAsyncPreSubmitOperation: () => void;
  setAsyncPreSubmitOperation: (operation: (() => any) | null) => void;
  executeAndResetAsyncPreSubmitOperation: () => void;
  layouts: Record<string, LayoutBase>;
  updateLayout: (id: string, updates: Partial<LayoutBase>) => void;
  addLayout: (config: {
    type: LayoutType;
    x: number;
    y: number;
    rows?: number;
    columns?: number;
  }) => string;
  reorderComponentInLayout: (
    layoutId: string,
    componentId: string,
    x: number,
    y: number,
  ) => void;
  resizeComponentsInLayout: (layoutId: string) => void;
  handleComponentDrop: (componentId: string, x: number, y: number) => void;
  addComponentToLayout: (
    layoutId: string,
    componentId: string,
    x: number,
    y: number,
  ) => void;
  getGridPosition: (layoutId: string, gridIndex: number) => Position;
  removeComponentFromLayout: (
    layoutId: string,
    componentId: string,
    x: number,
    y: number,
  ) => void;
  deleteLayout: (layoutId: string) => void;
}

export function isComponent(item: Component | LayoutBase): item is Component {
  return 'isMulti' in item;
}

export const useComponentStore = create<ComponentState>()(
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
        // tempPositions: {},
        // overlappedComponents: {},
        // selectedComponents: [],
        layouts: {},
        updateLayout: (id, updates) => {
          set((state) => {
            state.layouts[id] = { ...state.layouts[id], ...updates };
          });
          get().resizeComponentsInLayout(id);
        },
        addLayout: (config) => {
          const id = uuidv4();

          set((state) => {
            const rows = config.rows || 1;
            const columns = config.columns || 1;

            // Create the layout
            state.layouts[id] = {
              id,
              type: config.type,
              children:
                config.type === 'grid'
                  ? new Array(rows * columns).fill(null)
                  : [],
              rows,
              columns,
              padding: 25,
              childWidth: 200,
              childHeight: 200,
            };
            console.log('new layout', state.layouts[id]);
            usePositionStore.getState().addPosition(id, {
              x: config.x,
              y: config.y,
              minWidth: 50,
              minHeight: 50,
              width:
                (state.layouts[id].childWidth + state.layouts[id].padding) *
                  state.layouts[id].columns +
                state.layouts[id].padding,
              height:
                (state.layouts[id].childHeight + state.layouts[id].padding) *
                  state.layouts[id].rows +
                state.layouts[id].padding,
            });

            // Add layout to current page
            const page = state.pages.find((p) => p.id === state.currentPage);
            if (page) {
              page.components.push(id);
            }
          });

          return id;
        },
        handleComponentDrop: (componentId: string, x: number, y: number) => {
          const layouts = get().layouts;
          let targetLayout: LayoutBase | null = null;
          const currentLayoutId = Object.keys(layouts).find((id) =>
            layouts[id].children.includes(componentId),
          );

          const { width, height } =
            usePositionStore.getState().positions[componentId];

          const adjustedPosition = currentLayoutId
            ? usePositionStore
                .getState()
                .adjustPositionForParent(currentLayoutId, x, y)
            : { x, y };

          // Find the layout the component is over
          Object.entries(layouts).forEach(([_id, layout]) => {
            console.log('layout', layout);

            if (
              usePositionStore
                .getState()
                .isOverLayout(
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
                get().reorderComponentInLayout(
                  currentLayoutId,
                  componentId,
                  x,
                  y,
                );
                get().resizeComponentsInLayout(currentLayoutId);
              } else {
                // Over a different layout, move to new layout
                console.log('MOVING TO NEW LAYOUT');
                get().removeComponentFromLayout(
                  currentLayoutId,
                  componentId,
                  x,
                  y,
                );
                get().addComponentToLayout(
                  (targetLayout as LayoutBase).id,
                  componentId,
                  adjustedPosition.x,
                  adjustedPosition.y,
                );
                // get().reorderComponentInLayout(
                //   (targetLayout as LayoutBase).id,
                //   componentId,
                //   adjustedPosition.x,
                //   adjustedPosition.y,
                // );
                get().resizeComponentsInLayout((targetLayout as LayoutBase).id);
                get().resizeComponentsInLayout(currentLayoutId);
              }
            } else {
              // Not over any layout, remove from current layout
              get().removeComponentFromLayout(
                currentLayoutId,
                componentId,
                x,
                y,
              );
              get().resizeComponentsInLayout(currentLayoutId);
            }
          } else {
            // Component does not belong to a layout
            if (targetLayout) {
              //add to new layout
              get().addComponentToLayout(
                (targetLayout as LayoutBase).id,
                componentId,
                x,
                y,
              );
              get().reorderComponentInLayout(
                (targetLayout as LayoutBase).id,
                componentId,
                x,
                y,
              );
              get().resizeComponentsInLayout((targetLayout as LayoutBase).id);
            } else {
              // Update position normally
              usePositionStore.getState().updatePosition(componentId, {
                isDragging: false,
                x: roundToNearest(x, 25),
                y: roundToNearest(y, 25),
              });
            }
          }
        },
        addComponentToLayout: (
          layoutId: string,
          componentId: string,
          x: number,
          y: number,
        ) => {
          set((state) => {
            const layout = state.layouts[layoutId];
            if (layout) {
              const adjustedPosition = usePositionStore
                .getState()
                .adjustPositionForLayout(layoutId, x, y);

              if (layout.type === 'grid') {
                const { gridIndex, gridPosition } = calculateGridIndex(
                  adjustedPosition.x,
                  adjustedPosition.y,
                  layout,
                );
                if (layout.children[gridIndex] === null) {
                  usePositionStore.getState().updatePosition(componentId, {
                    x: gridPosition.x,
                    y: gridPosition.y,
                    width: layout.childWidth,
                    height: layout.childHeight,
                  });
                  layout.children[gridIndex] = componentId;
                }
              } else {
                usePositionStore.getState().updatePosition(componentId, {
                  x: adjustedPosition.x,
                  y: adjustedPosition.y,
                  width: layout.childWidth,
                  height: layout.childHeight,
                });
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
            y:
              padding +
              Math.floor(gridIndex / columns) * (childHeight + padding),
          };
        },
        removeComponentFromLayout: (
          layoutId: string,
          componentId: string,
          x: number,
          y: number,
        ) => {
          set((state) => {
            const layout = state.layouts[layoutId];
            if (layout) {
              if (layout.type === 'grid') {
                const gridIndex = layout.children.findIndex(
                  (id) => id === componentId,
                );
                if (gridIndex !== -1) {
                  layout.children[gridIndex] = null;
                }
              } else {
                layout.children = layout.children.filter(
                  (id) => id !== componentId,
                );
              }
              //
              const position =
                usePositionStore.getState().positions[componentId];
              const layoutPosition =
                usePositionStore.getState().positions[layoutId];
              if (position) {
                usePositionStore.getState().updatePosition(componentId, {
                  x: x + layoutPosition.x,
                  y: y + layoutPosition.y,
                });
              }
            }
          });
        },

        resizeComponentsInLayout: (layoutId: string) => {
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
                layout.children.length,
              );
              usePositionStore.getState().updatePosition(layoutId, {
                width: totalLayoutWidth,
              });
            } else if (layout.type === 'column') {
              const totalLayoutHeight = calculateTotalLayoutHeight(
                layout,
                layout.children.length,
              );

              usePositionStore.getState().updatePosition(layoutId, {
                height: totalLayoutHeight,
              });
            }

            layout.children.forEach((childId, index) => {
              if (layout.type === 'row') {
                const child =
                  usePositionStore.getState().positions[childId as string];
                if (child) {
                  usePositionStore
                    .getState()
                    .updatePosition(childId as string, {
                      x:
                        index * (layout.childWidth + layout.padding) +
                        layout.padding,
                      y: layout.padding,
                      width: layout.childWidth,
                      height: layout.childHeight,
                    });
                }
              } else if (layout.type === 'column') {
                const child =
                  usePositionStore.getState().positions[childId as string];
                if (child) {
                  usePositionStore
                    .getState()
                    .updatePosition(childId as string, {
                      x: layout.padding,
                      y:
                        index * (layout.childHeight + layout.padding) +
                        layout.padding,
                      width: layout.childWidth,
                      height: layout.childHeight,
                    });
                }
              } else {
                const position = get().getGridPosition(layoutId, index);
                usePositionStore.getState().updatePosition(childId as string, {
                  x: position.x,
                  y: position.y,
                  width: layout.childWidth,
                  height: layout.childHeight,
                });
              }
            });
          });
        },
        reorderComponentInLayout(
          layoutId: string,
          componentId: string,
          x: number,
          y: number,
        ) {
          set((state) => {
            const layout = state.layouts[layoutId];
            if (!layout) {
              console.error(`Layout with ID ${layoutId} not found.`);
              return;
            }

            const components = layout.children
              .filter((id) => id !== null)
              .map((id) => {
                return usePositionStore.getState().positions[id as string];
              });

            let newIndex: number | null = null;
            const currentIndex = layout.children.indexOf(componentId);

            if (layout.type === 'row') {
              components.forEach((component, index) => {
                if (componentId !== layout.children[index]) {
                  if (
                    x + layout.childWidth / 2.0 > component.x &&
                    x + layout.childWidth / 2.0 < component.x + component.width
                  ) {
                    newIndex = index;
                  }
                }
              });

              if (newIndex !== null && newIndex !== currentIndex) {
                layout.children = layout.children.filter(
                  (id) => id !== componentId,
                );
                layout.children.splice(newIndex, 0, componentId);
              }
            } else if (layout.type === 'column') {
              components.forEach((component, index) => {
                if (componentId !== layout.children[index]) {
                  if (
                    y + layout.childHeight / 2.0 > component.y &&
                    y + layout.childHeight / 2.0 <
                      component.y + component.height
                  ) {
                    newIndex = index;
                  }
                }
              });

              if (newIndex !== null && newIndex !== currentIndex) {
                layout.children = layout.children.filter(
                  (id) => id !== componentId,
                );
                layout.children.splice(newIndex, 0, componentId);
              }
            } else if (layout.type === 'grid') {
              const { gridIndex, gridPosition } = calculateGridIndex(
                x,
                y,
                layout,
              );
              if (layout.children[gridIndex] === null) {
                usePositionStore.getState().updatePosition(componentId, {
                  x: gridPosition.x,
                  y: gridPosition.y,
                  width: layout.childWidth,
                  height: layout.childHeight,
                });
                layout.children[currentIndex] = null;
                layout.children[gridIndex] = componentId;
              }
            }
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
              gui_name: 'Time Panel',
              gui_description: '',
            };
            usePositionStore.getState().addPosition(state.timepanel.id, {
              x: 250,
              y: 500,
              minWidth: 325,
              minHeight: 425,
              width: 325,
              height: 425,
              minimized: true,
            });
            state.navpanel = {
              id: uuidv4(),
              type: 'navpanel',
              isMulti: 'false' as MultiState,
              gui_name: 'Nav Panel',
              gui_description: '',
            };
            usePositionStore.getState().addPosition(state.navpanel.id, {
              x: 0,
              y: 600,
              minWidth: 225,
              minHeight: 325,
              width: 225,
              height: 325,
              minimized: true,
            });
            state.statuspanel = {
              id: uuidv4(),
              type: 'statuspanel',
              isMulti: 'false' as MultiState,
              gui_name: 'Status Panel',
              gui_description: '',
            };
            usePositionStore.getState().addPosition(state.statuspanel.id, {
              x: 600,
              y: 675,
              minWidth: 275,
              minHeight: 250,
              width: 275,
              height: 250,
              minimized: true,
            });
            state.recordpanel = {
              id: uuidv4(),
              type: 'recordpanel',
              isMulti: 'false' as MultiState,
              gui_name: 'Record Panel',
              gui_description: '',
            };
            usePositionStore.getState().addPosition(state.recordpanel.id, {
              x: 895,
              y: 575,
              minWidth: 275,
              minHeight: 400,
              width: 275,
              height: 400,
              minimized: true,
            });
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
              usePositionStore.getState().addPosition(component.id, {
                x: 0,
                y: 0,
                minWidth: 50,
                minHeight: 50,
                width: 300,
                height: 175,
              });
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
        removeComponent: (id) =>
          set(
            (state) => {
              delete state.components[id];
              usePositionStore.getState().deletePosition(id);
              // state.components = state.componentsfilter(
              //   (comp) => comp.id !== id,
              // );.
              // release multi
              // const component = state.components.find((v) => v.id == id);
              const component = state.getComponentById(id);
              console.log('component', component);
              if (component?.type == 'multi') {
                (component as MultiComponent).components.forEach((c) => {
                  if (state.components[c.component].isMulti == 'true') {
                    state.updateComponent(c.component, { isMulti: 'false' });
                  }
                });
              }

              //if component is in a layout, remove from layout
              // Object.keys(state.layouts).forEach((layoutId) => {
              //   if (state.layouts[layoutId].children.includes(id)) {
              //     state.removeComponentFromLayout(layoutId, id, 0, 0);
              //   }
              // });
              // updateLayoutAndChildrenDimensions
              state.pages = state.pages.map((page) => ({
                ...page,
                components: page.components.filter((compId) => compId !== id),
              }));
              // delete state.overlappedComponents[id];
              // for (const key in state.overlappedComponents) {
              //   state.overlappedComponents[key] = state.overlappedComponents[
              //     key
              //   ].filter((overlapId) => overlapId !== id);
              // }
            },
            false,
            'component/remove',
          ),
        removeAllComponents: () =>
          set(
            (state) => {
              // const newId = uuidv4();
              usePositionStore.getState().deleteAllPosition();
              state.components = {};
              state.layouts = {};
              // state.overlappedComponents = {};
              // state.selectedComponents = [];
              state.pages = [];
              addPage(state);
            },
            false,
            'component/removeAll',
          ),

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

        deleteLayout: (layoutId: string) =>
          set((state) => {
            const layout = state.layouts[layoutId];
            // Remove the layout ID from any pages that contain it
            state.pages.forEach((page) => {
              page.components = page.components.filter((id) => id !== layoutId);
            });

            // Offset Component positions from Layout position
            const layoutPosition =
              usePositionStore.getState().positions[layoutId];
            layout.children.forEach((componentId) => {
              if (componentId) {
                const position =
                  usePositionStore.getState().positions[componentId];
                if (position && layoutPosition) {
                  usePositionStore.getState().updatePosition(componentId, {
                    x: position.x + layoutPosition.x,
                    y: position.y + layoutPosition.y,
                  });
                }
              }
            });
            // Delete Layout Position
            usePositionStore.getState().deletePosition(layoutId);
            // Remove the layout from the state
            delete state.layouts[layoutId];
          }),
      })),

      { name: 'components-storage' },
    ),
    { name: 'components-storage' },
  ),
);
