import OpenSpaceApi from 'openspace-api-js';
import { OpenSpaceApi as OpenSpaceApiClass } from 'openspace-api-js/api';
import { Topic } from 'openspace-api-js/topics';
import {
  AnyProperty,
  OpenSpaceLibrary,
  TopicId,
  TopicPayload
} from 'openspace-api-js/types';
import { create } from 'zustand';

import { ConnectionStatus } from '@/types/enums';
import {
  flattenPropertyTree,
  getActionSceneNodes,
  getRenderables,
  isPropertyVisible
} from '@/utils/apiHelpers';

import { usePropertyStore } from './propertyStore';
import { useSettingsStore } from './settingsStore';

export const rootOwnerKey = '__rootOwner';
export const NavigationAnchorKey = 'NavigationHandler.OrbitalNavigator.Anchor';
export const NavigationAimKey = 'NavigationHandler.OrbitalNavigator.Aim';
export const RetargetAnchorKey = 'NavigationHandler.OrbitalNavigator.RetargetAnchor';
export const RetargetAimKey = 'NavigationHandler.OrbitalNavigator.RetargetAim';
export const RotationalFrictionKey =
  'NavigationHandler.OrbitalNavigator.Friction.RotationalFriction';
export const ZoomFrictionKey = 'NavigationHandler.OrbitalNavigator.Friction.ZoomFriction';
export const RollFrictionKey = 'NavigationHandler.OrbitalNavigator.Friction.RollFriction';

// OpenSpace engine
export const EngineModeSessionRecordingPlayback = 'session_recording_playback';
export const EnginePropertyVisibilityKey = 'OpenSpaceEngine.PropertyVisibility';
export const EngineFadeDurationKey = 'OpenSpaceEngine.FadeDuration';

interface OpenSpaceApiState {
  apiInstance: null | OpenSpaceApiClass; // Consider using a more specific type if possible
  luaApi: OpenSpaceLibrary | undefined; // Consider using a more specific type if possible
  error: string | null;
  connectionStatus: ConnectionStatus;
  cancelReconnect: boolean;
  // reconnectTimeout: NodeJS.Timeout | null;
  connect: () => void;
  disconnect: () => void;
  forceRefresh: () => void;
  setLuaApi: (luaApi: OpenSpaceLibrary) => void;
  setError: (error: string) => void;
  setConnectionStatus: (state: ConnectionStatus) => void;
  subscribeToProperty: (property: string) => Topic<'subscribe'> | null; // Define parameters as needed
  unsubscribeFromProperty: (topic: Topic<'subscribe'>) => void; // Define parameters as needed
  subscribeToTopic: <T extends TopicId>(
    topic: T,
    payload?: TopicPayload<T>
  ) => Topic<T> | null; // Define parameters as needed
  unsubscribeFromTopic: (topic: Topic<TopicId>) => void; // Define parameters as needed
  connectToTopic: (topic: TopicId) => Topic<TopicId> | null; // Define parameters as needed
  cancelTopic: (topic: Topic<TopicId>) => void; // Define parameters as needed
  // subscribeToSessionRecording: () => Topic | null;
  // unsubscribeFromSessionRecording: (topic: Topic) => void;
  disconnectFromTopic: (topic: Topic<TopicId>) => void;
}

let reconnectTimeout: NodeJS.Timeout | null;

