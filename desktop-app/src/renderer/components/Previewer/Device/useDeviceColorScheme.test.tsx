import {act, cleanup, renderHook} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import type {DeviceColorScheme} from 'common/device-options';
import {applyDeviceColorScheme} from 'renderer/lib/device-color-scheme';
import useDeviceColorScheme from './useDeviceColorScheme';

vi.mock('renderer/lib/device-color-scheme', () => ({
  applyDeviceColorScheme: vi.fn(async () => {}),
}));

describe('preview color scheme lifecycle', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(cleanup);

  it('reapplies the current scheme on navigation and clears it when reset', async () => {
    const webview = new EventTarget() as unknown as Electron.WebviewTag;
    const ref = {current: webview};
    const {rerender, unmount} = renderHook(
      ({scheme}: {scheme?: DeviceColorScheme}) => useDeviceColorScheme(ref, true, scheme),
      {initialProps: {scheme: 'dark' as DeviceColorScheme | undefined}}
    );
    expect(applyDeviceColorScheme).toHaveBeenLastCalledWith(webview, 'dark');
    rerender({scheme: 'light'});
    await act(async () => webview.dispatchEvent(new Event('dom-ready')));
    expect(applyDeviceColorScheme).toHaveBeenLastCalledWith(webview, 'light');
    rerender({scheme: undefined});
    expect(applyDeviceColorScheme).toHaveBeenLastCalledWith(webview, undefined);
    unmount();
    vi.mocked(applyDeviceColorScheme).mockClear();
    webview.dispatchEvent(new Event('dom-ready'));
    expect(applyDeviceColorScheme).not.toHaveBeenCalled();
  });

  it('waits for a new preview to be ready before applying its saved preference', async () => {
    const webview = new EventTarget() as unknown as Electron.WebviewTag;
    renderHook(() => useDeviceColorScheme({current: webview}, false, 'dark'));
    expect(applyDeviceColorScheme).not.toHaveBeenCalled();
    await act(async () => webview.dispatchEvent(new Event('dom-ready')));
    expect(applyDeviceColorScheme).toHaveBeenLastCalledWith(webview, 'dark');
  });
});
