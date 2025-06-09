//function to round to nearest increment
export function roundToNearest(value: number, increment: number): number {
  return Math.round(value / increment) * increment;
}

export function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object
      ? RecursivePartial<T[P]>
      : T[P];
};

export function restrictNumbersToDecimalPlaces<T>(
  obj: T,
  decimalPlaces: number
): RecursivePartial<T> {
  // Helper function to format numbers to specified decimal places
  const formatNumber = (n: number, places: number): number => {
    return parseFloat(n.toFixed(places));
  };

  // Recursively process the object
  const processObject = (item: RecursivePartial<T>): void => {
    for (const key in item) {
      if (typeof item[key] === 'number') {
        // Format number to specified decimal places
        (item[key] as any) = formatNumber(item[key] as number, decimalPlaces);
      } else if (item[key] !== null && typeof item[key] === 'object') {
        // Recursively process nested objects and arrays
        processObject(item[key] as RecursivePartial<T>);
      }
    }
  };

  // Clone the object to avoid mutating the original
  const clonedObj: T = JSON.parse(JSON.stringify(obj));
  processObject(clonedObj as RecursivePartial<T>);

  return clonedObj as RecursivePartial<T>;
}
