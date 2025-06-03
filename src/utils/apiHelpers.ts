//ignore ts errors for this file as well es lint typescript errors
// @ts-ignore

import { EnginePropertyVisibilityKey } from '@/store/apiStore';
import { PropertyVisibilityNumber } from '@/types/enums';
import { AnyProperty } from '@/types/Property/property';
import { OpenSpacePropertyOwner, PropertyOwner } from '@/types/types';
// import { PropertyOwner, PropertyOwners } from '@/types/types';
export const InterestingTag = '';

// type PropertyVisibility = keyof typeof PropertyVisibilityNumber;

// export interface Property {
//   metaData: {
//     description: string;
//     type?: ActionType;
//     isReadOnly: boolean;
//     visibility: PropertyVisibility;
//     additionalData?: {};
//   };
//   value: string | number | boolean;
//   uri: string;
// }

export const flattenPropertyTree = (propertyOwner: OpenSpacePropertyOwner) => {
  let propertyOwners: PropertyOwner[] = [];
  let properties: AnyProperty[] = [];

  if (propertyOwner.uri) {
    propertyOwners.push({
      uri: propertyOwner.uri,
      identifier: propertyOwner.identifier,
      name: propertyOwner.guiName ?? propertyOwner.identifier,
      properties: propertyOwner.properties.map((p) => p.uri),
      subowners: propertyOwner.subowners.map((p) => p.uri),
      tags: propertyOwner.tag,
      description: propertyOwner.description
    });
  }

  // Recursively flatten subowners of incoming propertyOwner
  propertyOwner.subowners.forEach((subowner) => {
    const childData = flattenPropertyTree(subowner);

    propertyOwners = propertyOwners.concat(childData.propertyOwners);
    properties = properties.concat(childData.properties);
  });

  propertyOwner.properties.forEach((property) => {
    properties.push(property);
  });

  return { propertyOwners, properties };
};

//regex for finding something in this format "Scene.<SceneName>.Fade" exactly, nothing trailing Fade
// const regex = /Scene\.(.*?)\.Fade/;
// const renderables = values
//   .filter((p) => regex.exec(p.uri))
//   .sort((a, b) => a.uri.localeCompare(b.uri))
//   .reduce((acc, p) => {
//     let key = regex.exec(p.uri)[1];
//     acc[key] = p;
//     return acc;
//   });

const RegexLibrary = {
  Renderable: {
    regex: /^Scene\.(.*?)/
  },
  Fadable: {
    regex: /Scene\.(.*?)\.Fade/
  },
  Opacity: {
    regex: /Scene\.(.*?)\.Opacity/
  },
  TriggerProperty: {
    regex: /Scene\.(.*?)\.Renderable.Color/
  },
  SettingsProperty: {
    // has any of these strings as the rootModules
    regex:
      /^(Scene\.(.*?)|Modules|NavigationHandler|Dashboard|InteractionMonitor|LuaConsole|OpenSpaceEngine|ParallelPeer|RenderEngine|ScriptScheduler|SessionRecording|TimeManager)/
  }
};

type PropertyType = keyof typeof RegexLibrary;

export const getRenderables: (
  properties: AnyProperty[],
  propertyType: PropertyType
) => Record<string, AnyProperty> = (properties, propertyType) => {
  const { regex } = RegexLibrary[propertyType];
  const values = Object.values(properties);
  const renderables: Record<string, AnyProperty> = values
    .filter((p: AnyProperty) => {
      return (
        regex.exec(p.uri) &&
        // p.description.Type === 'FloatProperty' &&
        !p.metaData.isReadOnly
      );
    })
    .sort((a, b) => a.uri?.localeCompare(b.uri))
    //reduce this array into an object with the key being the value of the regex match and the value is the property
    .reduce((acc: Record<string, AnyProperty>, p: AnyProperty) => {
      // let key = regex.exec(p.uri)[1];
      const key = p.uri;
      acc[key] = p;
      return acc;
    }, {});

  return renderables;
};

type ActionType = 'Bool' | 'Number' | 'Trigger';

const actionTypes = {
  Bool: 'BoolProperty',
  Number: 'FloatProperty',
  Trigger: 'TriggerProperty'
} as const;

export const getActionSceneNodes = (
  properties: AnyProperty[],
  type: ActionType
): Record<string, AnyProperty> => {
  const { regex } = RegexLibrary['SettingsProperty'];
  console.log('ACTION TYPE', type);
  console.log('ACTION TYPES', actionTypes[type]);
  return (
    properties
      .filter(
        (p) =>
          regex.exec(p.uri) &&
          p.metaData.type === actionTypes[type] &&
          !p.metaData.isReadOnly
      )
      .sort((a, b) => a.uri?.localeCompare(b.uri))
      .sort((a, b) => a.uri?.localeCompare(b.uri))
      //reduce this array into an object with the key being the value of the regex match and the value is the property
      .reduce((acc: Record<string, AnyProperty>, p: AnyProperty) => {
        // let key = regex.exec(p.uri)[1];
        const key = p.uri;
        acc[key] = p;
        return acc;
      }, {})
  );
};

// functio

export function getStringBetween(
  fullString: string,
  startString: string,
  endString: string
): string {
  const startIndex = fullString.indexOf(startString);
  if (startIndex === -1) {
    return ''; // startString not found
  }

  // Adjust startIndex to get the substring after startString
  const searchStartIndex = startIndex + startString.length;
  const endIndex = fullString.indexOf(endString, searchStartIndex);
  if (endIndex === -1) {
    return ''; // endString not found
  }

  // Extract the string between
  return fullString.substring(searchStartIndex, endIndex);
}

export function formatName(name: string) {
  if (!name) return '';
  return name
    .replace(/Scene.|.Renderable|.Opacity/g, '')
    .replace(/.Fade/g, '')
    .replace(/\./g, ' > ')
    .replace(/(?<=[a-z])([A-Z])/g, ' $1')
    .trim();
}

// Returns whether a property should be visible in the gui
export function isPropertyVisible(property: AnyProperty, visibility: number | undefined) {
  if (!visibility || visibility === undefined) return false;

  const propertyVisibility = PropertyVisibilityNumber[property.metaData.visibility];

  return (visibility as number) >= propertyVisibility;
}
