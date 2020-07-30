import {ipcMain} from 'electron';
import {
  REGISTER_CHANNEL,
  UNREGISTER_CHANNEL,
  REGISTER_REPLY_CHANNEL,
  UNREGISTER_REPLY_CHANNEL,
  GET_ALL_CHANNEL,
  CLEAR_CHANNEL,
  ShortcutDefinition,
  validateDefinition,
} from './shared';

let shortcuts: Map<string, ShortcutDefinition>;

function validate(shortcut: ShortcutDefinition, checkUnique = true) {
  return (
    validateDefinition(shortcut) && !(checkUnique && shortcuts.has(shortcut.id))
  );
}

export function registerShortcut(shortcut: ShortcutDefinition): boolean {
  if (!validate(shortcut)) return false;
  shortcuts.set(shortcut.id, shortcut);
  return true;
}

export function unregisterShortcut(id: string): boolean {
  if (id == null || !shortcuts.has(id)) return false;
  return shortcuts.delete(id);
}

export function clearAllShortcuts() {
  shortcuts.clear();
}

export function getAllShortcuts(): ShortcutDefinition[] {
  return [...shortcuts.values()];
}

export function initMainShortcutManager() {
  shortcuts = new Map();

  ipcMain.on(REGISTER_CHANNEL, (event, definition: ShortcutDefinition) => {
    const ok = registerShortcut(definition);
    const id = definition == null ? null : definition.id;
    event.reply(REGISTER_REPLY_CHANNEL, {ok, id});
  });

  ipcMain.on(UNREGISTER_CHANNEL, (event, id: string) => {
    const ok = unregisterShortcut(id);
    event.reply(UNREGISTER_REPLY_CHANNEL, {ok, id});
  });

  ipcMain.removeHandler(GET_ALL_CHANNEL);

  ipcMain.handle(GET_ALL_CHANNEL, () => getAllShortcuts());

  ipcMain.on(CLEAR_CHANNEL, clearAllShortcuts);
}
