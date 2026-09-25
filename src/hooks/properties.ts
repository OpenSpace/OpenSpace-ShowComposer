import { useEffect } from 'react';
import { useThrottledCallback } from '@mantine/hooks';

import { useOpenSpaceApi } from '@/api/hooks';
import { useOpenSpaceApiStore } from '@/store/apiStore';
import { usePropertyStore } from '@/store/propertyStore';
import { ConnectionStatus } from '@/types/enums';
import { PropertyOrPropertyGroup, PropertyTypeKey } from '@/types/Property/property';
import { PropertyGroupsRuntime } from '@/types/Property/propertyGroups';

/**
 * Checks whether a stored property's actual type matches an expected type (or, if the
 * expected type is a property group, whether it's one of that group's member types).
 *
 * @param type The expected property (or property group) type.
 * @param prop The stored property to validate. Passing undefined is always valid (there's
 * nothing to check yet).
 * @returns `true` if `prop` is undefined, or the prop type matches `type`.
 */
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

/**
 * Read a property from the store, validated against the expected type.
 *
 * @param type The expected property (or property group) type.
 * @param uri The property's URI.
 * @returns The property, or undefined if it's not yet in the store.
 * @throws If the stored property exists but its type doesn't match `type`.
 */
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

// How often a property subscription is allowed to update.
const SubscriptionThrottleMs = 50;

/**
 * Subscribe to a property.
 *
 * @param uri The property's URI.
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
 * Read the current value of a property from the store.
 *
 * @param type The expected property (or property group) type.
 * @param uri The property's URI.
 * @returns The property's value, or undefined when the property is unknown (e.g. before its
 * first update).
 */
export function usePropertyValue<T extends PropertyTypeKey>(
  type: T,
  uri: string
): PropertyOrPropertyGroup<T>['value'] | undefined {
  return useStoredProperty(type, uri)?.value;
}

/**
 * Read the metadata of a property from the store.
 *
 * @param type The expected property (or property group) type.
 * @param uri The property's URI.
 * @returns The property's metadata, or undefined when the property is unknown.
 */
export function usePropertyMetaData<T extends PropertyTypeKey>(
  type: T,
  uri: string
): PropertyOrPropertyGroup<T>['metaData'] | undefined {
  return useStoredProperty(type, uri)?.metaData;
}

/**
 * Subscribe to a property and returns its value, a throttled setter that pushes to
 * OpenSpace, and its metadata. Mirrors OpenSpace-WebGui's useProperty.
 *
 * @param type The expected property (or property group) type.
 * @param uri The property's URI.
 * @returns A `[value, setValue, metaData]` tuple.
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
