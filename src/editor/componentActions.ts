import { useBoundStore } from '@/store/boundStore';
import { Component, ComponentFor } from '@/types/components';
import { jumpToTime } from '@/utils/time';
import {
  jumpToNavState,
  sendLuaScript,
  togglePlayback,
  triggerAction,
  triggerBool,
  triggerFade,
  triggerFlyTo,
  triggerFocus,
  triggerNumber,
  triggerTrigger
} from '@/utils/triggerHelpers';

// These are the actions that can be triggered by a component. Each action is a function
// that takes a component and returns a function. This is so that the function can be called with
// the component's data when the action is triggered. The returned function is what actually triggers the action.
// The component types that trigger an action when fired.
type ActionKey =
  | 'fade'
  | 'flyto'
  | 'setfocus'
  | 'settime'
  | 'setnavstate'
  | 'action'
  | 'script'
  | 'sessionplayback'
  | 'page'
  | 'boolean'
  | 'trigger'
  | 'number';

// Each action's component type is derived from the shared `ComponentFor` map. Click-triggers
// return () => void; `number` returns a value-setter (the slider value).
export type ComponentActions = {
  [K in ActionKey]: (
    c: ComponentFor[K]
  ) => K extends 'number' ? (value: number) => void : () => void;
};

export const componentActions: ComponentActions = {
  fade: (c) => () => triggerFade(c.property, c.intDuration, c.action),
  flyto: (c) => () => triggerFlyTo(c),
  setfocus: (c) => () => triggerFocus(c.property),
  settime: (c) => () =>
    jumpToTime(new Date(c.time), c.interpolate, c.intDuration, c.fadeScene),
  setnavstate: (c) => () =>
    jumpToNavState(c.navigationState, c.setTime, c.mode, c.intDuration),
  action: (c) => () => triggerAction(c.action),
  script: (c) => () => sendLuaScript(c.script),
  sessionplayback: (c) => () => togglePlayback(c.file, c.loop),
  page: (c) => () => useBoundStore.getState().goToPage(c.page - 1),
  boolean: (c) => () => triggerBool(c.property, c.action),
  trigger: (c) => () => triggerTrigger(c.property),
  number: (c) => (value) => triggerNumber(c.property, value)
};

// We need this helper function to be able to call the action of a component without knowing its
// type at compile time. This is because the component's type is only known at runtime, and TypeScript
// needs to know the type of the component in order to call the correct action function.
// This function is only used by the multi component.
export function runComponentAction(component: Component): void {
  const createHandler = componentActions[component.type as keyof ComponentActions] as
    | ((c: Component) => () => void)
    | undefined;
  if (!createHandler) {
    console.warn(`Failed to find action handler for component type: ${component.type}`);
    return;
  }
  // Create the function that will trigger the action.
  const handler = createHandler(component);
  if (!handler) {
    console.warn(`Failed to create action handler for component type: ${component.type}`);
    return;
  }
  // Trigger the action. This will execute the action associated with the component.
  handler();
}
