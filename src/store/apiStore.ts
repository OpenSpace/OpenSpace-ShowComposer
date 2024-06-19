import { create } from 'zustand';
export enum ConnectionState {
  UNCONNECTED,
  CONNECTING,
  CONNECTED,
  DISCONNECTED,
}
import OpenSpaceApi, {
  OpenSpaceApi as OSApiClass,
  Topic,
} from 'openspace-api-js';

interface OpenSpaceApiState {
  apiInstance: null | OSApiClass; // Consider using a more specific type if possible
  luaApi: any; // Consider using a more specific type if possible
  error: string | null;
  connectionState: ConnectionState;
  connect: (host: string, port: number) => void;
  disconnect: () => void;
  setLuaApi: (luaApi: any) => void;
  setError: (error: string) => void;
  setConnectionState: (state: ConnectionState) => void;
  subscribeToProperty: (property: string) => Topic | null; // Define parameters as needed
  unsubscribeFromProperty: (topic: Topic) => void; // Define parameters as needed
  subscribeToTopic: (topic: string) => Topic | null; // Define parameters as needed
  unsubscribeFromTopic: (topic: Topic) => void; // Define parameters as needed
}

export const useOpenSpaceApiStore = create<OpenSpaceApiState>()((set, get) => ({
  apiInstance: null,
  luaApi: null,
  error: null,
  connectionState: ConnectionState.UNCONNECTED,
  setLuaApi: (luaApi) => set(() => ({ luaApi })),
  setError: (error) => set(() => ({ error })),
  setConnectionState: (connectionState) => set(() => ({ connectionState })),
  connect: async (host: string, port: number) => {
    const apiInstance = OpenSpaceApi(host, port);
    set({ apiInstance, connectionState: ConnectionState.CONNECTING });
    apiInstance.onConnect(async () => {
      try {
        console.log('OpenSpace connected');
        const luaApi = await apiInstance.library();
        set({ luaApi, connectionState: ConnectionState.CONNECTED });
      } catch (e) {
        console.error('OpenSpace library could not be loaded:', e);
        set({
          error: 'OpenSpace library could not be loaded',
          connectionState: ConnectionState.UNCONNECTED,
        });
      }
    });
    apiInstance.onDisconnect(() => {
      set({
        apiInstance: null,
        luaApi: null,
        connectionState: ConnectionState.UNCONNECTED,
      });
      let reconnectionInterval = 1000;
      setTimeout(() => {
        apiInstance.connect();
        reconnectionInterval += 1000;
      }, reconnectionInterval);
    });
    apiInstance.connect();
  },
  disconnect: () => {
    const { apiInstance } = get();
    if (apiInstance) {
      apiInstance.disconnect();
    }
  },
  subscribeToProperty: (propertyName: string) => {
    const { connectionState, apiInstance } = get();
    if (!apiInstance || connectionState != ConnectionState.CONNECTED)
      return null;
    const subscription = apiInstance.subscribeToProperty(propertyName);
    return subscription;
  },
  unsubscribeFromProperty: (subscription: Topic) => {
    const { connectionState, apiInstance } = get();
    if (!apiInstance || connectionState != ConnectionState.CONNECTED) return;
    subscription.talk({
      event: 'stop_subscription',
    });
    subscription.cancel();
  },
  subscribeToTopic: (topicName: string) => {
    const { connectionState, apiInstance } = get();
    if (!apiInstance || connectionState != ConnectionState.CONNECTED)
      return null;
    const topic = apiInstance.startTopic(topicName, {
      event: 'start_subscription',
    });
    return topic;
  },
  unsubscribeFromTopic: (topic: Topic) => {
    const { connectionState, apiInstance } = get();
    if (!apiInstance || connectionState != ConnectionState.CONNECTED) return;
    console.log(topic);
    topic.talk({
      event: 'stop_subscription',
    });
    topic.cancel();
  },
}));
