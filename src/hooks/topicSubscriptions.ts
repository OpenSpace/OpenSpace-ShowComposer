import { useEffect } from 'react';
import { TopicId, TopicPayload } from 'openspace-api-js/types';

import { useOpenSpaceApiStore } from '@/store/apiStore';
import { usePropertyStore } from '@/store/propertyStore';
import { ConnectionStatus } from '@/types/enums';
import {
  CameraState,
  OpenSpaceTimeState,
  ProfileState,
  SessionRecordingState
} from '@/types/types';

// Like OpenSpace-WebGui's hooks/topicSubscriptions, but reading from ShowComposer's Zustand
// propertyStore. Each hook subscribes to a topic while mounted and returns its live state,
// replacing subscribe/unsubscribe code copied across panels and preset components. The
// payload constants live at the top of the file so their reference stays stable between
// renders — otherwise the effect would re-subscribe on every render.

const SessionRecordingPayload: Partial<TopicPayload<'sessionRecording'>> = {
  properties: ['state', 'files']
};

/**
 * Shared helper the hooks below use to subscribe to a topic while a component is mounted.
 * Does nothing until we're connected to OpenSpace, and subscribes again after a reconnect.
 */
function useSubscribeToTopic<T extends TopicId>(
  topicName: T,
  throttleMs?: number,
  payload?: Partial<TopicPayload<T>>
): void {
  const connectionStatus = useOpenSpaceApiStore((state) => state.connectionStatus);
  const subscribeToTopic = usePropertyStore((state) => state.subscribeToTopic);
  const unsubscribeFromTopic = usePropertyStore((state) => state.unsubscribeFromTopic);

  useEffect(() => {
    if (connectionStatus !== ConnectionStatus.Connected) {
      return;
    }
    subscribeToTopic(topicName, throttleMs, payload);
    return () => {
      unsubscribeFromTopic(topicName);
    };
  }, [
    topicName,
    throttleMs,
    payload,
    connectionStatus,
    subscribeToTopic,
    unsubscribeFromTopic
  ]);
}

export function useSubscribeToTime(throttleMs: number = 200): OpenSpaceTimeState {
  useSubscribeToTopic('time', throttleMs);
  return usePropertyStore((state) => state.time);
}

export function useSubscribeToCamera(throttleMs: number = 500): CameraState {
  useSubscribeToTopic('camera', throttleMs);
  return usePropertyStore((state) => state.camera);
}

export function useSubscribeToProfile(throttleMs: number = 1000): ProfileState {
  useSubscribeToTopic('profile', throttleMs);
  return usePropertyStore((state) => state.profile);
}

export function useSubscribeToSessionRecording(): SessionRecordingState {
  useSubscribeToTopic('sessionRecording', 0, SessionRecordingPayload);
  return usePropertyStore((state) => state.sessionRecording);
}
