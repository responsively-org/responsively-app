import http from 'http';
import {expect, test} from '../fixtures/electron-app';

/** The runner shares the host, so it can probe the loopback port directly. */
const endpointReachable = (port: number): Promise<boolean> =>
  new Promise<boolean>((resolve) => {
    const req = http.request(
      {host: '127.0.0.1', port, path: '/mcp', method: 'POST', timeout: 2000},
      () => resolve(true)
    );
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.end('{}');
  });

test.describe('MCP panel', () => {
  test('shows the server status and endpoint', async ({app, mcpPort}) => {
    await app.dismissModals();

    await app.page.locator('button[title="MCP server — connect AI tools"]').click();
    await expect(app.page.getByTestId('mcp-panel')).toBeVisible();
    await expect(app.page.getByTestId('mcp-status')).toContainText('running');
    await expect(app.page.getByTestId('mcp-panel')).toContainText(`127.0.0.1:${mcpPort}`);

    await app.page.keyboard.press('Escape');
  });

  test('the toggle stops and restarts the server', async ({app, mcpPort}) => {
    await app.dismissModals();
    expect(await endpointReachable(mcpPort)).toBe(true);

    await app.page.locator('button[title="MCP server — connect AI tools"]').click();
    const toggle = app.page.locator('button[title="Start / stop MCP server"]');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(app.page.getByTestId('mcp-status')).toContainText('off');
    await expect.poll(() => endpointReachable(mcpPort), {timeout: 10_000}).toBe(false);

    // Turn it back on — later spec files talk to this server.
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(() => endpointReachable(mcpPort), {timeout: 10_000}).toBe(true);

    await app.page.keyboard.press('Escape');
  });
});
