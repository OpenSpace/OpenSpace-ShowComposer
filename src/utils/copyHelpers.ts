import basePath from './basePath';

type CopyData = {
  [component: string]: {
    [key: string]: string;
  };
};

let typedCopyData: CopyData = {};
const loadCopyData = async () => {
  const response = await fetch(`${basePath}copy.json`);
  if (response.ok) {
    typedCopyData = await response.json();
  } else {
    console.error('Failed to load copy.json');
  }
};

// Call loadCopyData to load the data when the app starts
loadCopyData();
export const getCopy = (component: string, key: string): string => {
  if (typedCopyData[component] && typedCopyData[component][key]) {
    return typedCopyData[component][key];
  }
  return key; // Return the key itself if not found
};
