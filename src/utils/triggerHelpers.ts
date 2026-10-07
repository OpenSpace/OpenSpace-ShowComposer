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
 * TODO @ylvse (2026-09-23) - When moving to RTK this file will become actions. Therefore, the lua api access is kept here,
 * as it will be ok later on (although now it looks funky to have hook accesses in functions)
 */

/**
 * Fade a renderable's opacity in, out, or toggle it, over a duration.
 *
 * @param property - The `.Opacity` property URI of the renderable. The `.Opacity` suffix is
 * stripped before the fade functions are called.
 * @param intDuration - The fade duration in seconds.
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
  if (!property) {
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
      luaApi.toggleFade(property.replace('.Opacity', ''), intDuration);
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
  if (!property) {
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
 * Fire a trigger property.
 *
 * @param property - The trigger property URI.
 */
async function triggerTrigger(property: string) {
  const { luaApi } = useOpenSpaceApiStore.getState();
  if (!luaApi) {
    console.log('No Api Access');
    return;
  }
  if (!property) {
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
  if (!property) {
    return;
  }
  const { luaApi } = useOpenSpaceApiStore.getState();
  luaApi?.setPropertyValueSingle(property, newValue);
}

/**
 * Apply a navigation (camera) state, either instantly or with a transition (fade or fly).
 *
 * @param navigationState - The target navigation state.
 * @param setTime - Whether to also set the simulation time to the state's timestamp. When false,
 * the timestamp is stripped for the `fade` and `fly` modes.
 * @param mode - `jump` applies the state instantly, `fade` fades out/in over `fadeTime`, `fly`
 * flies the camera there.
 * @param fadeTime - The transition duration in seconds.
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
      luaApi.navigation.jumpToNavigationState(navState, false, fadeTime);
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
 * Fly the camera to a target. Can either fly to a scene node, or to a geographic coordinate.
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
 * Focus the camera on a scene graph node.
 *
 * @param property - The scene graph node identifier to focus on.
 */
function triggerFocus(property: string) {
  const { luaApi } = useOpenSpaceApiStore.getState();
  if (!luaApi) {
    console.log('No Api Access');
    return;
  }
  if (!property) {
    return;
  }
  luaApi.setPropertyValueSingle(RetargetAnchorKey, null);
  luaApi.setPropertyValueSingle(NavigationAnchorKey, property);
  luaApi.setPropertyValueSingle(NavigationAimKey, '');
}

/**
 * Toggle session-recording playback: if the recording state is idle, start playing the
 * given file when idle. If the recording state is not idle, stop the running playback.
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
 * Trigger an action.
 *
 * @param identifier - The identifier of the action to trigger.
 */
function triggerAction(identifier: string) {
  useOpenSpaceApiStore.getState().luaApi?.action.triggerAction(identifier);
}

/**
 * Execute a Lua script.
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
