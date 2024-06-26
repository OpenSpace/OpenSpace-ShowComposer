//ignore ts errors for this file as well es lint typescript errors
// @ts-ignore
// @ts-nocheck
export const InterestingTag = 'GUI.Interesting';

export const flattenPropertyTree = (propertyOwner, baseUri? = null) => {
  let propertyOwners = [];
  let properties = [];
  const groups = {};

  propertyOwner.subowners.forEach((subowner) => {
    const uri = baseUri
      ? `${baseUri}.${subowner.identifier}`
      : subowner.identifier;

    propertyOwners.push({
      uri,
      identifier: subowner.identifier,
      name: subowner.guiName,
      properties: subowner.properties.map((p) => p.Description.Identifier),
      subowners: subowner.subowners.map((p) => `${uri}.${p.identifier}`),
      tags: subowner.tag,
      description: subowner.description,
    });
    const childData = flattenPropertyTree(subowner, uri);
    propertyOwners = propertyOwners.concat(childData.propertyOwners);
    properties = properties.concat(childData.properties);
  });

  propertyOwner.properties.forEach((property) => {
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
    groups,
  };
};

// findByUri = (uri, propertyOwners) => {
//   return propertyOwners.find((p) => p.uri === uri);
// };

export const findFavorites = (propertyOwners) => {
  function hasInterestingTag(uri) {
    console.log(propertyOwners[uri]);
    return propertyOwners
      .find((p) => p.uri === uri)
      ?.tags.some((tag) => tag.includes(InterestingTag));
  }
  // Find interesting nodes
  const scene = propertyOwners.find((p) => p.uri === 'Scene');
  const uris = scene ? scene.subowners : [];
  console.log(uris);
  const urisWithTags = uris.filter((uri) => hasInterestingTag(uri));
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
  Renderables: {
    regex: /Scene\.(.*?)\.Renderable.Enabled/,
  },
  Fadable: {
    regex: /Scene\.(.*?)\.Fade/,
  },
  TriggerProperty: {
    regex: /Scene\.(.*?)\.Renderable.Color/,
  },
};

export const getRenderables = (properties, propertyType) => {
  console.log(propertyType);
  console.log(RegexLibrary);
  let regex = RegexLibrary[propertyType].regex;

  let values = Object.values(properties);

  let renderables = values
    .filter(
      (p) =>
        regex.exec(p.uri) &&
        p.description.Type === 'FloatProperty' &&
        !p.description.MetaData.IsReadOnly,
    )
    .sort((a, b) => a.uri.localeCompare(b.uri))
    //reduce this array into an object with the key being the value of the regex match and the value is the property
    .reduce((acc, p) => {
      let key = regex.exec(p.uri)[1];
      acc[key] = p;
      return acc;
    });

  // .map((p) => {
  //   let key = regex.exec(p.uri)[1];
  //   return { `${key}` : p };
  // });
  // return;
  return renderables;
  // let switches = values

  //   .filter(
  //     (p) =>
  //       p.description.Type === 'BoolProperty' &&
  //       !p.description.MetaData.IsReadOnly &&
  //       regex.exec(p.uri),
  //   )
  //   .sort((a, b) => a.uri.localeCompare(b.uri));

  // let floats = values.filter(
  //   (p) =>
  //     p.description.Type === 'FloatProperty' &&
  //     !p.description.MetaData.IsReadOnly &&
  //     regex.exec(p.uri),
  // );

  // let triggers = values
  //   .filter(
  //     (p) =>
  //       p.description.Type === 'TriggerProperty' &&
  //       !p.description.MetaData.IsReadOnly &&
  //       regex.exec(p.uri),
  //   )
  //   .sort((a, b) => a.uri.localeCompare(b.uri));

  // return { switches, floats, triggers };
};
