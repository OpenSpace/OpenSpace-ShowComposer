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

  console.log('triggerFade', property, intDuration, action);
  switch (action) {
    case 'on':
      luaApi.setPropertyValueSingle(property, 1.0, intDuration);
      break;
    case 'off':
      luaApi.setPropertyValueSingle(property, 0.0, intDuration);
      break;
    case 'toggle':
      const value = await luaApi.getPropertyValue(property);
      console.log('toggle', value[1] < 0.5 ? 1.0 : 0.0);
      luaApi.setPropertyValueSingle(
        property,
        value[1] < 0.5 ? 1.0 : 0.0,
        intDuration,
      );
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
  if (!luaApi) {
    console.log('No Api Access');
    return;
  } // const propertyValue = await usePropertyStore.getState().properties[property];
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
