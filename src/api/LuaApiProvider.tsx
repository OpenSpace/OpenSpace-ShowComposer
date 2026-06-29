import { PropsWithChildren, useEffect } from 'react';

import { useOpenSpaceApiStore } from '@/store/apiStore';

import { LuaApiContext } from './LuaApiContext';

// Same interface as OpenSpace-WebGui's LuaApiProvider, but works differently underneath
export function LuaApiProvider({ children }: PropsWithChildren) {
  const luaApi = useOpenSpaceApiStore((state) => state.luaApi);
  const connect = useOpenSpaceApiStore((state) => state.connect);

  // Connect to OpenSpace on mount. The apiStore handles disconnects and reconnects,
  // and it is safe to call connect unnecessarily (store will ignore)
  useEffect(() => {
    connect();
  }, [connect]);

  return <LuaApiContext.Provider value={luaApi}>{children}</LuaApiContext.Provider>;
}
