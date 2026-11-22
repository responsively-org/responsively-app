import {EventEmitter} from 'events';
import {describe, expect, it, vi} from 'vitest';
import {acquireDebugger} from './debugger-lease';

const createContents = () => {
  const dbg = Object.assign(new EventEmitter(), {
    attached: false,
    attach: vi.fn(() => {
      dbg.attached = true;
    }),
    detach: vi.fn(() => {
      dbg.attached = false;
      dbg.emit('detach');
    }),
    isAttached: () => dbg.attached,
  });
  const contents = {debugger: dbg, isDestroyed: () => false};
  return {contents: contents as unknown as Electron.WebContents, dbg};
};

describe('debugger leases', () => {
  it('keeps an inspector that starts during a screenshot attached', () => {
    const {contents, dbg} = createContents();
    const releaseCapture = acquireDebugger(contents);
    const releaseInspector = acquireDebugger(contents);
    releaseCapture();
    expect(dbg.attach).toHaveBeenCalledTimes(1);
    expect(dbg.detach).not.toHaveBeenCalled();
    releaseInspector();
    expect(dbg.detach).toHaveBeenCalledTimes(1);
  });

  it('keeps a screenshot attached when the inspector is disabled', () => {
    const {contents, dbg} = createContents();
    const releaseInspector = acquireDebugger(contents);
    const releaseCapture = acquireDebugger(contents);
    releaseInspector();
    releaseInspector();
    expect(dbg.detach).not.toHaveBeenCalled();
    releaseCapture();
    expect(dbg.detach).toHaveBeenCalledTimes(1);
  });

  it('does not detach sessions owned by another debugger client', () => {
    const {contents, dbg} = createContents();
    dbg.attached = true;
    acquireDebugger(contents)();
    expect(dbg.attach).not.toHaveBeenCalled();
    expect(dbg.detach).not.toHaveBeenCalled();
    expect(dbg.listenerCount('detach')).toBe(0);
  });

  it('does not let a stale lease detach a replacement attachment', () => {
    const {contents, dbg} = createContents();
    const releaseOldCapture = acquireDebugger(contents);
    dbg.detach();
    const releaseNewCapture = acquireDebugger(contents);
    releaseOldCapture();
    expect(dbg.attached).toBe(true);
    expect(dbg.detach).toHaveBeenCalledTimes(1);
    releaseNewCapture();
    expect(dbg.detach).toHaveBeenCalledTimes(2);
  });
});
