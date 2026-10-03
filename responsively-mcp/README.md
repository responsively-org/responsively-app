# @responsively/mcp

Browser MCP (Model Context Protocol) server for testing website responsiveness across mobile, tablet, and desktop viewports in [Responsively App](https://responsively.app). AI coding agents such as Codex, Claude Code, and Cursor can open websites, compare responsive layouts using labeled viewport screenshots, and test page interactions.

**The app is launched on demand.** Connecting an agent session does not open the app; the first tool call starts it automatically (and it stays open afterwards). If it's already running, it's reused.

## Use cases

- Check a website or local development server for responsive layout issues at phone, tablet, and desktop sizes.
- Capture labeled screenshots across multiple viewports to inspect clipping, overlap, navigation, and text wrapping.
- Read page text and discover selectors, then click menus or type into forms to check interactions at different sizes.

For a responsive review, use `list_devices` to find viewport sizes, select them with `set_active_devices`, open the URL with `navigate`, and compare `screenshot` results. Use `read_page`, `click`, and `type_text` to inspect interactive states.

Device previews run in the app's browser, rather than on physical devices. The MCP tools select existing device presets and custom devices configured in the app. Screenshots capture the visible viewport as JPEG, downscaled to at most 1000px wide.

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

| Tool                 | Description                                                                                                       |
| -------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `get_app_state`      | Inspect the current URL, page title and active viewport dimensions, layout and zoom                               |
| `navigate`           | Open a website or local URL in all browser viewports (waits for the page to load)                                 |
| `list_devices`       | Find phone, tablet and desktop viewport presets, including configured custom devices                              |
| `set_active_devices` | Select browser viewports for responsive testing by device id or name                                              |
| `screenshot`         | Capture labeled JPEG screenshots of one or all visible browser viewports                                          |
| `read_page`          | Read a viewport's page text and interactive elements with CSS selectors                                           |
| `click`              | Test links, buttons and menus with a trusted mouse click; mirrors across previews when event mirroring is enabled |
| `type_text`          | Test form fields with real keystrokes, optionally press Enter                                                     |

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
