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
  isPropertyVisible,
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

        usePropertyStore.getState().getActions();
        const Visibility = properties.find(
          (p) => p.uri === EnginePropertyVisibilityKey,
        );
        const FadeDuration = properties.find(
          (p) => p.uri === EngineFadeDurationKey,
        );

        // Set the inital properties to the store
        let initData: Record<string, any> = {};
        initData[EngineFadeDurationKey as string] = FadeDuration;
        initData[EnginePropertyVisibilityKey as string] = Visibility;
        usePropertyStore.getState().setProperties(initData);

        // Filter the properties based on the visibility
        const filteredProperties = properties.filter((p) =>
          isPropertyVisible(p, Visibility as PropertyOwner),
        );
        const filteredPropertyOwners = propertyOwners.filter((p) =>
          isPropertyVisible(p, Visibility as PropertyOwner),
        );

        // Find the favorites
        const favorites = findFavorites(filteredPropertyOwners);
        usePropertyStore.getState().setFavorites(favorites);

        // Get the renderables
        const fadeables: Record<string, any> = getRenderables(
          filteredProperties as Property[],
          'Opacity',
        );

        usePropertyStore.getState().setProperties(fadeables);

        const boolProps = getActionSceneNodes(
          filteredProperties as Property[],
          'Bool',
        );

        usePropertyStore.getState().setProperties(boolProps);
        const triggerProps = getActionSceneNodes(
          filteredProperties as Property[],
          'Trigger',
        );

        usePropertyStore.getState().setProperties(triggerProps);
        const numberProps = getActionSceneNodes(
          filteredProperties as Property[],
          'Number',
        );

        usePropertyStore.getState().setProperties(numberProps);
        // const topic = apiInstance.startTopic('sessionRecord', {});

        // const topic = apiInstance.startTopic('errorLog', {
        //   event: 'start_subscription',
        //   // settings: {
        //   //   timeStamping: true,
        //   //   dateStaming: true,
        //   //   categoryStamping: true,
        //   //   logLevelStamping: true,
        //   //   logLevel: 'ALL',
        //   //   // | `dateStamping`: [True, False] - Whether the error messages should be datestamped.
        //   //   // | `categoryStamping`: [True, False] - Whether the error messages should be category stamped.
        //   //   // | `logLevelStamping`: [True, False] - Whether the error messages should be log level stamped.
        //   //   // | `logLevel`: [All, Trace, Debug, Info, Warning, Error
        //   // },
        // });
        // // @ts-ignore eslint-disable-next-line no-restricted-syntax
        // for await (const data of topic.iterator()) {
        //   console.log('data', data);
        // }
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
    set({
      // // reconnectTimeout: newTimeout,
      // luaApi: null,
      connectionState: ConnectionState.UNCONNECTED,
    });
  },
  subscribeToProperty: (propertyName: string) => {
    const { connectionState, apiInstance } = get();
    // console.log('Connection State: ', connectionState);
    // console.log('API Instance: ', apiInstance);
    if (!apiInstance || connectionState != ConnectionState.CONNECTED)
      return null;
    try {
      const subscription = apiInstance.subscribeToProperty(propertyName);
      // console.log(subscription);
      return subscription;
    } catch (e) {
      console.error(
        'Cannot subscribe to property, API instance is not connected.',
      );
      return null;
    }
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

    if (!apiInstance || connectionState != ConnectionState.CONNECTED) {
      console.error(
        'Cannot subscribe to topic, API instance is not connected.',
      );

      return null;
    }
    try {
      const topic = apiInstance.startTopic(topicName, {
        event: 'start_subscription',
        properties,
      });
      return topic;
    } catch (e) {
      console.error(
        'Cannot subscribe to topic, API instance is not connected.',
      );
      return null;
    }
  },
  connectToTopic: (topicName: string) => {
    const { connectionState, apiInstance } = get();
    if (!apiInstance || connectionState != ConnectionState.CONNECTED) {
      console.error(
        'Cannot subscribe to topic, API instance is not connected.',
      );

      return null;
    }
    try {
      const topic = apiInstance.startTopic(topicName, {
        type: 'connect',
      });
      return topic;
    } catch (e) {
      console.error(
        'Cannot subscribe to topic, API instance is not connected.',
      );
      return null;
    }
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
