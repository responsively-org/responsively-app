export const APP_KNOWLEDGE = `
# Responsively App Knowledge Base

## Overview
Responsively App is a developer-friendly browser that aids in faster responsive web development. It allows developers to view their web applications on multiple devices simultaneously.

## Key Features

### 1. Mirrored Interactions
Any interaction (scroll, click, input typing, mouse hover) performed on one device is instantly mirrored to all other active devices. This ensures that you can test user flows across multiple screen sizes in real-time.

### 2. Layout Modes
- **Masonry**: Arranges devices in a compact masonry grid to maximize screen usage.
- **Flex**: Arranges devices in a flexible row/column layout.
- **Column**: Stacks devices vertically.
- **Individual**: Focuses on a single device for detailed inspection.

### 3. Device Management
- **Device Manager**: You can add, remove, or customize devices from the sidebar.
- **Custom Devices**: You can create custom devices with specific resolutions and user agents.
- **Rotate**: You can rotate mobile devices between portrait and landscape modes using the rotate button in the toolbar.

### 4. Tools & Utilities
- **Screenshot**: Take full-page screenshots of all active devices at once using the camera icon.
- **Element Inspector**: Inspect an element on one device, and it will be highlighted on all other devices.
- **Design Mode**: Allows you to edit text and content directly on the page to test copy changes quickly.
- **Network Throttling**: Simulate different network speeds (e.g., 3G, 4G, Offline) to test performance.
- **Hot Reloading**: Supports hot reloading to reflect code changes instantly.

## Keyboard Shortcuts
- **Rotate All Devices**: \`Cmd/Ctrl + Alt + R\`
- **Screenshot All**: \`Cmd/Ctrl + P\`
- **Inspect Element**: \`Cmd/Ctrl + Shift + I\` (or \`F12\` / \`Cmd+Option+I\` for DevTools)
- **Reload**: \`Cmd/Ctrl + R\`
- **Hard Reload**: \`Cmd/Ctrl + Shift + R\`
- **Focus Address Bar**: \`Cmd/Ctrl + L\`
- **Toggle Fullscreen**: \`F11\` (or \`F\` in some contexts)

## Troubleshooting
- **Page not loading?**: Check if the URL is correct. If it's a local server (localhost), ensure the server is running.
- **Interactions not mirroring?**: Ensure that the specific event is not blocked by the website's script. Some complex SPAs might handle events differently.
`;
