import { LayoutBase } from '@/store/ComponentTypes';

export function calculateTotalLayoutWidth(
  layout: LayoutBase,
  numberOfChildren: number
): number {
  const padding = layout.padding || 10;
  const childWidth = layout.childWidth || 0;
  return (numberOfChildren + 1) * (childWidth + padding) + padding;
}

export function calculateTotalLayoutHeight(
  layout: LayoutBase,
  numberOfChildren: number
): number {
  const padding = layout.padding || 10;
  const childHeight = layout.childHeight || 0;
  return (numberOfChildren + 1) * (childHeight + padding) + padding;
}

export function calculateGridIndex(
  x: number,
  y: number,
  layout: LayoutBase
): { gridIndex: number; gridPosition: { x: number; y: number } } {
  const { rows, columns, childWidth, childHeight, padding } = layout;

  // Calculate the effective position within the grid, accounting for padding
  const effectiveX = x - padding + childWidth / 2.0;
  const effectiveY = y - padding + childHeight / 2.0;
  // Calculate the column and row indices
  const columnIndex = Math.floor(effectiveX / (childWidth + padding));
  const rowIndex = Math.floor(effectiveY / (childHeight + padding));

  // Ensure indices are within bounds
  const clampedColumnIndex = Math.max(0, Math.min(columns - 1, columnIndex));
  const clampedRowIndex = Math.max(0, Math.min(rows - 1, rowIndex));

  // Calculate the grid index
  const gridIndex = clampedRowIndex * columns + clampedColumnIndex;

  // Calculate the top-left position of the grid cell
  const gridPosition = {
    x: padding + clampedColumnIndex * (childWidth + padding),
    y: padding + clampedRowIndex * (childHeight + padding)
  };

  return { gridIndex, gridPosition };
}
