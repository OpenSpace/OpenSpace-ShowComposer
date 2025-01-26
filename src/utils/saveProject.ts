import { useSettingsStore } from '@/store';
import { useBoundStore } from '@/store/boundStore';

//save out the store to a json file that is saved to drive
export const saveStore = () => {
  // const componentStore = useComponentStore.getState();
  const settingsStore = useSettingsStore.getState();

  // const positionStore = usePositionStore.getState();
  const componentStore = useBoundStore.getState();
  const store = { componentStore, settingsStore };
  const storeString = JSON.stringify(store);
  const blob = new Blob([storeString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const date = new Date();
  const timestamp = date.toISOString();

  const filename = `${settingsStore.projectName.replace(
    / /g,
    '_',
  )}_${timestamp}.json`;
  // console.log(filename);
  a.download = filename;
  a.click();
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
