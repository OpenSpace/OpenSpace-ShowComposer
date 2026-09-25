import { BoundStoreState } from '@/store/boundStore';
import { SettingsStoreState } from '@/store/settingsStore';
import { basePath } from '@/utils/basePath';

// One file to catch all calls to the showbuilder backend api. The base path is the same for both dev and production,
// in dev mode the base path is "/showcomposer/" and in production the dist folder is served in a folder called "showcomposer"
// which gives the same result.

/**
 * Builds a full URL for a backend route, relative to the app's base path.
 *
 * @param path - The route path, without a leading slash (e.g. `'api/projects'`).
 * @returns The base-path-relative URL (e.g. `'/showcomposer/api/projects'`).
 */
function backendUrl(path: string): string {
  return `${basePath}${path}`;
}

/**
 * Turns a base-path-relative path returned by the backend into a usable URL. The backend hands
 * back paths starting with a slash like `'/uploads/foo.png'`, we need to add the base path
 * to resolve them.
 *
 * @param serverPath - A path from the backend (e.g. `'/uploads/foo.png'`).
 * @returns The path prefixed with the base path (e.g. `'/showcomposer/uploads/foo.png'`).
 */
function resourceUrl(serverPath: string): string {
  return `${basePath.replace(/\/$/, '')}${serverPath}`;
}

export interface Project {
  projectName: string;
  filePath: string;
  lastModified: string;
  created: string;
}

// The data properties of a store's state: the keys whose values aren't functions. These are
// what survive JSON serialization - the store's action functions can't be serialized, so
// they're excluded when a project is saved.
type SerializableState<T> = {
  [K in keyof T as T[K] extends (...args: never[]) => unknown ? never : K]: T[K];
};

// Saved project consists of the bound store (pages, layouts, positions, components) and the settings
// store (present mode, page size, etc).
export interface SavedProject {
  boundStore: Partial<SerializableState<BoundStoreState>>;
  settingsStore: Partial<SerializableState<SettingsStoreState>>;
}

export interface ImportConfirmationResult {
  success: boolean;
  message?: string;
  projectData?: unknown;
}

/**
 * Saves a project on the backend.
 *
 * @param store - The serializable current state of the store to save.
 * @returns Resolves to `true` when the save succeeds.
 * @throws If the backend responds with a non-OK status.
 */
export async function saveProjectStore(store: SavedProject): Promise<boolean> {
  const response = await fetch(backendUrl('api/projects/save'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(store)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to save project');
  }
  return true;
}

/**
 * Uploads a project archive - either a `.zip`, or a `.json` plus its image files - and
 * returns the store the backend extracts from it.
 *
 * @param formData - Form data containing the archive (and any images).
 * @returns Resolves to the parsed project store.
 * @throws If the backend responds with a non-OK status.
 */
export async function loadProjectArchive(formData: FormData): Promise<unknown> {
  const response = await fetch(backendUrl('api/projects/load'), {
    method: 'POST',
    body: formData
  });
  if (!response.ok) {
    throw new Error('Failed to upload files');
  }
  return response.json();
}

/**
 * Confirms or cancels a staged project import.
 *
 * @param confirm - `true` to confirm the import, `false` to cancel it.
 * @param tempId - The temporary id of the staged import.
 * @returns The backend's confirmation result.
 * @throws If the backend responds with a non-OK status.
 */
export async function confirmStoreImport(
  confirm: boolean,
  tempId: string
): Promise<ImportConfirmationResult> {
  const response = await fetch(backendUrl('api/projects/confirm-import'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tempId, confirm })
  });
  if (!response.ok) {
    throw new Error('Failed to confirm store import');
  }
  return response.json();
}

/**
 * Packages a project's current store state into an export blob.
 *
 * @param store - The store to export.
 * @returns The store as a zipped `Blob`.
 * @throws If the backend responds with a non-OK status.
 */
export async function packageProject(store: SavedProject): Promise<Blob> {
  const response = await fetch(backendUrl('api/package'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(store)
  });
  if (!response.ok) {
    throw new Error(`Export failed: ${response.status}`);
  }
  return response.blob();
}

/**
 * Lists the projects saved on the backend.
 *
 * @returns An array of saved projects.
 * @throws If the backend responds with a non-OK status.
 */
export async function loadProjects(): Promise<Project[]> {
  const response = await fetch(backendUrl('api/projects'));
  if (!response.ok) {
    throw new Error('Failed to load projects');
  }
  return response.json();
}

/**
 * Loads a single saved project by its file path.
 *
 * @param filePath - The project's path, as provided by {@link loadProjects}.
 * @returns The loaded project's current state.
 * @throws If the backend responds with a non-OK status.
 */
export async function loadProject(filePath: string): Promise<SavedProject> {
  const response = await fetch(backendUrl(filePath));
  if (!response.ok) {
    throw new Error('Failed to load project');
  }
  return response.json();
}

/**
 * Fetches the gallery images available on the backend.
 *
 * @returns Resolves to the image URLs ({@link resourceUrl}s).
 * @throws If the backend responds with a non-OK status.
 */
export async function fetchGalleryImages(): Promise<string[]> {
  const response = await fetch(backendUrl('api/images'));
  if (!response.ok) {
    throw new Error('Error fetching gallery images');
  }
  const data = await response.json();
  return data.images.map((image: string) => resourceUrl(image));
}

/**
 * Uploads a single image to the backend.
 *
 * @param file - The image file to upload.
 * @returns Resolves to the {@link resourceUrl} of the uploaded image's path.
 * @throws If the backend responds with a non-OK status.
 */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);
  const response = await fetch(backendUrl('api/upload'), {
    method: 'POST',
    body: formData
  });
  if (!response.ok) {
    throw new Error('Failed to save image');
  }
  const data = await response.json();
  // windows paths come back with backslashes, swap them so the url is valid
  const normalizedFilePath = data.filePath.replace(/\\/g, '/');
  return resourceUrl(normalizedFilePath);
}
