//function to round to nearest increment
export function roundToNearest(value: number, increment: number): number {
  return Math.round(value / increment) * increment;
}

export function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}
