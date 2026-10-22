// @vitest-environment node
import path from 'path';
import {describe, expect, it, vi} from 'vitest';
import {McpBeacon} from '../common/mcp';
import {launchApp, LaunchDeps} from './launch';

const MAC_BRIDGE_DIR = '/Applications/ResponsivelyApp.app/Contents/Resources/mcp';
const MAC_BINARY = '/Applications/ResponsivelyApp.app/Contents/MacOS/ResponsivelyApp';

const beacon = (binaryPath: string): McpBeacon => ({
  binaryPath,
  version: '1.18.0',
  mcpPort: 12720,
  writtenAt: new Date().toISOString(),
});

const makeDeps = (
  overrides: Partial<LaunchDeps>
): {deps: LaunchDeps; spawned: any[]; opened: string[][]} => {
  const spawned: any[] = [];
  const opened: string[][] = [];
  const deps: LaunchDeps = {
    spawnFn: vi.fn((command, _args, options) => {
      spawned.push({command, options});
      return {unref: vi.fn()} as never;
    }) as never,
    execFileFn: vi.fn((_cmd: string, args: string[], cb: (e: Error | null) => void) => {
      opened.push(args);
      cb(null);
    }) as never,
    existsFn: () => false,
    platform: 'darwin',
    beacon: () => null,
    bridgeDir: MAC_BRIDGE_DIR,
    ...overrides,
  };
  return {deps, spawned, opened};
};

describe('mcp-cli launch', () => {
  it('darwin default port launches via LaunchServices bundle id', async () => {
    const {deps, spawned, opened} = makeDeps({});
    await launchApp(12720, deps);
    expect(opened).toEqual([['-b', 'app.responsively']]);
    expect(spawned).toHaveLength(0);
  });

  it('darwin custom port spawns the binary directly so env propagates', async () => {
    const {deps, spawned, opened} = makeDeps({existsFn: (p) => p.startsWith('/Applications')});
    await launchApp(23456, deps);
    expect(opened).toHaveLength(0);
    expect(spawned).toHaveLength(1);
    expect(spawned[0].command).toBe(MAC_BINARY);
    expect(spawned[0].options.detached).toBe(true);
    expect(spawned[0].options.env.RESPONSIVELY_MCP_PORT).toBe('23456');
  });

  it('windows launches the beacon binary detached', async () => {
    const binary = 'C:\\Somewhere\\ResponsivelyApp.exe';
    const {deps, spawned} = makeDeps({
      platform: 'win32',
      bridgeDir: 'C:\\Somewhere\\resources\\mcp',
      beacon: () => beacon(binary),
      existsFn: (p) => p === binary,
    });
    await launchApp(12720, deps);
    expect(spawned).toHaveLength(1);
    expect(spawned[0].command).toBe(binary);
    expect(spawned[0].options.detached).toBe(true);
  });

  it('linux launches the beacon AppImage path', async () => {
    const appImage = '/home/dev/Apps/Responsively.AppImage';
    const {deps, spawned} = makeDeps({
      platform: 'linux',
      bridgeDir: '/home/dev/.config/ResponsivelyApp/mcp',
      beacon: () => beacon(appImage),
      existsFn: (p) => p === appImage,
    });
    await launchApp(12720, deps);
    expect(spawned).toHaveLength(1);
    expect(spawned[0].command).toBe(appImage);
  });

  it('errors with actionable guidance when no binary can be found', async () => {
    const {deps} = makeDeps({platform: 'linux', bridgeDir: '/tmp/nowhere/mcp'});
    await expect(launchApp(12720, deps)).rejects.toThrow(/Launch the app manually once/);
  });

  it('darwin falls back to opening the derived .app when bundle id fails', async () => {
    const appDir = '/Users/dev/Applications/ResponsivelyApp.app';
    const {deps, opened} = makeDeps({
      bridgeDir: path.join(appDir, 'Contents', 'Resources', 'mcp'),
      existsFn: (p) => p === appDir,
      execFileFn: vi.fn((_cmd: string, args: string[], cb: (e: Error | null) => void) => {
        opened.push(args);
        // Simulate `open -b` failing (app not registered), direct open succeeding.
        cb(args[0] === '-b' ? new Error('not found') : null);
      }) as never,
    });
    const {opened: openedCalls} = {opened};
    await launchApp(12720, deps);
    expect(openedCalls).toEqual([['-b', 'app.responsively'], [appDir]]);
  });
});
