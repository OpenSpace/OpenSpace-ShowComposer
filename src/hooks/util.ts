import { useOpenSpaceApiStore } from '@/store/apiStore';
import { ConnectionStatus } from '@/types/enums';

// Hooks that have the same interface as in WebGui but uses Zustand underneath

export function useConnectionStatus(): ConnectionStatus {
  return useOpenSpaceApiStore((state) => state.connectionStatus);
}

export function useIsConnectionStatus(status: ConnectionStatus): boolean {
  return useOpenSpaceApiStore((state) => state.connectionStatus === status);
}

export function useIsConnected(): boolean {
  return useIsConnectionStatus(ConnectionStatus.Connected);
}
