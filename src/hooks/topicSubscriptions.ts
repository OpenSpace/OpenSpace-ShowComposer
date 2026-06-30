import { useCallback, useEffect } from 'react';
import {
  FlightControllerInputStateCommand,
  LogLevel,
  LogMessage,
  TopicId,
  TopicPayload
} from 'openspace-api-js/types';

import { useOpenSpaceApiStore } from '@/store/apiStore';
import { usePropertyStore } from '@/store/propertyStore';
import { ConnectionStatus } from '@/types/enums';
import {
  CameraState,
  OpenSpaceTimeState,
  ProfileState,
  SessionRecordingState
} from '@/types/types';

// This file contains hooks that matches Webgui but uses Zustand under the hood.

// Payload constants live up here to keep their reference stable -
// otherwise the effect would re-subscribe every render.
const SessionRecordingPayload: Partial<TopicPayload<'sessionRecording'>> = {
  properties: ['state', 'files']
};

// Internal helper for managing topic subscriptions.
// Topics don't all cancel the same way, hence `teardown`: real subscriptions
// (time/camera/sessionRecording/errorLog) close with 'unsubscribe' (stop_subscription + cancel),
// but one-shot topics like profile just need a local 'cancel' - they don't understand
// stop_subscription.
function useSubscribeToTopic<T extends TopicId>(
  topicName: T,
  throttleMs?: number,
  payload?: Partial<TopicPayload<T>>,
  teardown: 'unsubscribe' | 'cancel' = 'unsubscribe'
): void {
  const connectionStatus = useOpenSpaceApiStore((state) => state.connectionStatus);
  const subscribeToTopic = usePropertyStore((state) => state.subscribeToTopic);
  const unsubscribeFromTopic = usePropertyStore((state) => state.unsubscribeFromTopic);
  const cancelTopic = usePropertyStore((state) => state.cancelTopic);

  useEffect(() => {
    if (connectionStatus !== ConnectionStatus.Connected) {
      return;
    }
    subscribeToTopic(topicName, throttleMs, payload);
    return () => {
      if (teardown === 'cancel') {
        cancelTopic(topicName);
      } else {
        unsubscribeFromTopic(topicName);
      }
    };
  }, [
    topicName,
    throttleMs,
    payload,
    teardown,
    connectionStatus,
    subscribeToTopic,
    unsubscribeFromTopic,
    cancelTopic
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

export function useSubscribeToProfile(): ProfileState {
  // profile is a one-shot topic: no throttle needed, and cancel it locally rather than
  // sending stop_subscription.
  useSubscribeToTopic('profile', undefined, undefined, 'cancel');
  return usePropertyStore((state) => state.profile);
}

export function useSubscribeToSessionRecording(): SessionRecordingState {
  useSubscribeToTopic('sessionRecording', 0, SessionRecordingPayload);
  return usePropertyStore((state) => state.sessionRecording);
}

// Connect to the flightcontroller topic while mounted and hand back a sender for camera-input
// commands. Returns a function that takes a FlightControllerInputStateCommand and sends it to the topic.
export function useFlightController(): (
  command: FlightControllerInputStateCommand
) => void {
  const connectionStatus = useOpenSpaceApiStore((state) => state.connectionStatus);
  const connectToTopic = usePropertyStore((state) => state.connectToTopic);
  const disconnectFromTopic = usePropertyStore((state) => state.disconnectFromTopic);
  const topic = usePropertyStore(
    (state) => state.topicSubscriptions['flightcontroller']?.subscription
  );

  useEffect(() => {
    if (connectionStatus !== ConnectionStatus.Connected) {
      return;
    }
    connectToTopic('flightcontroller');
    return () => {
      disconnectFromTopic('flightcontroller');
    };
  }, [connectionStatus, connectToTopic, disconnectFromTopic]);

  const sendFlightControlInput = useCallback(
    (command: FlightControllerInputStateCommand) => {
      topic?.talk(command);
    },
    [topic]
  );
  return sendFlightControlInput;
}

const ErrorLogSettings = (logLevel: LogLevel): Partial<TopicPayload<'errorLog'>> => ({
  settings: {
    timeStamping: true,
    dateStamping: true,
    categoryStamping: true,
    logLevelStamping: true,
    logLevel
  }
});

// Subscribe to the errorLog topic while mounted. Returns the log messages plus a setter for the
// log level - it updates the live subscription with `talk` if there is one, otherwise it starts
// a fresh subscription at that level.
export function useSubscribeToErrorLog(): {
  errorLog: LogMessage[];
  setLogLevel: (logLevel: LogLevel) => void;
} {
  const connectionStatus = useOpenSpaceApiStore((state) => state.connectionStatus);
  const subscribeToTopic = usePropertyStore((state) => state.subscribeToTopic);
  const unsubscribeFromTopic = usePropertyStore((state) => state.unsubscribeFromTopic);
  const errorLog = usePropertyStore((state) => state.errorLog);
  const topic = usePropertyStore(
    (state) => state.topicSubscriptions.errorLog?.subscription
  );

  useEffect(() => {
    if (connectionStatus !== ConnectionStatus.Connected) {
      return;
    }
    subscribeToTopic('errorLog', undefined, ErrorLogSettings(LogLevel.All));
    return () => {
      unsubscribeFromTopic('errorLog');
    };
  }, [connectionStatus, subscribeToTopic, unsubscribeFromTopic]);

  const setLogLevel = useCallback(
    (logLevel: LogLevel) => {
      if (topic) {
        topic.talk({ event: 'update_log_level', logLevel });
      } else {
        subscribeToTopic('errorLog', undefined, ErrorLogSettings(logLevel));
      }
    },
    [topic, subscribeToTopic]
  );

  return { errorLog, setLogLevel };
}
