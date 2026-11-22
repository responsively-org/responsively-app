interface DebuggerAttachment {
  users: number;
  owned: boolean;
  onDetach: () => void;
}

const attachments = new WeakMap<Electron.Debugger, DebuggerAttachment>();

/** Keep temporary CDP work and the interactive inspector from detaching each other. */
export const acquireDebugger = (contents: Electron.WebContents): (() => void) => {
  const dbg = contents.debugger;
  let attachment = attachments.get(dbg);
  if (attachment === undefined) {
    const owned = !dbg.isAttached();
    if (owned) {
      dbg.attach();
    }
    const next: DebuggerAttachment = {
      users: 0,
      owned,
      onDetach: () => {
        if (attachments.get(dbg) === next) {
          attachments.delete(dbg);
        }
      },
    };
    attachment = next;
    attachments.set(dbg, attachment);
    dbg.once('detach', attachment.onDetach);
  }
  attachment.users += 1;
  const acquired = attachment;
  let released = false;
  return () => {
    if (released) {
      return;
    }
    released = true;
    acquired.users -= 1;
    if (acquired.users !== 0 || attachments.get(dbg) !== acquired) {
      return;
    }
    attachments.delete(dbg);
    dbg.removeListener('detach', acquired.onDetach);
    if (acquired.owned && !contents.isDestroyed() && dbg.isAttached()) {
      dbg.detach();
    }
  };
};
