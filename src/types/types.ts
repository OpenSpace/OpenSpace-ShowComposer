export interface NavigationState {
  Anchor: string; // The identifier of the anchor node
  Position: [number, number, number]; // The position of the camera relative to the anchor node, expressed in meters in the specified reference frame
  Aim?: string; // The identifier of the aim node, if used
  Pitch?: number; // The pitch angle in radians. Positive angle means pitching camera upwards
  ReferenceFrame?: string; // The identifier of the scene graph node to use as reference frame. If not specified, this will be the same as the anchor
  Timestamp?: number | string; // The timestamp for when the navigation state was captured or is valid. Specified either as seconds past the J2000 epoch, or as a date string in ISO 8601 format: ‘YYYY MM DD HH:mm:ss.xxx’
  Up?: [number, number, number]; // The up vector expressed in the coordinate system of the reference frame
}
