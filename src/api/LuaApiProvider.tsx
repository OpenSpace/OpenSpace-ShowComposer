import { PropsWithChildren, useEffect } from 'react';

import { ConnectionState, useOpenSpaceApiStore } from '@/store/apiStore';

import { LuaApiContext } from './LuaApiContext';

// Mirrors OpenSpace-WebGui's api/LuaApiProvider, but works differently underneath. WebGui
// opens one fixed connection from window env vars; in ShowComposer the user can change the
// host/port at runtime (and we auto-reconnect), so this provider doesn't open a socket
// itself — it lets the apiStore handle connecting and just shares its luaApi through context.
export function LuaApiProvider({ children }: PropsWithChildren) {
  const luaApi = useOpenSpaceApiStore((state) => state.luaApi);
  const connectionState = useOpenSpaceApiStore((state) => state.connectionState);
  const connect = useOpenSpaceApiStore((state) => state.connect);

  // Open the connection when we mount, and open it again if it ever drops. This is the
  // only place we start the connection. Calling connect() while we're already connected
  // (or connecting) does nothing, so re-running this after a drop is harmless.
  useEffect(() => {
    if (connectionState === ConnectionState.UNCONNECTED) {
      connect();
    }
  }, [connectionState, connect]);

  return <LuaApiContext.Provider value={luaApi}>{children}</LuaApiContext.Provider>;
}
