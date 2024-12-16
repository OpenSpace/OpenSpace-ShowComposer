import { useComponentStore, usePositionStore, useSettingsStore } from '@/store';
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
  a.download = 'store.json';
  a.click();
};

//open local json file and load store from a json file
export const loadStore = async () => {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.json';
  fileInput.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target?.result) {
          const store = JSON.parse(e.target.result as string);
          //   console.log(store);
          useBoundStore.setState(store.componentStore);
          // useComponentStore.setState(store.componentStore);
          useSettingsStore.setState(store.settingsStore);
          // usePositionStore.setState(store.positionStore);
        }
      };
      reader.readAsText(file);
    }
  };
  fileInput.click();
};
