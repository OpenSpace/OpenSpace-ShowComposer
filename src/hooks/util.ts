import { useOpenSpaceApiStore } from '@/store/apiStore';
import { ConnectionStatus } from '@/types/enums';

// WebGui-shaped connection-status hooks, thin selectors over the Zustand apiStore.
// Mirrors OpenSpace-WebGui's hooks/util useIsConnectionStatus / connection helpers.

export function useConnectionStatus(): ConnectionStatus {
  return useOpenSpaceApiStore((state) => state.connectionStatus);
}

export function useIsConnectionStatus(status: ConnectionStatus): boolean {
  return useOpenSpaceApiStore((state) => state.connectionStatus === status);
}

export function useIsConnected(): boolean {
  return useIsConnectionStatus(ConnectionStatus.Connected);
}
