import { useCallback, useEffect, useRef } from 'react';
import {
  FlightControllerInputStateCommand,
  LogLevel,
  LogMessage,
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

// This file contains hooks that matches Webgui hooks but uses Zustand under the hood.

const SessionRecordingPayload: Partial<TopicPayload<'sessionRecording'>> = {
  properties: ['state', 'files']
};

/**
 * Subscribe to the current simulation time.
 *
 * @param throttleMs How often the subscription is allowed to update (ms).
 */
export function useSubscribeToTime(throttleMs: number = 200): OpenSpaceTimeState {
  const connectionStatus = useOpenSpaceApiStore((state) => state.connectionStatus);
  const subscribeToTopic = usePropertyStore((state) => state.subscribeToTopic);
  const unsubscribeFromTopic = usePropertyStore((state) => state.unsubscribeFromTopic);

  useEffect(() => {
    if (connectionStatus !== ConnectionStatus.Connected) {
      return;
    }
    subscribeToTopic('time', throttleMs);
    return () => {
      unsubscribeFromTopic('time');
    };
  }, [throttleMs, connectionStatus, subscribeToTopic, unsubscribeFromTopic]);

  return usePropertyStore((state) => state.time);
}

/**
 * Subscribe to the current camera state.
 *
 * @param throttleMs How often the subscription is allowed to update (ms).
 */
export function useSubscribeToCamera(throttleMs: number = 500): CameraState {
  const connectionStatus = useOpenSpaceApiStore((state) => state.connectionStatus);
  const subscribeToTopic = usePropertyStore((state) => state.subscribeToTopic);
  const unsubscribeFromTopic = usePropertyStore((state) => state.unsubscribeFromTopic);

  useEffect(() => {
    if (connectionStatus !== ConnectionStatus.Connected) {
      return;
    }
    subscribeToTopic('camera', throttleMs);
    return () => {
      unsubscribeFromTopic('camera');
    };
  }, [throttleMs, connectionStatus, subscribeToTopic, unsubscribeFromTopic]);

  return usePropertyStore((state) => state.camera);
}

/**
 * Get the profile.
 */
export function useSubscribeToProfile(): ProfileState {
  const connectionStatus = useOpenSpaceApiStore((state) => state.connectionStatus);
  const subscribeToTopic = usePropertyStore((state) => state.subscribeToTopic);
  const cancelTopic = usePropertyStore((state) => state.cancelTopic);

  useEffect(() => {
    if (connectionStatus !== ConnectionStatus.Connected) {
      return;
    }
    subscribeToTopic('profile');
    return () => {
      cancelTopic('profile');
    };
  }, [connectionStatus, subscribeToTopic, cancelTopic]);

  return usePropertyStore((state) => state.profile);
}

/**
 * Subscribe to session-recording state and its file list.
 */
export function useSubscribeToSessionRecording(): SessionRecordingState {
  const connectionStatus = useOpenSpaceApiStore((state) => state.connectionStatus);
  const subscribeToTopic = usePropertyStore((state) => state.subscribeToTopic);
  const unsubscribeFromTopic = usePropertyStore((state) => state.unsubscribeFromTopic);

  useEffect(() => {
    if (connectionStatus !== ConnectionStatus.Connected) {
      return;
    }
    subscribeToTopic('sessionRecording', 0, SessionRecordingPayload);
    return () => {
      unsubscribeFromTopic('sessionRecording');
    };
  }, [connectionStatus, subscribeToTopic, unsubscribeFromTopic]);

  return usePropertyStore((state) => state.sessionRecording);
}

/**
 * Connect to the flightcontroller topic and hand back a function to send commands.
 *
 * @returns A function that sends a {@link FlightControllerInputStateCommand} to the topic.
 */
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

function ErrorLogSettings(logLevel: LogLevel): Partial<TopicPayload<'errorLog'>> {
  return {
    settings: {
      timeStamping: true,
      dateStamping: true,
      categoryStamping: true,
      logLevelStamping: true,
      logLevel
    }
  };
}

/**
 * Subscribe to the errorLog topic.
 *
 * @returns The log messages plus a setter for the log level - it updates the live subscription
 * with `talk` if there is one, otherwise it starts a fresh subscription at that level.
 */
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
  // Tracks the last log level the user picked, so a reconnect resubscribes at that
  // level instead of resetting to LogLevel.All.
  const logLevelRef = useRef<LogLevel>(LogLevel.All);

  useEffect(() => {
    if (connectionStatus !== ConnectionStatus.Connected) {
      return;
    }
    subscribeToTopic('errorLog', undefined, ErrorLogSettings(logLevelRef.current));
    return () => {
      unsubscribeFromTopic('errorLog');
    };
  }, [connectionStatus, subscribeToTopic, unsubscribeFromTopic]);

  const setLogLevel = useCallback(
    (logLevel: LogLevel) => {
      logLevelRef.current = logLevel;
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
