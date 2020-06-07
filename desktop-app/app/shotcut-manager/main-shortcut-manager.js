import { ipcMain } from 'electron';
import {
    REGISTER_CHANNEL,
    UNREGISTER_CHANNEL,
    REGISTER_REPLY_CHANNEL,
    UNREGISTER_REPLY_CHANNEL,
    GET_ALL_CHANNEL,
    CLEAR_CHANNEL,
    ShortcutDefinition,
    validateDefinition
} from './shared';

const localShortcut = require('./local-shortcut/electron-localshortcut');

let shortcuts: Map<string, ShortcutDefinition>;
let mainWindow;

function validate(shortcut: ShortcutDefinition, checkUnique = false) {
    return validateDefinition(shortcut) && !(checkUnique && shortcuts.has(shortcut.id));
}

export function registerShortcut(shortcut: ShortcutDefinition): boolean {
    if (!validate(shortcut, true)) return false;
    const { id, accelerators } = shortcut;
    shortcuts.set(id, shortcut);
    accelerators.forEach(acc => localShortcut.register(mainWindow, acc, () => mainWindow.webContents.send(id)));
    return true;
}

export function unregisterShortcut(id: string): boolean {
    if (id == null || !shortcuts.has(id)) return false;
    const { accelerators } = shortcuts.get(id);
    shortcuts.delete(id);
    accelerators.forEach(acc => localShortcut.unregister(mainWindow, acc));
    return true;
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

    ipcMain.handle(GET_ALL_CHANNEL, () => {
        return getAllShortcuts();
    });

    ipcMain.on(CLEAR_CHANNEL, () => {
        localShortcut.unregisterAll();
        shortcuts.clear();
    });
}