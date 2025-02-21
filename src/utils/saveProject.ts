import { useSettingsStore } from '@/store';
import { useBoundStore } from '@/store/boundStore';

//save out the store to a json file that is saved to drive
export const saveProject = () => {
  const settingsStore = useSettingsStore.getState();
  const boundStore = useBoundStore.getState();
  const store = { boundStore, settingsStore };
  const storeString = JSON.stringify(store);
  fetch('/api/projects/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: storeString,
  });
};

export const loadStore = async () => {
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

export const exportProject = () => {
  const settingsStore = useSettingsStore.getState();
  const boundStore = useBoundStore.getState();
  const store = { boundStore, settingsStore };
  const storeString = JSON.stringify(store);
  console.log('storeString', storeString);
  fetch('/api/package', {
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
  const response = await fetch('/api/projects');
  const projects = await response.json();
  console.log('projects', projects);
  return projects;
};
export const loadProject = async (filePath: string) => {
  try {
    const response = await fetch(filePath);
    const project = await response.json();
    return project;
  } catch (error) {
    console.error('Error loading project:', error);
    return null;
  }
};
