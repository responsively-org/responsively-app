import {describe, it, expect, vi} from 'vitest';
import {TOOLS, handleCallTool} from './index';

vi.mock('electron', () => ({
  webContents: {
    getAllWebContents: vi.fn().mockReturnValue([
      {
        id: 101,
        getType: () => 'webview',
        getURL: () => 'https://example.com',
        getTitle: () => 'Example Page',
        capturePage: async () => ({
          toJPEG: () => Buffer.from('fake-jpeg-data'),
        }),
      },
    ]),
    fromId: vi.fn().mockImplementation((id: number) => {
      if (id === 101) {
        return {
          id: 101,
          getType: () => 'webview',
          getURL: () => 'https://example.com',
          getTitle: () => 'Example Page',
          capturePage: async () => ({
            toJPEG: () => Buffer.from('fake-jpeg-data'),
          }),
        };
      }
      return null;
    }),
  },
  BrowserWindow: vi.fn(),
}));

vi.mock('fs-extra', () => ({
  ensureDir: vi.fn().mockResolvedValue(true),
  writeFile: vi.fn().mockResolvedValue(true),
}));

vi.mock('../../store', () => ({
  default: {
    get: vi.fn().mockReturnValue('/tmp/screenshots'),
  },
}));

describe('MCP Tools', () => {
  it('should define expected tools', () => {
    const toolNames = TOOLS.map((t) => t.name);
    expect(toolNames).toContain('responsively_list_devices');
    expect(toolNames).toContain('responsively_take_screenshot');
    expect(toolNames).toContain('responsively_navigate');
    // takeAllScreenshots was consolidated into takeScreenshot
    expect(toolNames).not.toContain('responsively_take_all_screenshots');
  });

  it('should list devices via handleCallTool', async () => {
    const result = await handleCallTool('responsively_list_devices', {}, null);
    expect(result.content).toBeDefined();
    const data = JSON.parse(result.content[0].text);
    expect(data.count).toBe(1);
    expect(data.devices[0].id).toBe(101);
  });

  it('should take viewport screenshots of all devices', async () => {
    const result = await handleCallTool('responsively_take_screenshot', {}, null);
    // Should return image + text for each device
    expect(result.content[0].type).toBe('image');
    expect(result.content[0].mimeType).toBe('image/jpeg');
    expect(result.content[0].data).toBeDefined();
    // Text metadata should include device name and type
    expect(result.content[1].type).toBe('text');
    expect(result.content[1].text).toContain('viewport');
  });

  it('should take full-page screenshots when fullPage is true', async () => {
    // Without a mainWindow, full-page resize is skipped but capture still works
    const result = await handleCallTool('responsively_take_screenshot', {fullPage: true}, null);
    expect(result.content[0].type).toBe('image');
    expect(result.content[1].text).toContain('fullpage');
  });

  it('should handle navigation tool call', async () => {
    const mockWindow: any = {
      isDestroyed: () => false,
      webContents: {
        send: vi.fn(),
      },
    };

    const result = await handleCallTool(
      'responsively_navigate',
      {url: 'https://github.com'},
      mockWindow
    );
    expect(mockWindow.webContents.send).toHaveBeenCalledWith('open-url', {
      url: 'https://github.com',
    });
    expect(result.content[0].text).toContain('Successfully sent navigation request');
  });
});
