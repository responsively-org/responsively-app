# E2E Test Coverage Review

28 spec files, 162+ tests covering the Responsively App's features.

## Well Covered

- **Cross-device mirroring** — Verifies scroll/click/input/checkbox events propagate between webviews, and that disabling mirroring isolates a device.
- **Color blindness simulation** — Uses `capturePage()` pixel sampling to verify deuteranopia shifts red→green, tritanopia shifts blue→cyan, achromatopsia produces grayscale.
- **Device color scheme** — Uses CDP emulation + screenshot pixel analysis to confirm dark/light background changes in actual webview content.
- **Zoom controls** — Verifies scale transform changes, container dimensions grow/shrink, `data-scale-factor` matches displayed %, roundtrip zoom, and min/max boundaries (25%–200%).
- **DevTools docking** — Verifies bottom/right/undock/close all functionally change the DOM layout.
- **Bookmarks** — Full lifecycle: add → revisit shows filled star → appears in menu → remove returns to outline.
- **Custom device creation** — Full CRUD: add with name/width/height/DPR/UA, edit, delete, type switching, suite integration, duplicate validation.
- **Screenshot save** — Verifies JPEG files saved to disk: all-devices, per-device quick/full-page, keyboard shortcut, filename pattern.
- **Insecure SSL** — Self-signed cert blocked by default, Allow Insecure SSL toggle loads page, disabling restores validation.
- **File watching** — Local HTML via file:// renders, modifying file triggers BrowserSync reload with new content, navigating away stops watcher.
- **Settings persistence** — Screenshot location and accept-language saved to electron-store verified at store level.

## Gaps

### Major — No Coverage

| Feature           | Notes                                                                                  |
| ----------------- | -------------------------------------------------------------------------------------- |
| Design overlays   | Upload image, adjust opacity, overlay/side-by-side positioning, per-device persistence |
| Rulers and guides | Per-device rulers, guide grid, scroll synchronization                                  |

### Minor — Polish

| Feature                            | Notes                                                                  |
| ---------------------------------- | ---------------------------------------------------------------------- |
| Preview layout visual verification | Tests check CSS classes but not actual device bounding box arrangement |
| Keyboard shortcuts gaps            | Untested: Alt+Left/Right, Alt+R, Cmd+Alt+Z/Q/A, Cmd+Alt+Del            |
| History                            | Clear button clickable, but never verifies history populates or clears |
| Per-device rotate                  | Checks dimension text but not actual webview orientation               |
| Site permissions                   | Permissions modal, grant/deny flows untested                           |
| Drag and drop                      | Device reordering and URL drag-and-drop untested                       |
