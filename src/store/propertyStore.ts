import { throttle } from 'lodash';
import { Topic } from 'openspace-api-js';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { RecordingState } from '@/types/enums';
import { AnyProperty } from '@/types/Property/property';
import {
  Action,
  CameraState,
  OpenSpaceTimeState,
  ProfileState,
  SessionRecordingState
} from '@/types/types';
import { ErrorLog } from '@/types/types';
import { restrictNumbersToDecimalPlaces } from '@/utils/math';
import { updateTime } from '@/utils/time';

import { useOpenSpaceApiStore } from './apiStore';

type Subscription = {
  count: number;
  subscription: Topic;
};

export enum ConnectionState {
  UNCONNECTED = 'UNCONNECTED',
  CONNECTED = 'CONNECTED',
  CONNECTING = 'CONNECTING'
}
//need to work this out
interface State {
  propertySubscriptions: Record<string, Subscription>; // this should store a string which is propertyURI and value which is object containt count,subscritions and state
  topicSubscriptions: Record<string, Subscription>;
  properties: Record<string, AnyProperty>;
  time: OpenSpaceTimeState;
  sessionRecording: SessionRecordingState;
  camera: CameraState;
  profile: ProfileState;
  favorites: string[];
  actions: Record<string, Action>;
  errorLog: Array<ErrorLog>;
  setProperty: (name: string, value: AnyProperty) => void;
  setProperties: (properties: Record<string, AnyProperty>) => void;
  setFavorites: (favorites: string[]) => void;
  refreshTopic: (name: string, properties?: string[]) => void;
  subscribeToProperty: (name: string, throttleAmt?: number) => void;
  unsubscribeFromProperty: (name: string) => void;
  subscribeToTopic: (
    topicName: string,
    throttleAmt?: number,
    properties?: string[],
    settings?: any
  ) => void;
  unsubscribeFromTopic: (topicName: string) => void;
  cancelTopic: (topicName: string) => void;
  connectToTopic: (topicName: string) => void;
  disconnectFromTopic: (topicName: string) => void;
  getActions: () => void;
}
const initialSessionRecordingState: SessionRecordingState = {
  files: [],
  state: RecordingState.Idle,
  settings: {
    recordingFileName: '',
    format: 'Ascii',
    overwriteFile: false
  }
};
const initialCameraState: CameraState = {
  latitude: undefined,
  longitude: undefined,
  altitude: undefined,
  altitudeUnit: undefined
};

const initialProfileState: ProfileState = {
  initalized: false,
  uiPanelVisibility: {},
  markNodes: [],
  name: undefined,
  author: undefined,
  description: undefined,
  license: undefined,
  url: undefined,
  version: undefined,
  filePath: ''
};

