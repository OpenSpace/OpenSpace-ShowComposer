import { useOpenSpaceApiStore } from '@/store';
import { NavigationState } from '@/types/types';

const triggerFade = async (
  property: string,
  intDuration: number,
  action: 'on' | 'off' | 'toggle'
) => {
  const { luaApi } = useOpenSpaceApiStore.getState();
  if (!luaApi) {
    console.log('No Api Access');
    return;
  }

  // console.log('triggerFade', property, intDuration, action);
  switch (action) {
    case 'on':
      luaApi.fadeIn(property.replace('.Opacity', ''), intDuration);

      // luaApi.setPropertyValueSingle(property, 1.0, intDuration);
      break;
    case 'off':
      luaApi.fadeOut(property.replace('.Opacity', ''), intDuration);
      // luaApi.setPropertyValueSingle(property, 0.0, intDuration);
      break;
    case 'toggle':
      luaApi.toggleFade(property.replace('.Opacity', ''), intDuration / 2.0);
      // const value = await luaApi.getPropertyValue(property);
      // console.log('toggle', value[1] < 0.5 ? 1.0 : 0.0);
      // luaApi.setPropertyValueSingle(
      //   property,
      //   value[1] < 0.5 ? 1.0 : 0.0,
      //   intDuration,
      // );
      break;
  }
};

const triggerBool = async (property: string, action: 'on' | 'off' | 'toggle') => {
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
  }
};

const triggerTrigger = async (property: string) => {
  const { luaApi } = useOpenSpaceApiStore.getState();
  if (!luaApi) {
    console.log('No Api Access');
    return;
  }
  luaApi.setPropertyValueSingle(property, null);
};

const triggerNumber = async (property: string, newValue: number) => {
  const { luaApi } = useOpenSpaceApiStore.getState();
  // console.log('triggerNumber', property, newValue);
  luaApi?.setPropertyValueSingle(property, newValue);
};

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
  }
}

const triggerAction = (actionName: string) => {
  useOpenSpaceApiStore.getState().luaApi?.action.triggerAction(actionName);
};

const sendLuaScript = (script: string) => {
  useOpenSpaceApiStore.getState().apiInstance?.executeLuaScript(script, false, false);
};

export {
  jumpToNavState,
  sendLuaScript,
  triggerAction,
  triggerBool,
  triggerFade,
  triggerNumber,
  triggerTrigger
};
