import { Component, LayoutBase } from '@/store/componentsStore';

interface LayoutDimensions {
  width: number;
  height: number;
  x: number;
  y: number;
}

export function calculateRowComponentDimensions(
  layout: LayoutBase,
  componentIndex: number,
): LayoutDimensions {
  return {
    width: layout.height - 30,
    height: layout.height - 30,
    x: layout.height * componentIndex,
    y: 5,
  };
}

export function calculateColumnComponentDimensions(
  layout: LayoutBase,
  componentIndex: number,
): LayoutDimensions {
  return {
    width: layout.width - 20,
    height: layout.width - 20,
    x: 5,
    y: componentIndex * layout.width,
  };
}

export function calculateGridComponentDimensions(
  //   layout: LayoutBase,
  componentIndex: number,
  minWidth: number,
  minHeight: number,
  totalComponents: number,
): LayoutDimensions {
  const cols = Math.ceil(Math.sqrt(totalComponents));
  const row = Math.floor(componentIndex / cols);
  const col = componentIndex % cols;

  return {
    width: Math.max(200, minWidth),
    height: Math.max(200, minHeight),
    x: col * 220 + 10,
    y: row * 220 + 10,
  };
}

export function calculateComponentDimensions(
  layout: LayoutBase,
  componentIndex: number,
  component: Component,
  totalComponents: number,
): LayoutDimensions {
  switch (layout.type) {
    case 'row':
      return calculateRowComponentDimensions(layout, componentIndex);
    case 'column':
      return calculateColumnComponentDimensions(layout, componentIndex);
    case 'grid':
      return calculateGridComponentDimensions(
        // layout,
        componentIndex,
        component.minWidth,
        component.minHeight,
        totalComponents,
      );
    default:
      throw new Error(`Unknown layout type: ${layout.type}`);
  }
}

export function calculateTotalLayoutWidth(
  components: Record<string, Component>,
  layout: LayoutBase,
): number {
  return layout.children.reduce((acc, childId) => {
    const component = components[childId];
    return acc + (component ? component.width + 30 : 0);
  }, 0);
}

export function calculateLayoutDimensions(
  layout: LayoutBase,
  components: Record<string, Component>,
): { width: number; height?: number } {
  switch (layout.type) {
    case 'row':
      return {
        width: layout.children.reduce((acc, childId) => {
          const component = components[childId];
          return acc + (component ? component.width + 30 : 0);
        }, 0),
      };
    case 'column':
      return {
        width: layout.width,
        height: layout.children.length * layout.width + 30,
      };
    case 'grid':
      const cols = Math.ceil(Math.sqrt(layout.children.length));
      return {
        width: cols * 220 + 10,
        height: Math.ceil(layout.children.length / cols) * 220 + 10,
      };
    default:
      return { width: layout.width };
  }
}
