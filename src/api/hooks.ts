import { useContext } from 'react';

import { LuaApiContext } from './LuaApiContext';

export function useOpenSpaceApi() {
  return useContext(LuaApiContext);
}
