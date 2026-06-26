import { ConnectionState, useOpenSpaceApiStore } from '@/store/apiStore';

// WebGui-shaped connection-status hooks, thin selectors over the Zustand apiStore.
// Mirrors OpenSpace-WebGui's hooks/util useIsConnectionStatus / connection helpers.

export function useConnectionState(): ConnectionState {
  return useOpenSpaceApiStore((state) => state.connectionState);
}

export function useIsConnectionState(status: ConnectionState): boolean {
  return useOpenSpaceApiStore((state) => state.connectionState === status);
}

export function useIsConnected(): boolean {
  return useIsConnectionState(ConnectionState.CONNECTED);
}
