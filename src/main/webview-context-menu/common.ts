interface ContextMenuMetadata {
  id: string;
  label: string;
}

export const CONTEXT_MENUS: { [key: string]: ContextMenuMetadata } = {
  INSPECT_ELEMENT: { id: 'INSPECT_ELEMENT', label: 'Inspect Element' },
  OPEN_CONSOLE: { id: 'OPEN_CONSOLE', label: 'Open Console' },
};
