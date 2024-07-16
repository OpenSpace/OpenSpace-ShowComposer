//ignore ts errors for this file as well es lint typescript errors
// @ts-ignore

import { get } from 'http';
// import { isNull } from 'util';

// @ts-nocheck
export const InterestingTag = 'GUI.Interesting';

// interface PropertyRenderable {
//   uri: string;
//   description: {
//     Type?: string; // Optional based on your comment in the code
//     MetaData: {
//       IsReadOnly: boolean;
//     };
//   };
//   type?: string;
// }
export interface Property {
  Description: {
    Identifier: string;
    Type?: ActionType;
  };
  Value: any;
  type?: ActionType;
  uri: string;
  description?: {
    Type?: string; // Optional based on your comment in the code
    MetaData: {
      IsReadOnly: boolean;
    };
  };
}

export interface PropertyOwner {
  identifier?: string;
  guiName?: string;
  properties?: Property[] | string[];
  subowners?: PropertyOwner[] | string[];
  tags?: string[] | string;
  tag?: string;
  description?: {
    Identifier?: string;
    Type?: ActionType;
    MetaData?: { IsReadOnly: boolean };
  };
  value?: string;
  uri?: string;
  name?: string;
}

export const flattenPropertyTree: (
  propertyOwner: PropertyOwner,
  baseUri?: string | null,
) => {
  propertyOwners: PropertyOwner[];
  properties: PropertyOwner[];
} = (
  propertyOwner: PropertyOwner,
  baseUri?: string | null,
): {
  propertyOwners: PropertyOwner[];
  properties: PropertyOwner[];
} => {
  let propertyOwners: PropertyOwner[] = [];

  let properties: PropertyOwner[] = [];
  // const groups = {};

  propertyOwner.subowners?.forEach((subowner: PropertyOwner) => {
    const uri = baseUri
      ? `${baseUri}.${subowner.identifier}`
      : subowner.identifier;

    propertyOwners.push({
      uri,
      identifier: subowner.identifier,
      name: subowner.guiName,
      properties: (subowner.properties as Property[])?.map(
        (p: Property) => p.Description.Identifier,
      ),
      subowners: (subowner.subowners as PropertyOwner[])?.map(
        (p: PropertyOwner) => `${uri}.${p.identifier}`,
      ),
      tags: subowner.tag,
      description: subowner.description,
    } as PropertyOwner);
    const childData = flattenPropertyTree(subowner, uri);
    propertyOwners = propertyOwners.concat(childData.propertyOwners);
    properties = properties.concat(childData.properties);
  });

  (propertyOwner.properties as Property[]).forEach((property: Property) => {
    const uri = property.Description.Identifier;
    properties.push({
      uri,
      description: property.Description,
      value: property.Value,
    });
  });

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
    let sorted = propertyOwners.find((p: PropertyOwner) => p.uri === uri);
    return (sorted?.tags as string[])?.some((tag: string) =>
      tag.includes(InterestingTag),
    );
  }
  // Find interesting nodes
  const scene = propertyOwners.find((p) => p.uri === 'Scene');
  const uris: string[] = scene ? (scene.subowners as string[]) : [];
  // console.log(uris);
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
    regex: /Scene\.(.*?)\.Opacity/,
  },
  TriggerProperty: {
    regex: /Scene\.(.*?)\.Renderable.Color/,
  },
};

type PropertyType = keyof typeof RegexLibrary;

export const getRenderables: (
  properties: Property[],
  propertyType: PropertyType,
) => Record<string, any> = (properties, propertyType) => {
  // console.log(propertyType);
  // console.log(RegexLibrary);
  let regex = RegexLibrary[propertyType].regex;
  let values = Object.values(properties);
  // console.log(values);
  let renderables: Record<string, any> = values
    .filter(
      (p: Property) =>
        regex.exec(p.uri) &&
        // p.description.Type === 'FloatProperty' &&
        !p.description?.MetaData.IsReadOnly,
    )
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
  let regex = RegexLibrary['Renderable'].regex;

  let sortedProps = properties
    .filter(
      (p) =>
        regex.exec(p.uri) &&
        p.description?.Type === actionTypes[type] &&
        !p.description?.MetaData?.IsReadOnly,
      //   p.description.MetaData.Visibility == "User"
    )
    .sort((a, b) => a.uri?.localeCompare(b.uri))
    .reduce((acc: Record<string, Property>, p: Property) => {
      // let key = regex.exec(p.uri)[1];
      let key = p.uri;
      acc[key] = { ...p, type: type };
      return acc;
    }, {});
  return sortedProps;
};

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
