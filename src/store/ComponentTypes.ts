import { NavigationState } from '@/types/types';
import { StateCreator } from 'zustand';

export type LayoutType = 'row' | 'column' | 'grid';

export type ComponentType =
  | 'script'
  | 'fade'
  | 'flyto'
  | 'statuspanel'
  | 'timepanel'
  | 'navpanel'
  | 'recordpanel'
  | 'logpanel'
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
  | 'multi'
  | 'action';

export type Toggle = 'on' | 'off' | 'toggle';
export type MultiState = 'false' | 'pendingDelete' | 'pendingSave' | 'true';

export type Page = {
  components: Array<ComponentBase['id']>;
  id: string;
  x: number;
  y: number;
  name?: string;
  color?: string;
};

export interface ComponentBase {
  id: string;
  parentPage?: Page['id'];
  parentLayout?: LayoutBase['id'];
  isMulti: MultiState;
  type: ComponentType;
  lockName?: boolean;
  gui_name: string;
  gui_description: string;
  isDisabled: boolean;
  color?: string;
}

export const ComponentBaseColors = {
  multi: '#6366f1',
  action: '#737373',
  page: '#64748b37',
  default: '#64748b',
  boolean: '#f43f5e',
  number: '#ec4899',
  trigger: '#a855f7',
  richtext: '#3b82f6',
  title: '#0ea5e9',
  video: '#06b6d4',
  image: '#14b8a6',
  fade: '#10b981',
  setfocus: '#22c55e',
  setnavstate: '#84cc16',
  flyto: '#f59e0b',
  settime: '#f97316',
  sessionplayback: '#ef4444',
  script: '#0ea5e9',
};

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
export interface LogComponent extends ComponentBase {
  type: 'logpanel';
}
export interface RichTextComponent extends ComponentBase {
  type: 'richtext';
  text: string;
}

export interface TitleComponent extends ComponentBase {
  type: 'title';
  text: string;
  setFromPageTitle: boolean;
}
export interface VideoComponent extends ComponentBase {
  type: 'video';
  url: string;
}

export interface ImageComponent extends ComponentBase {
  type: 'image';
  backgroundImage: string;
}

export interface SessionPlaybackComponent extends ComponentBase {
  type: 'sessionplayback';
  file: string;
  loop: boolean;
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
  navigationState: NavigationState;
  time: Date | string;
  setTime: boolean;
  // fadeScene: boolean;
  mode: 'jump' | 'fade' | 'fly';
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

export interface ActionTriggerComponent extends ComponentBase {
  type: 'action';
  action: string;
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
export interface ScriptComponent extends ComponentBase {
  type: 'script';
  script: string;
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
  parentPage?: Page['id'];
  type: LayoutType;
  rows: number;
  columns: number;
  children: (string | null)[]; // Array of component IDs
  padding: number;
  childWidth: number;
  childHeight: number;
  persistent: boolean; //if layout should persist across pages
}

export type MultiOption =
  | TriggerComponent
  | BooleanComponent
  | FadeComponent
  | SetFocusComponent
  | FlyToComponent
  | SetTimeComponent
  | SessionPlaybackComponent
  | PageComponent
  | ActionTriggerComponent
  | ScriptComponent;

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
  { value: 'action', label: 'Trigger Action' },
  { value: 'script', label: 'Lua Script' },
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
  { value: 'action', label: 'Trigger Action' },
  { value: 'page', label: 'Go To Page' },
  { value: 'script', label: 'Lua Script' },
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
    option.type === 'action' ||
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
  | ActionTriggerComponent
  | MultiComponent
  | ScriptComponent;

export type ImmerStateCreator<T, TBase> = StateCreator<
  T,
  [['zustand/immer', never], never],
  [],
  TBase
>;
