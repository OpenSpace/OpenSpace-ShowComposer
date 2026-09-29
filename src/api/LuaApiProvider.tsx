import { PropsWithChildren, useEffect } from 'react';

import { useOpenSpaceApiStore } from '@/store/apiStore';

import { LuaApiContext } from './LuaApiContext';

export function LuaApiProvider({ children }: PropsWithChildren) {
  const luaApi = useOpenSpaceApiStore((state) => state.luaApi);
  const connect = useOpenSpaceApiStore((state) => state.connect);

  useEffect(() => {
    connect();
  }, [connect]);

  return <LuaApiContext.Provider value={luaApi}>{children}</LuaApiContext.Provider>;
}
