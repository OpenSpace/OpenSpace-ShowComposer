// All z indices for the canvas
export const zIndex = {
  // Layers inside a single canvas widget
  body: 0,
  handleSection: 1, // left/right sections in the drag strip, above the body
  disabledOverlay: 50, // overlay shown while disconnected
  dragHandle: 99, // the drag-handle strip at the top

  // How whole draggables stack against each other on the canvas
  page: 0, // the adjustable page rectangle, the canvas backdrop behind all widgets
  pageControl: 100, // the page's lock button, above its drag handle
  widgetRaised: 999, // a widget lifted while dragged or selected
  layout: 9999, // layout containers, above loose widgets (widgets that are within the layout are children of the layout)
  panel: 99999, // panels, above everything else

  // Popover layer for menus opened from a widget
  menu: 999999
} as const;
