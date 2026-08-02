# Find Text Feature Implementation

Add a "Find in Page" feature (Cmd+F / Ctrl+F) that searches across all device webviews simultaneously, inspired by the old `feature/find-text` branch but reimplemented for the current codebase architecture.

## Background

The old `feature/find-text` branch (commits `d46ae228` → `31fe352d`) implemented this using:

- A `<FindText>` React component with a simple search bar
- Redux actions dispatched via a `PubSub` to each `<webview>` calling `webview.findInPage()` / `webview.stopFindInPage()` directly from the renderer
- Debounced search calls at 25ms

**The Electron freeze issue**: Calling `findInPage()` directly on the `<webview>` element from the renderer process can cause the app to freeze. This is a known Chromium/Electron issue where the `<webview>` tag's IPC bridge can become blocked during `findInPage` operations, especially:

1. When called before `did-finish-load` fires
2. When called rapidly on multiple webviews simultaneously
3. Due to the synchronous IPC communication the `<webview>` tag uses internally

## How We Avoid the Freeze Issue

The current codebase (Electron 43.1.1) already follows the pattern of **routing webview operations through the main process via `ipcMain.handle`** (see [native-functions/index.ts](file:///Users/ruby/mystuff/repos/responsively-app/desktop-app/src/main/native-functions/index.ts) for `load-url-in-webview`, `disable-default-window-open-handler`, etc.). We will follow the same pattern:

1. **Main process handlers** use `webContents.fromId(id)` to get the actual `webContents` object and call `findInPage()` / `stopFindInPage()` on it
2. **Renderer** sends the `webContentsId` via `ipcRenderer.invoke()` — never touching the `<webview>` element's find methods directly
3. **Sequential execution**: We search webviews one-at-a-time (not in parallel) with a small delay between each to avoid flooding
4. **Guard checks**: Only invoke `findInPage` after `did-stop-loading` via a readiness flag that already exists (`webviewReady` state in Device component)

> [!IMPORTANT]
> This approach uses `webContents.findInPage()` on the main process side, which is the stable, supported API — as opposed to the `<webview>.findInPage()` DOM method that was causing freezes in the old branch.

## Proposed Changes

### 1. Main Process — Find Text IPC Handlers

#### [NEW] [find-in-page.ts](file:///Users/ruby/mystuff/repos/responsively-app/desktop-app/src/main/find-in-page.ts)

New module with IPC handlers for find operations:

- `find-in-page`: Takes `{ webContentsId: number, text: string, options?: { forward?: boolean, findNext?: boolean } }`, calls `webContents.fromId(id).findInPage(text, options)`. Returns the `requestId`.
- `stop-find-in-page`: Takes `{ webContentsId: number, action: 'clearSelection' | 'keepSelection' | 'activateSelection' }`, calls `webContents.fromId(id).stopFindInPage(action)`.
- Registers a `found-in-page` result listener on each webContents that forwards the match count/active match back to the renderer via `mainWindow.webContents.send('find-in-page-result', ...)`.

---

### 2. Common Constants

#### [MODIFY] [constants.ts](file:///Users/ruby/mystuff/repos/responsively-app/desktop-app/src/common/constants.ts)

Add `'find-in-page'`, `'stop-find-in-page'`, and `'find-in-page-result'` to `IPC_MAIN_CHANNELS`.

---

### 3. Redux State — Find Text Slice

#### [NEW] [find-text/index.ts](file:///Users/ruby/mystuff/repos/responsively-app/desktop-app/src/renderer/store/features/find-text/index.ts)

New Redux slice with state:

```typescript
interface FindTextState {
  isOpen: boolean;
  searchText: string;
  matches: number; // total matches from primary webview
  activeMatch: number; // current active match index
}
```

Actions: `openFindBar`, `closeFindBar`, `setSearchText`, `setMatchResult`, `resetFind`.

#### [MODIFY] [store/index.ts](file:///Users/ruby/mystuff/repos/responsively-app/desktop-app/src/renderer/store/index.ts)

Register the new `findText` reducer.

---

### 4. Renderer — FindBar UI Component

#### [NEW] [FindBar/index.tsx](file:///Users/ruby/mystuff/repos/responsively-app/desktop-app/src/renderer/components/FindBar/index.tsx)

A floating search bar that appears at the top-right of the browser view (similar to Chrome's Ctrl+F):

- Text input with auto-focus when opened
- Match count display (e.g., "3 of 12")
- Up/Down navigation buttons (previous/next match)
- Close button
- Keyboard: Enter = next, Shift+Enter = previous, Escape = close
- Smooth slide-in/slide-out animation using CSS transitions
- Styled with Tailwind (consistent with the rest of the app)

#### [MODIFY] [AppContent.tsx](file:///Users/ruby/mystuff/repos/responsively-app/desktop-app/src/renderer/AppContent.tsx)

Render `<FindBar />` inside the `<Browser />` component, positioned absolutely above the Previewer.

---

### 5. Device Component — Execute Find on Webviews

#### [MODIFY] [Previewer/Device/index.tsx](file:///Users/ruby/mystuff/repos/responsively-app/desktop-app/src/renderer/components/Previewer/Device/index.tsx)

Add a `useEffect` that subscribes to the `findText` Redux state:

- When `searchText` changes and is non-empty, call `window.electron.ipcRenderer.invoke('find-in-page', { webContentsId, text, options })`
- When search is cleared or FindBar closes, call `window.electron.ipcRenderer.invoke('stop-find-in-page', { webContentsId, action: 'clearSelection' })`
- Only the **primary** device listens for `found-in-page` results to update the match count in Redux
- Guard: skip if `!webviewReady`

---

### 6. Keyboard Shortcut Integration

#### [MODIFY] [KeyboardShortcutsManager/constants.ts](file:///Users/ruby/mystuff/repos/responsively-app/desktop-app/src/renderer/components/KeyboardShortcutsManager/constants.ts)

Add `FIND_TEXT: 'FIND_TEXT'` channel mapped to `['mod+f']`.

---

### 7. Menu Integration

#### [MODIFY] [menu/view.ts](file:///Users/ruby/mystuff/repos/responsively-app/desktop-app/src/main/menu/view.ts)

Add a "Find" menu item (`Cmd+F` / `Ctrl+F`) to the View menu that sends `'toggle-find-bar'` to the renderer.

---

### 8. Main Process Initialization

#### [MODIFY] [main.ts](file:///Users/ruby/mystuff/repos/responsively-app/desktop-app/src/main/main.ts)

Import and call `initFindInPageHandlers(mainWindow)` alongside the other handler initializations.

---

## Open Questions

1. **Match count scope**: Should the match count shown in the FindBar be from only the primary webview, or aggregated across all webviews? The old branch only searched across all but didn't show aggregated counts. I'm proposing to show the primary webview's match count for simplicity (matches what the user focuses on).

2. **Case sensitivity**: Should we add a case-sensitivity toggle? The old branch didn't have one. Proposing to start without one (case-insensitive by default, which is `findInPage`'s default).

## Verification Plan

### Manual Verification

1. Launch the app, navigate to a content-rich page
2. Press Cmd+F — verify the FindBar slides in smoothly
3. Type a search term — verify highlights appear in all webviews
4. Press Enter / click Down arrow — verify it cycles through matches
5. Press Shift+Enter / click Up arrow — verify reverse navigation
6. Press Escape — verify the bar closes and highlights clear
7. Verify no freeze/hang with rapid typing and multiple webviews active
8. Verify the feature works from the Edit/View menu as well
