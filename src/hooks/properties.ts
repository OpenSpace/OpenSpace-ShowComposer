import { useEffect } from 'react';
import { useThrottledCallback } from '@mantine/hooks';

import { useOpenSpaceApi } from '@/api/hooks';
import { useOpenSpaceApiStore } from '@/store/apiStore';
import { usePropertyStore } from '@/store/propertyStore';
import { ConnectionStatus } from '@/types/enums';
import { PropertyOrPropertyGroup, PropertyTypeKey } from '@/types/Property/property';
import { PropertyGroupsRuntime } from '@/types/Property/propertyGroups';

function validatePropertyType<T extends PropertyTypeKey>(
  type: T,
  prop: PropertyOrPropertyGroup<T> | undefined
): boolean {
  if (prop === undefined || prop.metaData === undefined) {
    return true;
  }

  // Collect all the valid types - groups and specific property types
  const allowedTypes: string[] =
    typeof type === 'string' && type in PropertyGroupsRuntime
      ? Array.from(PropertyGroupsRuntime[type as keyof typeof PropertyGroupsRuntime])
      : [type as string];

  return allowedTypes.includes(prop.metaData.type);
}

function useStoredProperty<T extends PropertyTypeKey>(
  type: T,
  uri: string
): PropertyOrPropertyGroup<T> | undefined {
  const prop = usePropertyStore((state) => state.properties[uri]) as
    | PropertyOrPropertyGroup<T>
    | undefined;

  if (!validatePropertyType(type, prop)) {
    throw new Error(
      `Tried to access property with uri "${uri}" as type "${type}", but it is of ` +
        `type "${prop?.metaData?.type}"`
    );
  }
  return prop;
}

// How often a property subscription is allowed to re-render. Only fast-changing numbers
// really hit this, e.g. Fade values or other number types (normally)
const SubscriptionThrottleMs = 50;

/**
 * Subscribe to live updates for a property while the component is mounted. Does nothing
 * until we're connected to OpenSpace. The store keeps a count of subscribers, so it's fine
 * for several components to subscribe to the same property at once.
 */
export function useSubscribeToProperty(uri: string): void {
  const connectionStatus = useOpenSpaceApiStore((state) => state.connectionStatus);
  const subscribeToProperty = usePropertyStore((state) => state.subscribeToProperty);
  const unsubscribeFromProperty = usePropertyStore(
    (state) => state.unsubscribeFromProperty
  );

  useEffect(() => {
    if (connectionStatus !== ConnectionStatus.Connected || !uri) {
      return;
    }
    subscribeToProperty(uri, SubscriptionThrottleMs);
    return () => {
      unsubscribeFromProperty(uri);
    };
  }, [uri, connectionStatus, subscribeToProperty, unsubscribeFromProperty]);
}

/**
 * Read the current value of a property from the store, with type validation.
 * Returns undefined when the property is unknown (e.g. before its first update).
 */
export function usePropertyValue<T extends PropertyTypeKey>(
  type: T,
  uri: string
): PropertyOrPropertyGroup<T>['value'] | undefined {
  return useStoredProperty(type, uri)?.value;
}

/**
 * Read the metadata of a property from the store, with type validation.
 */
export function usePropertyMetaData<T extends PropertyTypeKey>(
  type: T,
  uri: string
): PropertyOrPropertyGroup<T>['metaData'] | undefined {
  return useStoredProperty(type, uri)?.metaData;
}

/**
 * Convenience hook that subscribes to a property and returns its value, a throttled setter
 * that pushes to OpenSpace, and its metadata. Mirrors OpenSpace-WebGui's useProperty.
 */
export function useProperty<T extends PropertyTypeKey>(
  type: T,
  uri: string
): [
  PropertyOrPropertyGroup<T>['value'] | undefined,
  (value: PropertyOrPropertyGroup<T>['value']) => void,
  PropertyOrPropertyGroup<T>['metaData'] | undefined
] {
  const luaApi = useOpenSpaceApi();
  const prop = useStoredProperty(type, uri);
  useSubscribeToProperty(uri);

  // Throttle outgoing writes at ~60fps, matching WebGui, so dragging a slider does not
  // flood the socket.
  const setValue = useThrottledCallback((value: PropertyOrPropertyGroup<T>['value']) => {
    luaApi?.setPropertyValueSingle(uri, value);
  }, 1000 / 60);

  return [prop?.value, setValue, prop?.metaData];
}
