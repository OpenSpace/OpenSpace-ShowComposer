import { AnyProperty } from './Property/property';
import { RecordingState } from './enums';
export type Uri = string;
export type Identifier = string;
export const RecordingsFolderKey = '${RECORDINGS}/';
export interface NavigationState {
  Anchor: string; // The identifier of the anchor node
  Position: [number, number, number]; // The position of the camera relative to the anchor node, expressed in meters in the specified reference frame
  Aim?: string; // The identifier of the aim node, if used
  Pitch?: number; // The pitch angle in radians. Positive angle means pitching camera upwards
  ReferenceFrame?: string; // The identifier of the scene graph node to use as reference frame. If not specified, this will be the same as the anchor
  Timestamp?: number | string; // The timestamp for when the navigation state was captured or is valid. Specified either as seconds past the J2000 epoch, or as a date string in ISO 8601 format: ‘YYYY MM DD HH:mm:ss.xxx’
  Up?: [number, number, number]; // The up vector expressed in the coordinate system of the reference frame
}
export interface ErrorLog {
  category: string;
  dateStamp: string;
  level: number;
  message: string;
  timeStamp: string;
}
export interface OpenSpaceTimeState {
  time?: string;
  timeCapped?: string;
  targetDeltaTime?: number;
  deltaTime?: number;
  isPaused?: boolean;
  hasNextStep?: boolean;
  hasPrevStep?: boolean;
  nextStep?: number;
  prevStep?: number;
  deltaTimeSteps?: number[];
}
export interface SessionRecordingSettings {
  recordingFileName: string;
  format: 'Ascii' | 'Binary';
  overwriteFile: boolean;
}

export interface SessionRecordingState {
  files: string[];
  state: RecordingState;
  settings: SessionRecordingSettings;
}
export interface CameraState {
  latitude: number | undefined;
  longitude: number | undefined;
  altitude: number | undefined;
  altitudeUnit: string | undefined;
}
export interface ProfileState {
  initalized: boolean;
  uiPanelVisibility: Record<string, boolean>;
  markNodes: Identifier[];
  name: string | undefined;
  author: string | undefined;
  description: string | undefined;
  license: string | undefined;
  url: string | undefined;
  version: string | undefined;
  filePath: string;
}

export interface Action {
  Identifier: string;
  GuiPath: string;
  Name: string;
  IsLocal: boolean;
  Documentation: string;
  Color?: [number, number, number, number]; // rgba color, [0, 1]
}

export type OpenSpacePropertyOwner = {
  description: string;
  guiName: string;
  identifier: Identifier;
  properties: AnyProperty[];
  subowners: OpenSpacePropertyOwner[];
  tag: string[];
  uri: Uri;
};

export interface Properties {
  [key: Uri]: AnyProperty | undefined;
}
export interface PropertyOwner {
  description: string;
  name: string;
  identifier: Identifier;
  properties: Uri[];
  subowners: Uri[];
  tags: string[];
  uri: Uri;
}

export interface PropertyOwners {
  [key: Uri]: PropertyOwner | undefined;
}
