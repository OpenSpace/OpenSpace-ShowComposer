import { StateCreator } from 'zustand';

import { NavigationState } from '@/types/types';

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
  script: '#0ea5e9'
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
}

export interface FadeComponent extends ComponentBase {
  type: 'fade';
  property: string;
  intDuration: number;
  action: Toggle;
  backgroundImage: string;
}

export interface SetTimeComponent extends ComponentBase {
  type: 'settime';
  time: Date | string;
  intDuration: number;
  interpolate: boolean;
  fadeScene: boolean;
  backgroundImage: string;
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
}
export interface SetFocusComponent extends ComponentBase {
  type: 'setfocus';
  property: string;
  backgroundImage: string;
}

export interface ActionTriggerComponent extends ComponentBase {
  type: 'action';
  action: string;
  backgroundImage: string;
}

export interface BooleanComponent extends ComponentBase {
  type: 'boolean';
  property: string;
  action: Toggle;
  backgroundImage: string;
}
export interface NumberComponent extends ComponentBase {
  type: 'number';
  min: number;
  max: number;
  step: number;
  exponent: number;
  property: string;
  backgroundImage: string;
}
export interface TriggerComponent extends ComponentBase {
  type: 'trigger';
  property: string;
  backgroundImage: string;
}
export interface ScriptComponent extends ComponentBase {
  type: 'script';
  script: string;
  backgroundImage: string;
}

export interface PageComponent extends ComponentBase {
  type: 'page';
  page: number;
  backgroundImage: string;
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

// Maps each component `type` string to its concrete component interface. Panels / `default` have
// no dedicated widget/modal, so the base type suffices.
export type ComponentFor = {
  fade: FadeComponent;
  flyto: FlyToComponent;
  setfocus: SetFocusComponent;
  settime: SetTimeComponent;
  setnavstate: SetNavComponent;
  action: ActionTriggerComponent;
  script: ScriptComponent;
  sessionplayback: SessionPlaybackComponent;
  page: PageComponent;
  boolean: BooleanComponent;
  number: NumberComponent;
  trigger: TriggerComponent;
  multi: MultiComponent;
  richtext: RichTextComponent;
  title: TitleComponent;
  video: VideoComponent;
  image: ImageComponent;
  timepanel: ComponentBase;
  navpanel: ComponentBase;
  statuspanel: ComponentBase;
  recordpanel: ComponentBase;
  logpanel: ComponentBase;
  default: ComponentBase;
};

export type ImmerStateCreator<T, TBase> = StateCreator<
  T,
  [['zustand/immer', never], never],
  [],
  TBase
>;
