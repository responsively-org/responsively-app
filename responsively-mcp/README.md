# @responsively/mcp

MCP (Model Context Protocol) server for [Responsively App](https://responsively.app) — lets AI coding agents like Claude Code and Cursor drive the app: load URLs, manage device previews, read and interact with pages, and capture per-device screenshots to visually verify responsive layouts.

**The app is launched on demand.** Connecting an agent session does not open the app; the first tool call starts it automatically (and it stays open afterwards). If it's already running, it's reused.

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
    "responsively": {"command": "npx", "args": ["-y", "@responsively/mcp"]}
  }
}
```

## Tools

| Tool | Description |
| --- | --- |
| `get_app_state` | Current URL, page title, layout, zoom and active devices |
| `navigate` | Load a URL in all device previews (waits for the page to load) |
| `list_devices` | Full device catalog, including custom devices |
| `set_active_devices` | Change which devices are previewed, by id or name |
| `screenshot` | Capture one or all device previews as JPEG images |
| `read_page` | Read a preview's page text and interactive elements with CSS selectors |
| `click` | Click an element (trusted mouse event; mirrors across previews) |
| `type_text` | Type into a form field with real keystrokes, optionally press Enter |

## How it works

This package is a thin bootstrap: the actual MCP bridge ships **inside the installed app** (version-locked to it). The bootstrap finds the install — via a location file the app writes on startup — and runs that bridge in-process.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `RESPONSIVELY_APP_PATH` | Path to a custom app install (auto-detected otherwise) |
| `RESPONSIVELY_MCP_PORT` | Port of the app's MCP server (default `12720`) |
| `RESPONSIVELY_MCP_BRIDGE` | Direct path to a bridge `cli.js` (development override) |

Note for Linux: the app ships as an AppImage, so launch it once before first use — that's how the bootstrap learns where it lives.

## License

MIT
