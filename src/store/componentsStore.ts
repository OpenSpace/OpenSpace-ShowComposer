// store.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, devtools } from 'zustand/middleware';
import { roundToNearest } from '@/utils/math';
import { v4 as uuidv4 } from 'uuid';

export type ComponentType =
  | 'fade'
  | 'flyto'
  | 'timepanel'
  | 'navpanel'
  | 'settime'
  | 'setfocus'
  | 'richtext'
  | 'title'
  | 'video'
  | 'image'
  | 'default'
  | 'boolean'
  | 'number'
  | 'trigger'
  | 'multi';

export type Toggle = 'on' | 'off' | 'toggle';
export type MultiState = 'false' | 'pendingDelete' | 'pendingSave' | 'true';

type Page = {
  components: Array<ComponentBase['id']>;
  id: string;
};

interface ComponentBase {
  id: string;
  // page: string;
  isMulti: MultiState;
  type: ComponentType;
  gui_name: string;
  gui_description: string;
  x: number;
  y: number;
  minWidth: number;
  minHeight: number;
  width: number;
  height: number;
  intDuration?: number;
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
  // intDuration: number;
  triggerAction: () => void;
}

export type MultiOption =
  | TriggerComponent
  | BooleanComponent
  | FadeComponent
  | SetFocusComponent
  | FlyToComponent
  | SetTimeComponent;

export const staticComponents = [
  { value: 'richtext', label: 'Rich Text' },
  { value: 'title', label: 'Title' },
  { value: 'video', label: 'Video' },
  { value: 'image', label: 'Image' },
];
export const presetComponents = [
  { value: 'fade', label: 'Fade' },
  { value: 'setfocus', label: 'Set Focus' },
  { value: 'flyto', label: 'Fly To' },
  { value: 'settime', label: 'Set Time' },
  { value: 'multi', label: 'Multi' },
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
];

//create typeguard to determing if opbject is of type MultiOption
export const isMultiOption = (option: any): option is MultiOption => {
  return (
    option.type === 'trigger' ||
    option.type === 'boolean' ||
    option.type === 'fade' ||
    option.type === 'setfocus' ||
    option.type === 'flyto' ||
    option.type === 'settime'
  );
};

export interface MultiComponent extends ComponentBase {
  type: 'multi';
  components: {
    component: MultiOption['id'];
    delay: number;
    buffer: number;
    chained: boolean;
    totalOffset: number;
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
  | RichTextComponent
  | TitleComponent
  | VideoComponent
  | ImageComponent
  | BooleanComponent
  | TriggerComponent
  | NumberComponent
  | MultiComponent;

interface State {
  pages: Array<Page>;
  currentPage: Page['id'];
  currentPageIndex: number;
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
  setAsyncPreSubmitOperation: (operation: (() => any) | null) => void;
  executeAndResetAsyncPreSubmitOperation: () => void;
}

export const useStore = create<State>()(
  devtools(
    persist(
      immer((set, get) => ({
        pages: [],
        currentPageIndex: 0,
        currentPage: '',
        components: {},
        overlappedComponents: {},
        selectedComponents: [],
        getComponentById: (id: Component['id']) => {
          const state = get();
          return state.components[id];
        },
        // state.components.find((comp) => comp.id === id),
        addPage: () =>
          set((state) => {
            const newId = uuidv4();
            const newPage = { id: newId, components: [] };
            state.pages.push(newPage);
            state.currentPageIndex = state.pages.length - 1;
            state.currentPage = newPage.id;
          }),
        deletePage: (pageID: string) =>
          set((state) => {
            state.pages
              .find((page) => page.id === pageID)
              ?.components.forEach((compId) => {
                delete state.components[compId];
              });
            state.currentPageIndex = Math.min(
              Math.max(state.currentPageIndex, 0),
              state.pages.length - 1,
            );
            state.pages = state.pages.filter((page) => page.id !== pageID);
            if (state.pages.length === 0) {
              const newId = uuidv4();
              const newPage = { id: newId, components: [] };
              state.pages.push(newPage);
              state.currentPageIndex = state.pages.length - 1;
              state.currentPage = newPage.id;
            } else {
              state.currentPage = state.pages[state.currentPageIndex].id;
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
            pages.find((page) => page.id === id) || { id: '', components: [] }
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
        addComponent: (component: Component) =>
          set(
            (state) => {
              state.components[component.id] = {
                ...component,
              };
              if (state.pages.length === 0) {
                const newId = uuidv4();
                const newPage = { id: newId, components: [component.id] };
                state.pages.push(newPage);
                state.currentPageIndex = 0;
                state.currentPage = newPage.id;
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
                  console.log(c);
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
              const newId = uuidv4();
              state.components = {};
              state.overlappedComponents = {};
              state.selectedComponents = [];
              state.pages = [{ id: newId, components: [] }];
              state.currentPage = newId;
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
        setAsyncPreSubmitOperation: (operation: (() => any) | null) =>
          set(() => ({
            asyncPreSubmitOperation: operation,
          })),
        executeAndResetAsyncPreSubmitOperation: async () => {
          const state = get(); // Get the current state
          if (state.asyncPreSubmitOperation) {
            await state.asyncPreSubmitOperation();
            set({ asyncPreSubmitOperation: null }); // Reset to null after execution
          }
        },
      })),
      { name: 'components-storage' },
    ),
    { name: 'components-storage' },
  ),
);

//save out the store to a json file that is saved to drive
export const saveStore = () => {
  const store = useStore.getState();
  const storeString = JSON.stringify(store);
  const blob = new Blob([storeString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'store.json';
  a.click();
};

//open local json file and load store from a json file
export const loadStore = async () => {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.json';
  fileInput.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target?.result) {
          const store = JSON.parse(e.target.result as string);
          console.log(store);
          useStore.setState(store);
        }
      };
      reader.readAsText(file);
    }
  };
  fileInput.click();
};
