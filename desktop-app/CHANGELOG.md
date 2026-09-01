# 2.0.0

The biggest release since 1.0: a complete redesign, a free-form canvas workspace, present mode, and a built-in MCP server that lets AI agents drive the app.

## Highlights

- **Complete UI redesign** — a new design system across the whole app: dark and light themes, pill address bar with a site-tools popover, redesigned status bar with layout switcher and zoom stepper, notification bell with release highlights, and a frameless window with a custom title bar on macOS that always shows the app, domain and page title.
- **Canvas layout** — a free-form workspace for your previews: drag device frames anywhere, pan and zoom the world, and every suite remembers its own arrangement. Device bezels, view options, selection and simulation badges included.
- **Present mode** — one click hides all chrome for demos and screen shares. The floating exit pill steps out of the way while your mouse is idle; move the mouse to bring it back, press Escape to exit.
- **Pinch zoom everywhere** — trackpad pinch zooms the previews in every layout, right where your cursor points.
- **Device manager rebuilt** — now a sheet over the stage (previews stay live behind it) with a suites column, device grid, and an inline custom-device form with live preview. Suites became inline chips with a popover editor.
- **MCP server built in** — AI agents can list and switch devices, navigate, read pages, click, type and screenshot every preview. One-click setup for Claude Desktop, Claude Code, Codex and Cursor, plus the `@responsively/mcp` CLI that bridges stdio clients and launches the app on demand.
- **Screenshot service rebuilt** — capture flash, shutter sound, quick and full-page capture per device or all at once.

## Under the hood

- Electron 43, React 19, Redux Toolkit 2.
- Hardened main process: single-instance lock, window-state restore, crash logging.
- Hardened IPC: webview registry validation, URL validation, and an explicit popup policy.
- Store persistence moved to listener middleware with pure reducers.
- New Playwright end-to-end suite (235 tests) and vitest unit suite.
- ESLint 9, Prettier 3, lefthook git hooks.

## Removed / changed

- The legacy pre-1.0 app tree was removed from the repository.
- The Windows "Menus in Titlebar" option (custom-electron-titlebar) was retired.
- The weekly sponsorship modal became a monthly support card; the release-notes modal was replaced by the launch card and the notification bell.
- The first launch after upgrading opens the redesign's default grid layout once; your layout choice persists again from the next switch.

## Upgrade notes

Settings, bookmarks, custom devices and preview suites migrate automatically from any 1.x version.

---

Older releases (1.x) are documented on the [GitHub releases page](https://github.com/responsively-org/responsively-app/releases).
