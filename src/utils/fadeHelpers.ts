export function getFadeTargetIdentifier(propertyUri: string): string {
  if (propertyUri.startsWith('ScreenSpace.') && propertyUri.endsWith('.Fade')) {
    return propertyUri.slice(0, -'.Fade'.length);
  }
  if (propertyUri.endsWith('.Opacity')) {
    return propertyUri.slice(0, -'.Opacity'.length);
  }
  return propertyUri;
}

export function getFadeStatePropertyUri(target: string): string {
  if (target.endsWith('.Fade')) {
    return target;
  }
  if (target.endsWith('.Opacity')) {
    return target.slice(0, -'.Opacity'.length) + '.Fade';
  }
  return `${target}.Fade`;
}
