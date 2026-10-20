export function getFadeTargetIdentifier(propertyUri: string): string {
  if (propertyUri.startsWith('ScreenSpace.') && propertyUri.endsWith('.Fade')) {
    return propertyUri.slice(0, -'.Fade'.length);
  }
  if (propertyUri.endsWith('.Opacity')) {
    throw new Error(
      'Opacity properties are not valid fade targets. Use the corresponding .Fade property instead.'
    );
  }
  return propertyUri;
}
