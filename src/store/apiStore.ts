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

import { usePropertyStore } from './propertyStore';

import {
  PropertyOwner,
  Property,
  findFavorites,
  flattenPropertyTree,
  getActionSceneNodes,
  getRenderables,
} from '@/utils/apiHelpers';
import { useSettingsStore } from './settingsStore';

export const rootOwnerKey = '__rootOwner';
export const NavigationAnchorKey = 'NavigationHandler.OrbitalNavigator.Anchor';
export const NavigationAimKey = 'NavigationHandler.OrbitalNavigator.Aim';
export const RetargetAnchorKey =
  'NavigationHandler.OrbitalNavigator.RetargetAnchor';
export const RetargetAimKey = 'NavigationHandler.OrbitalNavigator.RetargetAim';
export const RotationalFrictionKey =
  'NavigationHandler.OrbitalNavigator.Friction.RotationalFriction';
export const ZoomFrictionKey =
  'NavigationHandler.OrbitalNavigator.Friction.ZoomFriction';
export const RollFrictionKey =
  'NavigationHandler.OrbitalNavigator.Friction.RollFriction';

// OpenSpace engine
export const EngineModeSessionRecordingPlayback = 'session_recording_playback';
export const EnginePropertyVisibilityKey = 'OpenSpaceEngine.PropertyVisibility';
export const EngineFadeDurationKey = 'OpenSpaceEngine.FadeDuration';

interface OpenSpaceApiState {
  apiInstance: null | OSApiClass; // Consider using a more specific type if possible
  luaApi: any; // Consider using a more specific type if possible
  error: string | null;
  connectionState: ConnectionState;
  cancelReconnect: boolean;
  // reconnectTimeout: NodeJS.Timeout | null;
  connect: () => void;
  disconnect: () => void;
  forceRefresh: () => void;
  setLuaApi: (luaApi: any) => void;
  setError: (error: string) => void;
  setConnectionState: (state: ConnectionState) => void;
  subscribeToProperty: (property: string) => Topic | null; // Define parameters as needed
  unsubscribeFromProperty: (topic: Topic) => void; // Define parameters as needed
  subscribeToTopic: (topic: string, properties?: string[]) => Topic | null; // Define parameters as needed
  unsubscribeFromTopic: (topic: Topic) => void; // Define parameters as needed
  connectToTopic: (topic: string) => Topic | null; // Define parameters as needed
  // subscribeToSessionRecording: () => Topic | null;
  // unsubscribeFromSessionRecording: (topic: Topic) => void;
}

let reconnectTimeout: NodeJS.Timeout | null;

