interface ContextMenuMetadata {
  id: string;
  label: string;
}

export const CONTEXT_MENUS: { [key: string]: ContextMenuMetadata } = {
  INSPECT_ELEMENT: { id: 'INSPECT_ELEMENT', label: 'Inspect Element' },
  OPEN_CONSOLE: { id: 'OPEN_CONSOLE', label: 'Open Console' },
};

export const handleContextMenuEvent = (
  webview: Electron.WebviewTag,
  command: string,
  arg: any
) => {
  switch (command) {
    case CONTEXT_MENUS.INSPECT_ELEMENT.id: {
      const { x: webViewX, y: webViewY } = webview.getBoundingClientRect();
      const { contextMenuMeta } = arg;
      const scaleFactor = parseFloat(webview.dataset?.scaleFactor ?? '1');
      const x = Math.floor(webViewX + contextMenuMeta.x * scaleFactor);
      const y = Math.floor(webViewY + contextMenuMeta.y * scaleFactor);
      webview.inspectElement(x, y);
      break;
    }
    case CONTEXT_MENUS.OPEN_CONSOLE.id: {
      webview.openDevTools();
      break;
    }
    default:
      console.log('Unknown context menu command:', command);
  }
};
