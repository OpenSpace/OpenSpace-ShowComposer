import { loadProjectArchive, packageProject, saveProjectStore } from '@/api/showbuilder';
import { useSettingsStore } from '@/store';
import { useBoundStore } from '@/store/boundStore';

// Project save/load/export operations that involve app state (the Zustand stores) or the
// browser (file-picker dialogs, downloads). The actual backend HTTP lives in the
// showbuilder client (@/api/showbuilder); this module is only the glue around it.

/**
 * Saves the current state of the stores as a project on the backend.
 *
 * @returns Resolves to `true` when the save succeeds.
 * @throws Re-throws (after logging) if the backend save fails.
 */
export async function saveProject() {
  try {
    const settingsStore = useSettingsStore.getState();
    const boundStore = useBoundStore.getState();
    return await saveProjectStore({ boundStore, settingsStore });
  } catch (error) {
    console.error('Error saving project:', error);
    throw error; // Re-throw to let the caller handle it
  }
}

/**
 * Opens a file dialog for a local `.json` project file and parses it. No backend involved.
 *
 * @returns A promise that resolves with the parsed project store, or rejects if no file is
 * chosen or the file isn't valid JSON.
 */
export async function loadStore() {
  return new Promise((resolve, reject) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          if (e.target?.result) {
            try {
              const store = JSON.parse(e.target.result as string);
              resolve(store);
            } catch (error: unknown) {
              reject(
                new Error(
                  'Failed to parse JSON: ' +
                    (error instanceof Error ? error.message : String(error))
                )
              );
            }
          }
        };
        reader.readAsText(file);
      } else {
        reject(new Error('No file selected'));
      }
    };
    fileInput.click();
  });
}

/**
 * Opens file dialogs to pick a `.json` project file plus its image files, then uploads them
 * to the backend together.
 *
 * @returns A promise that resolves with the parsed project store, or rejects if no file is
 * chosen or the upload fails.
 */
export async function loadStoreImageSeperately() {
  return new Promise((resolve, reject) => {
    const jsonInput = document.createElement('input');
    jsonInput.type = 'file';
    jsonInput.accept = '.json'; // Accept JSON files

    const imageInput = document.createElement('input');
    imageInput.type = 'file';
    imageInput.accept = 'image/*'; // Accept image files
    imageInput.multiple = true; // Allow multiple image uploads

    jsonInput.onchange = async (e) => {
      const jsonFile = (e.target as HTMLInputElement).files?.[0];
      if (jsonFile) {
        const formData = new FormData();
        formData.append('projectFile', jsonFile); // Append the JSON file

        // Handle image uploads
        const imageFiles = imageInput.files;
        if (imageFiles) {
          for (let i = 0; i < imageFiles.length; i++) {
            formData.append('images', imageFiles[i]); // Append each image file
          }
        }

        try {
          const store = await loadProjectArchive(formData);
          resolve(store);
        } catch (error: unknown) {
          reject(
            new Error(
              'Error loading project: ' +
                (error instanceof Error ? error.message : String(error))
            )
          );
        }
      } else {
        reject(new Error('No JSON file selected'));
      }
    };

    // Trigger the JSON file input
    jsonInput.click();

    // Trigger the image file input after the JSON file is selected
    jsonInput.onchange = () => {
      imageInput.click();
    };
  });
}

/**
 * Opens a file dialog to pick a `.zip` project archive and uploads it to the backend.
 *
 * @returns A promise that resolves with the parsed project store, or rejects if no file is
 * chosen or the upload fails.
 */
export async function loadStoreToServer() {
  return new Promise((resolve, reject) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.zip'; // Accept ZIP files
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const formData = new FormData();
        formData.append('file', file); // Append the ZIP file

        try {
          const store = await loadProjectArchive(formData);
          resolve(store);
        } catch (error: unknown) {
          reject(
            new Error(
              'Error loading project: ' +
                (error instanceof Error ? error.message : String(error))
            )
          );
        }
      } else {
        reject(new Error('No file selected'));
      }
    };
    fileInput.click();
  });
}

/**
 * Packages the current project and triggers a browser download of the resulting `.zip`.
 */
export function exportProject() {
  const settingsStore = useSettingsStore.getState();
  const boundStore = useBoundStore.getState();
  packageProject({ boundStore, settingsStore })
    .then((blob) => {
      // Create download link. The anchor must be attached to the DOM, and the object
      // URL must NOT be revoked synchronously right after click - otherwise the
      // browser aborts the download before it has read the blob, producing a 0-byte file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${settingsStore.projectName.replace(/ /g, '_')}-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    })
    .catch((error) => {
      console.error('Error exporting project:', error);
    });
}
