//ignore ts errors for this file as well es lint typescript errors
// @ts-ignore

import { EnginePropertyVisibilityKey } from '@/store/apiStore';

export const InterestingTag = 'GUI.Interesting';

const PropertyVisibilityNumber = {
  Hidden: 5,
  Developer: 4,
  AdvancedUser: 3,
  User: 2,
  NoviceUser: 1,
  Always: 0,
};

type PropertyVisibility = keyof typeof PropertyVisibilityNumber;

export interface Property {
  metaData: {
    description: string;
    type?: ActionType;
    isReadOnly: boolean;
    visibility: PropertyVisibility;
    additionalData?: {};
  };
  value: string | number | boolean;
  uri: string;
}

export interface PropertyOwner {
  identifier: string;
  guiName: string;
  properties: Property[];
  subowners: PropertyOwner[];
  tag: string[];
  description: string;
  uri: string;
}

export const flattenPropertyTree = (
  propertyOwner: PropertyOwner,
  baseUri?: string | null,
): {
  propertyOwners: PropertyOwner[];
  properties: Property[];
} => {
  let propertyOwners: PropertyOwner[] = [];
  let properties: Property[] = [];
  // const groups = {};

  propertyOwner.subowners?.forEach((subowner: PropertyOwner) => {
    const uri = baseUri
      ? `${baseUri}.${subowner.identifier}`
      : subowner.identifier;

    propertyOwners.push({
      uri,
      identifier: subowner.identifier,
      guiName: subowner.guiName,
      properties: [...subowner.properties],
      subowners: [...subowner.subowners],
      tag: subowner.tag,
      description: subowner.description,
    });
    const childData = flattenPropertyTree(subowner, uri);
    propertyOwners = propertyOwners.concat(childData.propertyOwners);
    properties = properties.concat(childData.properties);
  });

  properties.push(...propertyOwner.properties);

  return {
    // favorites,
    propertyOwners,
    properties,
    // groups,
  };
};

// findByUri = (uri, propertyOwners) => {
//   return propertyOwners.find((p) => p.uri === uri);
// };

export const findFavorites = (propertyOwners: PropertyOwner[]) => {
  function hasInterestingTag(uri: string): boolean {
    let owner = propertyOwners.find((p: PropertyOwner) => p.uri === uri);
    if (!owner) {
      return false;
    }

    return owner.tag.some((tag: string) => tag.includes(InterestingTag));
  }

  // Find interesting nodes
  const scene = propertyOwners.find((p) => p.uri === 'Scene');
  if (!scene) {
    return [];
  }

  const uris: string[] = scene?.subowners.map((owner) => owner.uri);
  const urisWithTags = uris?.filter((uri) => hasInterestingTag(uri));
  const favorites = urisWithTags.map((uri) => ({
    ...propertyOwners.find((p) => p.uri === uri),
    key: uri,
  }));
  return favorites;
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
    regex: /^Scene\.(.*?)/,
  },
  Fadable: {
    regex: /Scene\.(.*?)\.Fade/,
  },
  Opacity: {
    regex: /Scene\.(.*?)\.Opacity/,
  },
  TriggerProperty: {
    regex: /Scene\.(.*?)\.Renderable.Color/,
  },
  SettingsProperty: {
    // has any of these strings as the rootModules
    regex:
      /^(Scene\.(.*?)|Modules|NavigationHandler|Dashboard|InteractionMonitor|LuaConsole|OpenSpaceEngine|ParallelPeer|RenderEngine|ScriptScheduler|SessionRecording|TimeManager)/,
  },
};

type PropertyType = keyof typeof RegexLibrary;

export const getRenderables: (
  properties: Property[],
  propertyType: PropertyType,
) => Record<string, any> = (properties, propertyType) => {
  let regex = RegexLibrary[propertyType].regex;
  let values = Object.values(properties);
  let renderables: Record<string, any> = values
    .filter((p: Property) => {
      return (
        regex.exec(p.uri) &&
        // p.description.Type === 'FloatProperty' &&
        !p.metaData.isReadOnly
      );
    })
    .sort((a, b) => a.uri?.localeCompare(b.uri))
    //reduce this array into an object with the key being the value of the regex match and the value is the property
    .reduce((acc: Record<string, Property>, p: Property) => {
      // let key = regex.exec(p.uri)[1];
      let key = p.uri;
      acc[key] = p;
      return acc;
    }, {});

  return renderables;
};

const actionTypes = {
  Bool: 'BoolProperty',
  Number: 'FloatProperty',
  Trigger: 'TriggerProperty',
};
type ActionType = keyof typeof actionTypes;

export const getActionSceneNodes = (
  properties: Property[],
  type: ActionType,
) => {
  let regex = RegexLibrary['SettingsProperty'].regex;

  let sortedProps = properties
    .filter(
      (p) =>
        regex.exec(p.uri) &&
        p.metaData.type === actionTypes[type] &&
        !p.metaData.isReadOnly,
    )
    .sort((a, b) => a.uri?.localeCompare(b.uri))
    .reduce((acc: Record<string, Property>, p: Property) => {
      // let key = regex.exec(p.uri)[1];
      let key = p.uri;
      acc[key] = {
        ...p,
        metaData: {
          ...p.metaData,
          type: type,
        },
      };
      return acc;
    }, {});
  return sortedProps;
};

// functio

export function normalizeKeys(obj: Record<string, any>): Record<string, any> {
  return Object.keys(obj).reduce(
    (acc, key) => {
      acc[key.toLowerCase()] = obj[key];
      return acc;
    },
    {} as Record<string, any>,
  );
}

export function getStringBetween(
  fullString: string,
  startString: string,
  endString: string,
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
export function isPropertyVisible(
  property: Property,
  visibility: Property | undefined,
) {
  if (!visibility || visibility.value === undefined) return false;

  // console.log(property);

  const propertyVisibility =
    PropertyVisibilityNumber[property.metaData.visibility];

  return (visibility.value as number) >= propertyVisibility;
}

export function isPropertyOwnerVisible(
  propertyOwner: PropertyOwner,
  visibility: Property | undefined,
) {
  if (!visibility || visibility.value === undefined) {
    return false;
  }

  return hasVisibleChildren(propertyOwner, visibility);
}

function hasVisibleChildren(
  propertyOwner: PropertyOwner,
  visibilitySetting: Property | undefined,
) {
  let queue: PropertyOwner[] = [propertyOwner];

  while (queue.length > 0) {
    const currentOwner = queue.shift();

    if (!currentOwner) continue;

    // Check if any of the owner's properties are visible
    if (
      currentOwner.properties?.some((property) =>
        isPropertyVisible(property, visibilitySetting),
      )
    ) {
      return true;
    }

    // Add subowners to the queue for further checking
    if (currentOwner.subowners) {
      queue = queue.concat(currentOwner.subowners as PropertyOwner[]);
    }
  }
}
