import { ipcMain, globalShortcut } from 'electron';
import {
    REGISTER_CHANNEL,
    UNREGISTER_CHANNEL,
    REGISTER_REPLY_CHANNEL,
    UNREGISTER_REPLY_CHANNEL,
    CLEAR_CHANNEL,
    ShortcutDefinition,
    validateDefinition
} from './shared';

let shortcuts: Map<string, ShortcutDefinition>;
let mainWindow;

function validate(shortcut: ShortcutDefinition, checkUnique = false) {
    return validateDefinition(shortcut) && !(checkUnique && shortcuts.has(shortcut.id));
}

export function registerShortcut(shortcut: ShortcutDefinition): boolean {
    if (!validate(shortcut, true)) return false;
    const { id, accelerator } = shortcut;
    shortcuts.set(id, shortcut);
    return globalShortcut.register(accelerator, () => mainWindow.webContents.send(id));
}

export function unregisterShortcut(id: string): boolean {
    if (id == null || !shortcuts.has(id)) return false;
    const sc = shortcuts.get(id);
    shortcuts.delete(id);
    return globalShortcut.unregister(sc.accelerator);
}

export function getAllShortcuts(): ShortcutDefinition[] {
    return [...shortcuts.values()];
}

export function initMainShortcutManager(mWdw) {
    shortcuts = new Map();
    mainWindow = mWdw;

    ipcMain.on(REGISTER_CHANNEL, (event, definition: ShortcutDefinition) => {
        const ok = registerShortcut(definition);
        const id = definition == null ? null : definition.id;
        event.reply(REGISTER_REPLY_CHANNEL, { ok, id });
    });

    ipcMain.on(UNREGISTER_CHANNEL, (event, id: string) => {
        const ok = unregisterShortcut(id);
        event.reply(UNREGISTER_REPLY_CHANNEL, { ok, id });
    });

    ipcMain.on(CLEAR_CHANNEL, () => {
        globalShortcut.unregisterAll();
        shortcuts.clear();
    });
}