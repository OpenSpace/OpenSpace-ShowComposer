// store.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, devtools } from 'zustand/middleware';
import { roundToNearest } from '@/utils/math';

export type ComponentType =
  | 'fade'
  | 'flyto'
  | 'timepanel'
  | 'settime'
  | 'setfocus'
  | 'setanchor'
  | 'richtext'
  | 'title'
  | 'video'
  | 'image'
  | 'default';

interface ComponentBase {
  id: string;
  type: ComponentType;
  gui_name: string;
  gui_description: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FadeComponent extends ComponentBase {
  type: 'fade';
  property: string;
  intDuration: number;
  action: 'on' | 'off' | 'toggle';
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

// interface FlyToComponent extends Component {
//   type: 'flyto';
// }

export interface SetTimeComponent extends ComponentBase {
  type: 'settime';
  time: Date | string;
  intDuration: number;
  interpolate: boolean;
}
// interface SetFocusComponent extends Component {
//   type: 'setfocus';
// }
// interface SetAcnhorComponent extends Component {
//   type: 'setanchor';
// }

export type Component =
  | ComponentBase
  | FadeComponent
  | SetTimeComponent
  | RichTextComponent
  | TitleComponent
  | VideoComponent
  | ImageComponent;

interface State {
  components: Array<Component>;
  overlappedComponents: { [key: string]: string[] }; // Map component ID to list of overlapping component IDs
  selectedComponents: string[];
  addComponent: (component: Component) => void;
  updateComponent: (id: string, updates: Partial<Component>) => void;
  updateComponentPosition: (id: string, x: number, y: number) => void;
  removeComponent: (id: string) => void;
  removeAllComponents: () => void;
  selectComponent: (id: string) => void;
  deselectComponent: (id: string) => void;
  clearSelection: () => void;
  checkOverlap: (component: Component) => Component | null;
}

export const useStore = create<State>()(
  devtools(
    persist(
      immer((set, get) => ({
        components: [],
        overlappedComponents: {},
        selectedComponents: [],
        addComponent: (component) =>
          set(
            (state) => {
              state.components.push(component);
            },
            false,
            'component/add',
          ),
        updateComponent: (id, updates) =>
          set(
            (state) => {
              const component = state.components.find((comp) => comp.id === id);
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
              const component = state.components.find((comp) => comp.id === id);
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
              state.components = state.components.filter(
                (comp) => comp.id !== id,
              );
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
              state.components = [];
              state.overlappedComponents = {};
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

          for (const comp of state.components) {
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
