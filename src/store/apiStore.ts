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
  connectToTopic: (topic: string) => Topic | null; // Define parameters as needed
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
        const value = await apiInstance.getProperty(rootOwnerKey);

        const {
          propertyOwners,
          properties,
        }: { propertyOwners: PropertyOwner[]; properties: PropertyOwner[] } =
          flattenPropertyTree(value as PropertyOwner);
        // console.log(propertyOwners);
        // console.log(
        //   properties.find((p) => p.uri === 'Scene.Earth.Renderable.Opacity'),
        // );
        const favorites = findFavorites(propertyOwners);
        usePropertyStore.getState().setFavorites(favorites);
        // // console.log(favorites);
        const fadeables: Record<string, any> = getRenderables(
          properties as Property[],
          'Fadable',
        );

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
        console.log(numberProps);
        usePropertyStore.getState().setProperties(numberProps);

        // const renderables: Record<string, any> = getRenderables(
        //   properties,
        //   'Renderable',
        // );
        // console.log(renderables);
        // renderables.forEach((property) => {
        //   usePropertyStore.getState().setProperty(property.uri, property);
        // });
        usePropertyStore.getState().setProperties(fadeables);
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
        // apiInstance: null,
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
  subscribeToTopic: (topicName: string) => {
    const { connectionState, apiInstance } = get();
    if (!apiInstance || connectionState != ConnectionState.CONNECTED)
      return null;
    console.log(topicName);
    const topic = apiInstance.startTopic(topicName, {
      event: 'start_subscription',
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
    console.log(topic);
    topic.talk({
      event: 'stop_subscription',
    });
    topic.cancel();
  },
}));
