import { useOpenSpaceApiStore } from '@/store';
import {
  NavigationAimKey,
  NavigationAnchorKey,
  RetargetAnchorKey
} from '@/store/apiStore';
import { usePropertyStore } from '@/store/propertyStore';
import { FlyToComponent } from '@/types/components';
import { RecordingState } from '@/types/enums';
import { NavigationState, RecordingsFolderKey } from '@/types/types';

/**
 * When moving to RTK this file will become actions. Therefore, the lua api access is kept here,
 * as it will be ok later on (although now it looks funky to have hook accesses in functions)
 */

/**
 * Fade a renderable's opacity in, out, or toggle it, over a duration.
 *
 * @param property - The `.Opacity` property URI of the renderable. The `.Opacity` suffix is
 * stripped before the fade functions are called.
 * @param intDuration - The fade duration in seconds. Halved for the `toggle` action.
 * @param action - Whether to fade `on`, `off`, or `toggle` the current fade state.
 */
async function triggerFade(
  property: string,
  intDuration: number,
  action: 'on' | 'off' | 'toggle'
) {
  const { luaApi } = useOpenSpaceApiStore.getState();
  if (!luaApi) {
    console.log('No Api Access');
    return;
  }

  switch (action) {
    case 'on':
      luaApi.fadeIn(property.replace('.Opacity', ''), intDuration);
      break;
    case 'off':
      luaApi.fadeOut(property.replace('.Opacity', ''), intDuration);
      break;
    case 'toggle':
      luaApi.toggleFade(property.replace('.Opacity', ''), intDuration / 2.0);
      break;
    default:
      break;
  }
}

/**
 * Set a boolean property to true/false, or invert its current value.
 *
 * @param property - The boolean property URI.
 * @param action - `on` sets true, `off` sets false, `toggle` inverts the current value.
 */
async function triggerBool(property: string, action: 'on' | 'off' | 'toggle') {
  const { luaApi } = useOpenSpaceApiStore.getState();
  if (!luaApi) {
    console.log('No Api Access');
    return;
  }
  switch (action) {
    case 'on':
      luaApi.setPropertyValueSingle(property, true);
      break;
    case 'off':
      luaApi.setPropertyValueSingle(property, false);
      break;
    case 'toggle': {
      luaApi.invertBooleanProperty(property);
      break;
    }
    default:
      break;
  }
}

/**
 * Fire a trigger property - a valueless property that runs its action when set.
 *
 * @param property - The trigger property URI.
 */
async function triggerTrigger(property: string) {
  const { luaApi } = useOpenSpaceApiStore.getState();
  if (!luaApi) {
    console.log('No Api Access');
    return;
  }
  luaApi.setPropertyValueSingle(property, null);
}

/**
 * Set a numeric property to a new value.
 *
 * @param property - The numeric property URI.
 * @param newValue - The value to set.
 */
async function triggerNumber(property: string, newValue: number) {
  const { luaApi } = useOpenSpaceApiStore.getState();
  luaApi?.setPropertyValueSingle(property, newValue);
}

/**
 * Apply a navigation (camera) state, either instantly or with a transition.
 *
 * @param navigationState - The target navigation state.
 * @param setTime - Whether to also set the simulation time to the state's timestamp. When false,
 * the timestamp is stripped for the `fade` and `fly` modes.
 * @param mode - `jump` applies the state instantly, `fade` fades out/in over `fadeTime`, `fly`
 * flies the camera there.
 * @param fadeTime - The transition duration in seconds (halved for the `fade` mode).
 */
async function jumpToNavState(
  navigationState: NavigationState,
  setTime: boolean,
  mode: 'jump' | 'fade' | 'fly',
  fadeTime: number
) {
  const { luaApi } = useOpenSpaceApiStore.getState();
  if (!luaApi) {
    console.log('No Api Access');
    return;
  }

  const navState = {
    ...navigationState
  };
  switch (mode) {
    case 'jump':
      luaApi.navigation.setNavigationState(navigationState, setTime);
      break;
    case 'fade':
      if (!setTime) {
        delete navState.Timestamp;
      }
      luaApi.navigation.jumpToNavigationState(navState, false, fadeTime / 2.0);
      break;
    case 'fly':
      if (!setTime) {
        delete navState.Timestamp;
      }
      luaApi.navigation.flyToNavigationState(navState, fadeTime);
      break;
    default:
      break;
  }
}

/**
 * Fly the camera to a target. Uses geographic coordinates when the component's `geo` flag is set,
 * otherwise a plain fly-to. No-ops when the target (or, for a geo flight, any coordinate) is
 * missing.
 *
 * @param component - The fly-to component holding the target, coordinates and duration.
 */
function triggerFlyTo(component: FlyToComponent) {
  const { luaApi } = useOpenSpaceApiStore.getState();
  if (!luaApi) {
    console.log('No Api Access');
    return;
  }
  const { target, geo, lat, long, alt, intDuration } = component;
  if (!target) {
    return;
  }
  if (geo) {
    if (lat === undefined || long === undefined || alt === undefined) {
      return;
    }
    luaApi.navigation.flyToGeo(target, lat, long, alt, intDuration);
  } else {
    luaApi.navigation.flyTo(target, intDuration);
  }
}

/**
 * Retarget the camera anchor onto a scene node, clearing any retarget-in-progress and aim.
 *
 * @param property - The scene node identifier to focus.
 */
function triggerFocus(property: string) {
  const { luaApi } = useOpenSpaceApiStore.getState();
  if (!luaApi) {
    console.log('No Api Access');
    return;
  }
  luaApi.setPropertyValueSingle(RetargetAnchorKey, null);
  luaApi.setPropertyValueSingle(NavigationAnchorKey, property);
  luaApi.setPropertyValueSingle(NavigationAimKey, '');
}

/**
 * Toggle session-recording playback: start playing the given file when idle, otherwise stop the
 * running playback.
 *
 * @param file - The recording filename, resolved relative to the recordings folder.
 * @param loop - Whether the playback should loop.
 */
async function togglePlayback(file: string, loop: boolean) {
  const { luaApi } = useOpenSpaceApiStore.getState();
  if (!luaApi) {
    console.log('No Api Access');
    return;
  }
  const recordingState =
    usePropertyStore.getState().sessionRecording.state || RecordingState.Idle;
  if (recordingState === RecordingState.Idle) {
    const path = await luaApi.absPath(`${RecordingsFolderKey}${file}`);
    luaApi.sessionRecording.startPlayback(path, loop);
  } else {
    luaApi.sessionRecording.stopPlayback();
  }
}

/**
 * Trigger a named OpenSpace action.
 *
 * @param actionName - The identifier of the action to trigger.
 */
function triggerAction(actionName: string) {
  useOpenSpaceApiStore.getState().luaApi?.action.triggerAction(actionName);
}

/**
 * Execute a raw Lua script in OpenSpace.
 *
 * @param script - The Lua source to execute.
 */
function sendLuaScript(script: string) {
  useOpenSpaceApiStore.getState().apiInstance?.executeLuaScript(script, false, false);
}

export {
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
};
