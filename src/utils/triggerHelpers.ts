import { useOpenSpaceApiStore, usePropertyStore } from '@/store';

const triggerFade = async (
  property: string,
  intDuration: number,
  action: 'on' | 'off' | 'toggle',
) => {
  const luaApi = useOpenSpaceApiStore.getState().luaApi;
  console.log(property);
  //   console.log(luaApi);
  const propertyValue = usePropertyStore.getState().properties[property];
  console.log(propertyValue);
  //   let alsoProValue = await luaApi.getPropertyValue(property);
  //   console.log(alsoProValue);

  console.log('triggerFade', property, intDuration, action);
  switch (action) {
    case 'on':
      luaApi.setPropertyValueSingle(property, 1.0, intDuration);
      break;
    case 'off':
      luaApi.setPropertyValueSingle(property, 0.0, intDuration);
      break;
    case 'toggle':
      //   if (propertyValue?.value) {
      //     console.log('toggle', propertyValue.value === 0 ? 1.0 : 0.0);
      //     luaApi.setPropertyValueSingle(
      //       property,
      //       propertyValue.value === 0 ? 1.0 : 0.0,
      //       intDuration,
      //     );
      //   } else {
      const value = await luaApi.getPropertyValue(property);
      console.log('toggle', value[1] === 0 ? 1.0 : 0.0);
      luaApi.setPropertyValueSingle(
        property,
        value[1] === 0 ? 1.0 : 0.0,
        intDuration,
      );
      //   }
      break;
  }

  //   luaApi.setPropertyValueSingle(property, 1.0, fadeDuration);
  //   / let isEnabled = false;
  //     const returnValue = await openspace.getPropertyValue("Scene." + object + "Trail.Renderable.Enabled");
  //     if (returnValue) {
  //       isEnabled = returnValue[1];
  //     }
  //     if (!isEnabled) {
  //       openspace.setPropertyValue("Scene." + object + "Trail.Renderable.Opacity", 0)
  //       openspace.setPropertyValue("Scene." + object + "Trail.Renderable.Enabled", true)
  //     }
  //     openspace.setPropertyValue("Scene." + object + "Trail.Renderable.Opacity", 1, 1)
};

const triggerBool = async (
  property: string,
  action: 'on' | 'off' | 'toggle',
) => {
  const luaApi = useOpenSpaceApiStore.getState().luaApi;
  // const propertyValue = usePropertyStore.getState().properties[property];
  console.log('triggerBool', property, action);
  switch (action) {
    case 'on':
      luaApi.setPropertyValueSingle(property, 1.0);
      break;
    case 'off':
      luaApi.setPropertyValueSingle(property, 0.0);
      break;
    case 'toggle':
      const value = await luaApi.getPropertyValue(property);
      console.log('toggle', value[1]);
      luaApi.setPropertyValueSingle(property, !value[1]);
      break;
  }
};

const triggerTrigger = async (property: string) => {
  const luaApi = useOpenSpaceApiStore.getState().luaApi;
  // const propertyValue = await usePropertyStore.getState().properties[property];
  const value = await luaApi.getPropertyValue(property);

  console.log('triggerBool', property, value);
  luaApi.setPropertyValueSingle(property, true);
};

const triggerNumber = async (property: string, newValue: number) => {
  const luaApi = useOpenSpaceApiStore.getState().luaApi;
  console.log('triggerNumber', property, newValue);
  luaApi.setPropertyValueSingle(property, newValue);
};
export { triggerFade, triggerBool, triggerTrigger, triggerNumber };
