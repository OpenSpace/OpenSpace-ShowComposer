import { useSettingsStore } from '@/store';
import { useBoundStore } from '@/store/boundStore';
import basePath from './basePath';

//save out the store to a json file that is saved to drive
export const saveProject = async () => {
  const settingsStore = useSettingsStore.getState();
  const boundStore = useBoundStore.getState();
  const store = { boundStore, settingsStore };
  const storeString = JSON.stringify(store);
  const response = await fetch(`${basePath}api/projects/save`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: storeString,
  });
  if (response.ok) {
    return true;
  }
  return false;
};

export const loadStore = async () => {
  return new Promise((resolve, reject) => {
    const fileInput = document.createElement('input');
    // fileInput.type = 'folder';
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
              // Assuming you want to set the state in your stores
              // useBoundStore.setState(store.componentStore);
              // useSettingsStore.setState(store.settingsStore);

              // Return the parsed store
              resolve(store);
            } catch (error: any) {
              reject(new Error('Failed to parse JSON: ' + error.message));
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
};

export const loadStoreImageSeperately = async () => {
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
          const response = await fetch(`${basePath}api/projects/load`, {
            method: 'POST',
            body: formData, // Send the JSON file and images to the server
          });

          if (!response.ok) {
            throw new Error('Failed to upload files');
          }

          const store = await response.json(); // Get the parsed store from the server
          resolve(store);
        } catch (error: any) {
          reject(new Error('Error loading project: ' + error.message));
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
};

export const loadStoreToServer = async () => {
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
          const response = await fetch(`${basePath}api/projects/load`, {
            method: 'POST',
            body: formData, // Send the ZIP file to the server
          });

          if (!response.ok) {
            throw new Error('Failed to upload ZIP file');
          }

          const store = await response.json(); // Get the parsed store from the server
          resolve(store);
        } catch (error: any) {
          reject(new Error('Error loading project: ' + error.message));
        }
      } else {
        reject(new Error('No file selected'));
      }
    };
    fileInput.click();
  });
};

export const confirmStoreImport = async (confirm: boolean, tempId: string) => {
  const response = await fetch(`${basePath}api/projects/confirm-import`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tempId, confirm }), // New fields
  });

  if (!response.ok) {
    throw new Error('Failed to confirm store import');
  }
  return await response.json(); // Return the response if needed
};

export const exportProject = () => {
  const settingsStore = useSettingsStore.getState();
  const boundStore = useBoundStore.getState();
  const store = { boundStore, settingsStore };
  const storeString = JSON.stringify(store);
  console.log('storeString', storeString);
  fetch(`${basePath}api/package`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: storeString,
  })
    .then((response) => response.blob())
    .then((blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${settingsStore.projectName.replace(
        / /g,
        '_',
      )}-${Date.now()}.zip`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
};

export interface Project {
  projectName: string;
  filePath: string;
  lastModified: string;
  created: string;
}
export const loadProjects = async () => {
  const response = await fetch(`${basePath}api/projects`);
  const projects = await response.json();
  console.log('projects', projects);
  return projects;
};

export const loadProject = async (filePath: string) => {
  try {
    // console.log('filePath', `/${filePath}`);
    const response = await fetch(`${basePath}${filePath}`);
    const project = await response.json();
    return project;
  } catch (error) {
    console.error('Error loading project:', error);
    return null;
  }
};

export const fetchGalleryImages = async () => {
  const response = await fetch(`${basePath}api/images`);
  if (!response.ok) {
    throw new Error('Error fetching gallery images');
  }
  const data = await response.json();
  // remomve trailing slash from basePath
  const basePathWithoutTrailingSlash = basePath.replace(/\/$/, '');
  return data.images.map(
    (image: any) => `${basePathWithoutTrailingSlash}${image}`,
  );
};

export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file); // Append the file

  const response = await fetch(`${basePath}api/upload`, {
    method: 'POST',
    body: formData, // Send formData
  });
  if (!response.ok) {
    throw new Error('Failed to save image');
  }
  const data = await response.json();
  // console.log('data', data);
  const basePathWithoutTrailingSlash = basePath.replace(/\/$/, '');
  return `${basePathWithoutTrailingSlash}${data.filePath}`;
};