export const useOpenSpaceApiStore = create<OpenSpaceApiState>()((set, get) => ({
  apiInstance: null,
  luaApi: null,
  error: null,
  cancelReconnect: false,
  // reconnectTimeout: null,
  connectionState: ConnectionState.UNCONNECTED,
  setLuaApi: (luaApi) => set(() => ({ luaApi })),
  setError: (error) => set(() => ({ error })),
  setConnectionState: (connectionState) => set(() => ({ connectionState })),
  forceRefresh: () => {
    const { apiInstance } = get();
    if (apiInstance) {
      set({ cancelReconnect: true });
      apiInstance.disconnect();
    }
    if (reconnectTimeout || get().cancelReconnect) {
      clearTimeout(reconnectTimeout as NodeJS.Timeout);
    }
    get().connect();
  },
  connect: async () => {
    const host = useSettingsStore.getState().ip;
    const port = useSettingsStore.getState().port;

    const apiInstance = OpenSpaceApi(host, parseInt(port));
    set({
      apiInstance,
      connectionState: ConnectionState.CONNECTING,
      cancelReconnect: false,
    });
    apiInstance.onConnect(async () => {
      try {
        console.log('OpenSpace connected');
        const luaApi = await apiInstance.library();
        set({ luaApi, connectionState: ConnectionState.CONNECTED });
        const value = await apiInstance.getProperty(rootOwnerKey);

        const {
          propertyOwners,
          properties,
        }: { propertyOwners: PropertyOwner[]; properties: PropertyOwner[] } =
          flattenPropertyTree(value as PropertyOwner);
        // console.log(properties);
        // console.log(
        //   properties.find((p) => p.uri === 'Scene.Earth.Renderable.Opacity'),
        // );

        const Visibility = properties.find(
          (p) => p.uri === EnginePropertyVisibilityKey,
        );
        const FadeDuration = properties.find(
          (p) => p.uri === EngineFadeDurationKey,
        );
        // console.log(Visibility);
        // console.log(FadeDuration);

        let initData: Record<string, any> = {};
        initData[EngineFadeDurationKey as string] = FadeDuration;
        initData[EnginePropertyVisibilityKey as string] = Visibility;

        // console.log(properties);
        usePropertyStore.getState().setProperties(initData);

        const favorites = findFavorites(propertyOwners);
        usePropertyStore.getState().setFavorites(favorites);
        // // console.log(favorites);

        const fadeables: Record<string, any> = getRenderables(
          properties as Property[],
          'Fadable',
        );
        // console.log(fadeables);
        usePropertyStore.getState().setProperties(fadeables);

        const boolProps = getActionSceneNodes(properties as Property[], 'Bool');
        // console.log(boolProps);
        usePropertyStore.getState().setProperties(boolProps);
        const triggerProps = getActionSceneNodes(
          properties as Property[],
          'Trigger',
        );
        // console.log(triggerProps);
        usePropertyStore.getState().setProperties(triggerProps);
        const numberProps = getActionSceneNodes(
          properties as Property[],
          'Number',
        );
        // console.log(numberProps);
        usePropertyStore.getState().setProperties(numberProps);
      } catch (e) {
        console.error('OpenSpace library could not be loaded:', e);
        set({
          error: 'OpenSpace library could not be loaded',
          connectionState: ConnectionState.UNCONNECTED,
        });
      }
    });
    apiInstance.onDisconnect(() => {
      const { apiInstance } = get();
      if (reconnectTimeout || get().cancelReconnect) {
        clearTimeout(reconnectTimeout as NodeJS.Timeout);
        //   set({ reconnectTimeout: null });
      }
      let reconnectionInterval = 1000;
      if (!get().cancelReconnect) {
        reconnectTimeout = setTimeout(() => {
          apiInstance?.connect();
          reconnectionInterval += 1000;
        }, reconnectionInterval);
      }

      set({
        // reconnectTimeout: newTimeout,
        luaApi: null,
        connectionState: ConnectionState.UNCONNECTED,
      });
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
    // console.log('Connection State: ', connectionState);
    // console.log('API Instance: ', apiInstance);
    if (!apiInstance || connectionState != ConnectionState.CONNECTED)
      return null;
    // console.log(propertyName);
    const subscription = apiInstance.subscribeToProperty(propertyName);
    // console.log(subscription);
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
  subscribeToTopic: (topicName: string, properties?: string[]) => {
    const { connectionState, apiInstance } = get();
    if (!apiInstance || connectionState != ConnectionState.CONNECTED)
      return null;
    const topic = apiInstance.startTopic(topicName, {
      event: 'start_subscription',
      properties,
    });
    return topic;
  },
  connectToTopic: (topicName: string) => {
    const { connectionState, apiInstance } = get();
    if (!apiInstance || connectionState != ConnectionState.CONNECTED)
      return null;
    // console.log(topicName);
    const topic = apiInstance.startTopic(topicName, {
      type: 'connect',
    });
    return topic;
  },
  unsubscribeFromTopic: (topic: Topic) => {
    const { connectionState, apiInstance } = get();
    if (!apiInstance || connectionState != ConnectionState.CONNECTED) return;
    topic.talk({
      event: 'stop_subscription',
    });
    topic.cancel();
  },
}));
