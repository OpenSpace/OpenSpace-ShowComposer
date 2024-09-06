import { useOpenSpaceApiStore } from '@/store';

const triggerFade = async (
  property: string,
  intDuration: number,
  action: 'on' | 'off' | 'toggle',
) => {
  const luaApi = useOpenSpaceApiStore.getState().luaApi;
  if (!luaApi) {
    console.log('No Api Access');
    return;
  }

  // console.log('triggerFade', property, intDuration, action);
  switch (action) {
    case 'on':
      luaApi.fadeIn(property.replace('.Fade', ''), intDuration);

      // luaApi.setPropertyValueSingle(property, 1.0, intDuration);
      break;
    case 'off':
      luaApi.fadeOut(property.replace('.Fade', ''), intDuration);
      // luaApi.setPropertyValueSingle(property, 0.0, intDuration);
      break;
    case 'toggle':
      luaApi.toggleFade(property.replace('.Fade', ''), intDuration);
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

const triggerBool = async (
  property: string,
  action: 'on' | 'off' | 'toggle',
) => {
  const luaApi = useOpenSpaceApiStore.getState().luaApi;
  if (!luaApi) {
    console.log('No Api Access');
    return;
  } // const propertyValue = usePropertyStore.getState().properties[property];
  // console.log('triggerBool', property, action);
  switch (action) {
    case 'on':
      luaApi.setPropertyValueSingle(property, true);
      break;
    case 'off':
      luaApi.setPropertyValueSingle(property, false);
      break;
    case 'toggle': {
      const value = await luaApi.getPropertyValue(property);
      luaApi.setPropertyValueSingle(property, !value[1]);
      break;
    }
  }
};

const triggerTrigger = async (property: string) => {
  const luaApi = useOpenSpaceApiStore.getState().luaApi;
  if (!luaApi) {
    console.log('No Api Access');
    return;
  } // const propertyValue = await usePropertyStore.getState().properties[property];
  // const value = await luaApi.getPropertyValue(property);
  // console.log('triggerBool', property, value);
  luaApi.setPropertyValueSingle(property, true);
};

const triggerNumber = async (property: string, newValue: number) => {
  const luaApi = useOpenSpaceApiStore.getState().luaApi;
  // console.log('triggerNumber', property, newValue);
  luaApi.setPropertyValueSingle(property, newValue);
};
type NavigationState = {
  Anchor: string;
  Pitch: number;
  Position: [number, number, number];
  ReferenceFrame: string;
  Up: [number, number, number];
  Yaw: number;
};
async function jumpToNavState(
  navigationState: NavigationState,
  setTime: boolean,
  time: Date,
  fadeScene: boolean,
  fadeTime: number,
) {
  // console.log('jumpToNavState', navigationState);
  const luaApi = useOpenSpaceApiStore.getState().luaApi;
  if (!luaApi) {
    console.log('No Api Access');
    return;
  }

  if (fadeScene && fadeTime) {
    const promise = new Promise((resolve) => {
      luaApi.setPropertyValueSingle(
        'RenderEngine.BlackoutFactor',
        0,
        fadeTime / 2.0,
        'QuadraticEaseOut',
      );
      setTimeout(() => resolve('done!'), (fadeTime / 2.0) * 1000);
    });
    await promise;
    if (setTime) luaApi.time.setTime(time);
    luaApi.navigation.setNavigationState(navigationState);
    luaApi.setPropertyValueSingle(
      'RenderEngine.BlackoutFactor',
      1,
      fadeTime / 2.0,
      'QuadraticEaseIn',
    );
  } else {
    if (setTime) luaApi.time.setTime(time);
    await luaApi.navigation.setNavigationState(navigationState);
  }
}

export {
  triggerFade,
  triggerBool,
  triggerTrigger,
  triggerNumber,
  jumpToNavState,
};