export const usePropertyStore = create<State>()(
  devtools(
    immer((set) => ({
      propertySubscriptions: {},
      topicSubscriptions: {}, // New topics state
      properties: {}, // New properties state
      time: {},
      errorLog: [],
      sessionRecording: initialSessionRecordingState,
      camera: initialCameraState,
      profile: initialProfileState,
      favorites: [],
      actions: {},
      // Function to update a property's value
      setProperty: (name: string, value: any) =>
        set(
          (state: any) => {
            if (name == 'time') {
              state.time = updateTime({
                ...state.time,
                ...value
              });
            } else if (name == 'sessionRecording') {
              state.sessionRecording = { ...state.sessionRecording, ...value };
            } else if (name == 'errorLog') {
              state.errorLog.push(value);
              if (state.errorLog.length > 10) {
                state.errorLog = state.errorLog.slice(-10);
              }
            } else if (name == 'camera') {
              state.camera = { ...state.camera, ...value };
            } else if (name == 'profile') {
              state.profile = value;
            } else {
              state.properties[name] = { ...state.properties[name], ...value };
            }
          },
          false,
          'property/set'
        ),
      setProperties: (properties: Record<string, AnyProperty>) =>
        set(
          (state: any) => {
            state.properties = { ...state.properties, ...properties };
          },
          false,
          'property/setProperties'
        ),
      setFavorites: (favorites: string[]) =>
        set(
          (state: any) => {
            state.favorites = favorites;
          },
          false,
          'property/setFavorites'
        ),
      // Function to manage subscription counts
      subscribeToProperty: (name: string, throttleAmt: number = 200) =>
        set(
          (state: any) => {
            if (!state.propertySubscriptions[name]) {
              const apiSubscription = useOpenSpaceApiStore.getState().subscribeToProperty;
              const subscription = apiSubscription(name);
              if (!subscription) return;
              state.propertySubscriptions[name] = {
                count: 0,
                subscription
              };
              const setProperty = (propName: string, value: any) => {
                usePropertyStore.getState().setProperty(propName, value);
              };
              const throttledHandleUpdates = throttle(setProperty, throttleAmt);
              (async () => {
                // @ts-ignore eslint-disable-next-line no-restricted-syntax
                for await (const data of subscription.iterator()) {
                  // throttledHandleUpdates(
                  throttledHandleUpdates(name, restrictNumbersToDecimalPlaces(data, 4));
                  // testSetProperty(
                  //   name,
                  //   // data,
                  //   restrictNumbersToDecimalPlaces(data, 4)
                  // );
                }
              })();
              console.log('Subscribed to Property: ', name);
            }
            state.propertySubscriptions[name].count += 1;
          },
          false,
          'property/subscribe'
        ),
      unsubscribeFromProperty: (name: string) =>
        set(
          (state: any) => {
            if (!state.propertySubscriptions[name]) return;
            if (state.propertySubscriptions[name].count > 1) {
              state.propertySubscriptions[name].count -= 1;
            } else {
              const apiUnsubscribe =
                useOpenSpaceApiStore.getState().unsubscribeFromProperty;
              apiUnsubscribe(state.propertySubscriptions[name].subscription);
              console.log('Unsubscribed from Property: ', name);
              delete state.propertySubscriptions[name];
            }
          },
          false,
          'property/unsubscribe'
        ),
      subscribeToTopic: (
        topicName: string,
        throttleAmt: number = 200,
        properties,
        settings
      ) =>
        set(
          (state) => {
            if (!state.topicSubscriptions[topicName]) {
              const { subscribeToTopic } = useOpenSpaceApiStore.getState();
              const topic = subscribeToTopic(topicName, properties, settings);
              if (!topic) return;
              state.topicSubscriptions[topicName] = {
                count: 0,
                subscription: topic
              };
              const setProperty = (propName: string, value: any) => {
                usePropertyStore.getState().setProperty(propName, value);
              };
              const throttledHandleUpdates = throttle(setProperty, throttleAmt);
              (async () => {
                // @ts-ignore eslint-disable-next-line no-restricted-syntax
                for await (const data of topic.iterator()) {
                  if (topicName == 'errorLog') {
                    // console.log('errorLog', data);
                    usePropertyStore.getState().setProperty('errorLog', data);
                  }
                  // testSetProperty(topicName, restrictNumbersToDecimalPlaces(data, 4));
                  throttledHandleUpdates(
                    topicName,
                    restrictNumbersToDecimalPlaces(data, 4)
                  );
                }
              })();
              console.log('Subscribed to topic: ', topicName);
            }
            state.topicSubscriptions[topicName].count += 1;
          },
          false,
          'topic/subscribe'
        ),
      refreshTopic: (topicName: string, properties) =>
        set(
          (state) => {
            if (!state.topicSubscriptions[topicName]) {
              const topic = useOpenSpaceApiStore
                .getState()
                .apiInstance?.startTopic('sessionRecording', {
                  event: 'refresh',
                  properties: properties
                });
              (async () => {
                if (topic) {
                  // @ts-ignore eslint-disable-next-line no-restricted-syntax
                  for await (const data of topic.iterator()) {
                    usePropertyStore.getState().setProperty(topicName, data);
                    topic?.cancel();
                  }
                }
              })();
            } else {
              state.topicSubscriptions[topicName].subscription.talk({
                event: 'refresh'
              });
            }
          },
          false,
          'topic/refresh'
        ),
      connectToTopic: (topicName: string) =>
        set(
          (state) => {
            if (!state.topicSubscriptions[topicName]) {
              const { connectToTopic } = useOpenSpaceApiStore.getState();
              const topic = connectToTopic(topicName);
              if (!topic) return;
              state.topicSubscriptions[topicName] = {
                count: 0,
                subscription: topic
              };
              const testSetProperty = (propName: string, value: any) => {
                // console.log(propName, value);
                usePropertyStore.getState().setProperty(propName, value);
              };
              const throttledHandleUpdates = throttle(testSetProperty, 200);
              (async () => {
                // @ts-ignore eslint-disable-next-line no-restricted-syntax
                for await (const data of topic.iterator()) {
                  throttledHandleUpdates(topicName, data);
                }
              })();
              console.log('Subscribed to topic: ', topicName);
            }
            state.topicSubscriptions[topicName].count += 1;
          },
          false,
          'topic/connect'
        ),
      disconnectFromTopic: (topicName: string) =>
        set(
          (state) => {
            if (!state.topicSubscriptions[topicName]) return;
            if (state.topicSubscriptions[topicName].count > 1) {
              state.topicSubscriptions[topicName].count -= 1;
            } else {
              const apiDisconnect = useOpenSpaceApiStore.getState().disconnectFromTopic;
              apiDisconnect(state.topicSubscriptions[topicName].subscription);
              console.log('Unsubscribed from topic: ', topicName);
              delete state.topicSubscriptions[topicName];
            }
          },
          false,
          'topic/disconnect'
        ),
      unsubscribeFromTopic: (topicName: string) =>
        set(
          (state) => {
            if (!state.topicSubscriptions[topicName]) return;
            if (state.topicSubscriptions[topicName].count > 1) {
              state.topicSubscriptions[topicName].count -= 1;
            } else {
              // console.log(state.topicSubscriptions[topicName].subscription);
              // console.log(state.topicSubscriptions[topicName]);
              const apiUnsubscribe = useOpenSpaceApiStore.getState().unsubscribeFromTopic;
              apiUnsubscribe(state.topicSubscriptions[topicName].subscription);
              console.log('Unsubscribed from topic: ', topicName);
              delete state.topicSubscriptions[topicName];
            }
          },
          false,
          'topic/unsubscribe'
        ),
      cancelTopic: (topicName: string) =>
        set(
          (state) => {
            if (!state.topicSubscriptions[topicName]) return;
            const apiCancel = useOpenSpaceApiStore.getState().cancelTopic;
            apiCancel(state.topicSubscriptions[topicName].subscription);
            console.log('Cancelled topic: ', topicName);
            delete state.topicSubscriptions[topicName];
          },
          false,
          'topic/cancel'
        ),
      getActions: () => {
        (async () => {
          const actions = await useOpenSpaceApiStore.getState().luaApi?.action.actions();
          if (!actions) return;
          // console.log(actions);
          const reducedActions = Object.values(actions['1']).reduce(
            (acc: Record<string, Action>, action: Action) => {
              console.log(action);
              const newKey = action?.Name?.concat(` ${action?.GuiPath}`);
              acc[newKey] = action;
              return acc;
            },
            {}
          );
          // console.log(reducedActions);
          set((state) => {
            state.actions = reducedActions;
          });
        })();
      }
    }))
  )
);

export const selectFilteredProperties = (state: State) => {
  console.log(state);
  return Object.keys(state.properties).filter((a) => a.includes('.Renderable'));
  // .reduce((acc: Record<string, any>, key: string) => {
  //   acc[key] = state.properties[key];
  //   return acc;
  // }, {});
};
