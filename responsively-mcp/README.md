# @responsively/mcp

Browser MCP (Model Context Protocol) server for testing website responsiveness across mobile, tablet, and desktop viewports in [Responsively App](https://responsively.app). AI coding agents such as Codex, Claude Code, and Cursor can open websites, compare responsive layouts using labeled viewport screenshots, and test page interactions.

**The app is launched on demand.** Connecting an agent session does not open the app; the first tool call starts it automatically (and it stays open afterwards). If it's already running, it's reused.

## Use cases

- Check a website or local development server for responsive layout issues at phone, tablet, and desktop sizes.
- Capture labeled screenshots across multiple viewports to inspect clipping, overlap, navigation, and text wrapping.
- Read page text and discover selectors, then click menus or type into forms to check interactions at different sizes.

For a responsive review, use `list_devices` to find viewport sizes, select them with `set_active_devices`, open the URL with `navigate`, and compare `screenshot` results. Use `read_page`, `click`, and `type_text` to inspect interactive states, and `scroll_to` to inspect sections below the fold.

Device previews run in the app's browser, rather than on physical devices. The MCP tools select existing device presets and custom devices configured in the app. Screenshots default to the visible viewport as JPEG, downscaled to at most 1000px wide. Set `fullPage: true` to capture the entire document without resizing the viewport, or `originalResolution: true` for an unscaled, lossless PNG. Both options can be combined. Labels include the captured image dimensions; these can differ from the viewport's CSS dimensions. Full-page captures include currently rendered content; scroll first to load lazy content when needed.

## Setup

Install [Responsively App](https://responsively.app/download) and launch it once. Then:

**Claude Code**

```bash
claude mcp add responsively -- npx -y @responsively/mcp
```

**Cursor** (`.cursor/mcp.json`)

```json
{
  "mcpServers": {
    "responsively": { "command": "npx", "args": ["-y", "@responsively/mcp"] }
  }
}
```

## Tools

| Tool                 | Description                                                                                                          |
| -------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `get_app_state`      | Inspect the current URL, page title and active viewport dimensions, layout and zoom                                  |
| `navigate`           | Open a website or a local `.html`/`.htm` file in all browser viewports (waits for the page to load)                  |
| `list_devices`       | Find phone, tablet and desktop viewport presets, including configured custom devices                                 |
| `set_active_devices` | Select browser viewports for responsive testing by device id or name                                                 |
| `set_mirroring`      | Enable or disable shared interactions for one device or all active previews                                          |
| `set_device_options` | Change a preview's width, height, orientation, or color scheme for the current session                               |
| `screenshot`         | Capture labeled viewport or full-page images, optionally at original resolution, for one or all previews             |
| `scroll_to`          | Scroll to a unique CSS selector, visible text, or absolute page coordinates; supports nested containers for elements |
| `read_page`          | Read a viewport's page text and interactive elements with CSS selectors                                              |
| `click`              | Test links, buttons and menus with a trusted mouse click; mirrors across previews when event mirroring is enabled    |
| `type_text`          | Test form fields with real keystrokes, optionally press Enter                                                        |

### Screenshot and scroll examples

Tool arguments for a full-page image at original resolution:

```json
{ "device": "iPad", "fullPage": true, "originalResolution": true }
```

`scroll_to` accepts exactly one target mode: `selector`, `text`, or `x`/`y` coordinates. Omit `device` to use the primary preview. Text matching ignores case and normalizes whitespace; use `exact: true` for the entire text. Ambiguous matches return an error so the agent can refine its target.

```json
{ "text": "Pricing plans", "exact": true, "device": "iPad" }
```

```json
{ "selector": "#footer", "block": "start" }
```

```json
{ "y": 0 }
```

Element targets scroll into view with `block` alignment (`start`, `center`, `end`, or `nearest`; default `center`), including inside nested scroll containers. Coordinates are absolute CSS pixels; an omitted axis keeps its current position. Page scrolling may mirror to other previews according to the app settings; nested-container scrolling operates in the selected preview.

### Mirroring and viewport controls

Use `set_mirroring` to isolate a preview before interacting with it:

```json
{ "device": "iPad", "enabled": false }
```

A disabled preview neither sends nor receives mirrored clicks, typing, and page scrolling. Omitting `device` changes all active previews. The setting is shared with the device's **Event mirroring** UI control and survives navigation and reloads during the session. Enabling waits for the mirroring connection to be ready; disabling prevents isolated events from replaying when it is re-enabled. Explicit app commands such as `navigate` retain their documented scope.

Use `set_device_options` to test breakpoints and preferred color schemes:

```json
{ "device": "iPad", "width": 820, "height": 1180, "colorScheme": "dark" }
```

```json
{ "device": "iPad", "orientation": "landscape" }
```

`device` defaults to the primary preview. Width and height accept integers from 1 to 10000 CSS pixels. Omitted fields keep their current settings; orientation normalizes the resulting dimensions. Explicit geometry overrides take precedence over the global rotation control. Color scheme accepts `light`, `dark`, or `system`; `system` clears the per-preview override and follows the app's global device theme. These changes do not reload the page or modify saved device presets.

Reset a preview's options and individual rotation with:

```json
{ "device": "iPad", "reset": true }
```

Reset restores the preset under the current global rotation and theme. It can be combined with new options, which apply after the reset. Both tools return updated settings; `get_app_state` reports effective dimensions, orientation, color scheme, and `mirroringEnabled` for every active device. `list_devices` continues to report saved preset dimensions. For a hidden preview, `set_device_options` saves the settings with `viewportApplied: false`; the viewport resizes when shown. Visible previews return `viewportApplied: true` after the browser has resized.

## How it works

This package is a thin bootstrap: the actual MCP bridge ships **inside the installed app** (version-locked to it). The bootstrap finds the install — via a location file the app writes on startup — and runs that bridge in-process.

## Environment variables

| Variable                  | Purpose                                                 |
| ------------------------- | ------------------------------------------------------- |
| `RESPONSIVELY_APP_PATH`   | Path to a custom app install (auto-detected otherwise)  |
| `RESPONSIVELY_MCP_PORT`   | Port of the app's MCP server (default `12720`)          |
| `RESPONSIVELY_MCP_BRIDGE` | Direct path to a bridge `cli.js` (development override) |

Note for Linux: the app ships as an AppImage, so launch it once before first use — that's how the bootstrap learns where it lives.

## License

MIT