export const useOpenSpaceApiStore = create<OpenSpaceApiState>()((set, get) => ({
  apiInstance: null,
  luaApi: undefined,
  error: null,
  cancelReconnect: false,
  // reconnectTimeout: null,
  connectionStatus: ConnectionStatus.Disconnected,
  setLuaApi: (luaApi) => set(() => ({ luaApi })),
  setError: (error) => set(() => ({ error })),
  setConnectionStatus: (connectionStatus) => set(() => ({ connectionStatus })),
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
    console.log('connect');

    if (
      get().connectionStatus === ConnectionStatus.Connected ||
      get().connectionStatus === ConnectionStatus.Connecting
    )
      return;
    let { ip: host } = useSettingsStore.getState();
    let { port } = useSettingsStore.getState();

    // Set default values if host or port were previously undefined or empty. Due to
    // settings possibly being cached, the initialr `settingsStore` default values might
    // not be applied
    if (host === undefined || host === '') {
      host = 'localhost';
    }
    if (port === undefined || port === '') {
      port = '4682';
    }

    console.log('Creating API');
    const apiInstance = OpenSpaceApi(host, parseInt(port));
    get().setConnectionStatus(ConnectionStatus.Connecting);
    get().apiInstance = apiInstance;
    get().cancelReconnect = false;

    apiInstance.onConnect(async () => {
      console.log('onConnect');
      if (get().connectionStatus === ConnectionStatus.Connected) return;

      try {
        console.log('OpenSpace connected');
        const luaApi = await apiInstance.library();
        set({ luaApi, connectionStatus: ConnectionStatus.Connected });
        const response = await apiInstance.getProperty(rootOwnerKey);

        if (response.type !== 'propertyOwner') {
          throw new Error('Root property owner not found');
        }

        const { properties } = flattenPropertyTree(response.value);

        usePropertyStore.getState().getActions();
        const Visibility: AnyProperty | undefined = properties.find(
          (p) => p.uri === EnginePropertyVisibilityKey
        );
        const FadeDuration = properties.find((p) => p.uri === EngineFadeDurationKey);

        // Set the inital properties to the store
        const initData: Record<string, AnyProperty> = {};
        initData[EngineFadeDurationKey as string] = FadeDuration as AnyProperty;
        initData[EnginePropertyVisibilityKey as string] = Visibility as AnyProperty;
        usePropertyStore.getState().setProperties(initData);

        // Filter the properties based on the visibility
        const filteredProperties = properties.filter((p: AnyProperty) =>
          isPropertyVisible(p, Visibility?.value as number)
        );
        // Get the renderables
        const fadeables: Record<string, AnyProperty> = getRenderables(
          filteredProperties,
          'Opacity'
        );
        usePropertyStore.getState().setProperties(fadeables);

        const boolProps: Record<string, any> = getActionSceneNodes(
          filteredProperties,
          'Bool'
        );
        usePropertyStore.getState().setProperties(boolProps);
        const triggerProps = getActionSceneNodes(filteredProperties, 'Trigger');

        usePropertyStore.getState().setProperties(triggerProps);
        const numberProps = getActionSceneNodes(filteredProperties, 'Number');
        usePropertyStore.getState().setProperties(numberProps);
      } catch (e) {
        console.error('OpenSpace library could not be loaded:', e);
        set({
          error: 'OpenSpace library could not be loaded',
          connectionStatus: ConnectionStatus.Disconnected
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
          console.log('Reconnecting to OpenSpace');
          apiInstance?.connect();
          get().setConnectionStatus(ConnectionStatus.Connecting);
          reconnectionInterval += 1000;
        }, reconnectionInterval);
      }

      set({
        luaApi: undefined,
        connectionStatus: ConnectionStatus.Disconnected
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
      luaApi: undefined,
      connectionStatus: ConnectionStatus.Disconnected
    });
  },
  subscribeToProperty: (propertyName: string) => {
    const { connectionStatus, apiInstance } = get();
    if (!apiInstance || connectionStatus != ConnectionStatus.Connected) return null;
    try {
      const subscription = apiInstance.subscribeToProperty(propertyName);
      return subscription;
    } catch (e) {
      console.error('Cannot subscribe to property, API instance is not connected.');
      return null;
    }
  },
  unsubscribeFromProperty: (subscription: Topic<'subscribe'>) => {
    // A property subscription's cancel() first sends 'stop_subscription' over the socket,
    // so on a dead socket it throws ("Cannot send: socket is not connected"). Unlike WebGui
    // — which unsubscribes synchronously inside the socket onclose (client still set) — our
    // per-component teardown runs in React effect cleanup, after the socket is already
    // nulled. Swallow the throw so it can't escape into React's cleanup and crash the tree;
    // when the socket is gone the server-side subscription is gone too.
    try {
      subscription.cancel();
    } catch {
      // socket already closed — nothing left to tear down server-side
    }
  },
  subscribeToTopic: <T extends TopicId>(topicName: T, payload?: TopicPayload<T>) => {
    const { connectionStatus, apiInstance } = get();

    if (!apiInstance || connectionStatus != ConnectionStatus.Connected) {
      console.error('Cannot subscribe to topic, API instance is not connected.');
      return null;
    }
    try {
      const topic = apiInstance.startTopic(topicName, {
        event: 'start_subscription',
        ...payload
      });
      return topic;
    } catch (e) {
      console.error('Cannot subscribe to topic, API instance is not connected.');
      return null;
    }
  },
  connectToTopic: (topicName: TopicId) => {
    const { connectionStatus, apiInstance } = get();
    if (!apiInstance || connectionStatus != ConnectionStatus.Connected) {
      console.error('Cannot subscribe to topic, API instance is not connected.');

      return null;
    }
    try {
      const topic = apiInstance.startTopic(topicName, {
        event: 'connect'
      });
      return topic;
    } catch (e) {
      console.error('Cannot subscribe to topic, API instance is not connected.');
      return null;
    }
  },
  unsubscribeFromTopic: (topic: Topic<TopicId>) => {
    const { connectionStatus } = get();
    // talk()/cancel() can send over the socket; guard the send on a live connection and
    // swallow any throw so disconnect teardown can't crash React's effect cleanup.
    try {
      if (connectionStatus == ConnectionStatus.Connected) {
        topic.talk({
          event: 'stop_subscription'
        });
      }
      topic.cancel();
    } catch {
      // socket already closed
    }
  },
  cancelTopic: (topic: Topic<TopicId>) => {
    try {
      topic.cancel();
    } catch {
      // socket already closed
    }
  },
  disconnectFromTopic: (topic: Topic<TopicId>) => {
    const { connectionStatus } = get();
    try {
      if (connectionStatus == ConnectionStatus.Connected) {
        topic.talk({
          event: 'disconnect'
        });
      }
      topic.cancel();
    } catch {
      // socket already closed
    }
  }
}));
