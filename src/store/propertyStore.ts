import { Topic } from 'openspace-api-js';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import { useOpenSpaceApiStore } from './apiStore';
import { throttle } from '@/utils/throttle';
import updateTime from '@/utils/time';

type subscription = {
  count: number;
  subscription: Topic;
};

export enum ConnectionState {
  UNCONNECTED = 'UNCONNECTED',
  CONNECTED = 'CONNECTED',
  CONNECTING = 'CONNECTING',
}
//need to work this out
interface State {
  propertySubscriptions: Record<string, subscription>; // this should store a string which is propertyURI and value which is object containt count,subscritions and state
  topicSubscriptions: Record<string, subscription>;
  properties: Record<string, any>;
  setProperty: (name: string, value: any) => void;
  subscribeToProperty: (name: string) => void;
  unsubscribeFromProperty: (name: string) => void;
  subscribeToTopic: (topicName: string) => void;
  unsubscribeFromTopic: (topicName: string) => void;
}

export const usePropertyStore = create<State>()(
  devtools(
    immer((set) => ({
      propertySubscriptions: {},
      topicSubscriptions: {}, // New topics state
      properties: {}, // New properties state
      // Function to update a property's value
      setProperty: (name: string, value: any) =>
        set(
          (state: any) => {
            if (name == 'time') {
              state.properties[name] = updateTime({
                ...state.properties[name],
                ...value,
              });
            } else {
              state.properties[name] = { ...state.properties[name], ...value };
            }
          },
          false,
          'property/set',
        ),
      // Function to manage subscription counts
      subscribeToProperty: (name: string) =>
        set(
          (state: any) => {
            if (!state.propertySubscriptions[name]) {
              const apiSubscription =
                useOpenSpaceApiStore.getState().subscribeToProperty;
              const subscription = apiSubscription(name);
              if (!subscription) return;
              state.propertySubscriptions[name] = {
                count: 0,
                subscription,
              };
              const testSetProperty = (propName: string, value: any) => {
                console.log(propName, value);
                usePropertyStore.getState().setProperty(propName, value);
              };
              const throttledHandleUpdates = throttle(testSetProperty, 200);
              (async () => {
                // @ts-ignore eslint-disable-next-line no-restricted-syntax
                for await (const data of subscription.iterator()) {
                  throttledHandleUpdates(name, data);
                }
              })();
              console.log('Subscribed to Property: ', name);
            }
            state.propertySubscriptions[name].count += 1;
          },
          false,
          'property/subscribe',
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
          'property/unsubscribe',
        ),
      subscribeToTopic: (topicName: string) =>
        set(
          (state) => {
            if (!state.topicSubscriptions[topicName]) {
              const subscribeToTopic =
                useOpenSpaceApiStore.getState().subscribeToTopic;
              const topic = subscribeToTopic(topicName);
              if (!topic) return;
              state.topicSubscriptions[topicName] = {
                count: 0,
                subscription: topic,
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
          'topic/subscribe',
        ),
      unsubscribeFromTopic: (topicName: string) =>
        set(
          (state) => {
            if (!state.topicSubscriptions[topicName]) return;
            if (state.topicSubscriptions[topicName].count > 1) {
              state.topicSubscriptions[topicName].count -= 1;
            } else {
              console.log(state.topicSubscriptions[topicName].subscription);
              console.log(state.topicSubscriptions[topicName]);
              const apiUnsubscribe =
                useOpenSpaceApiStore.getState().unsubscribeFromTopic;
              apiUnsubscribe(state.topicSubscriptions[topicName].subscription);
              console.log('Unsubscribed from topic: ', topicName);
              delete state.topicSubscriptions[topicName];
            }
          },
          false,
          'topic/unsubscribe',
        ),
    })),
  ),
);
