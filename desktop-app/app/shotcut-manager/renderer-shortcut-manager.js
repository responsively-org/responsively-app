import { ipcRenderer } from 'electron';
import {
    REGISTER_CHANNEL,
    UNREGISTER_CHANNEL,
    REGISTER_REPLY_CHANNEL,
    UNREGISTER_REPLY_CHANNEL,
    CLEAR_CHANNEL,
    ShortcutDefinition,
    validateDefinition,
    CommunicationResponse
} from './shared';

let reg: Map<string, Function>;

function validate(shortcut: ShortcutDefinition, checkUnique = false) {
    return validateDefinition(shortcut) && !(checkUnique && reg.has(shortcut.id));
}

export function registerShortcut(definition: ShortcutDefinition, callback: Function): boolean {
    if (!validate(definition, true) || callback == null) return false;
    reg.set(definition.id, callback);
    ipcRenderer.send(REGISTER_CHANNEL, definition);
    return true;
}

export function unregisterShortcut(id: string) {
    ipcRenderer.send(UNREGISTER_CHANNEL, id);
}

export function clearShortcuts() {
    ipcRenderer.send(CLEAR_CHANNEL);
    reg.forEach((_, key) => {
        ipcRenderer.removeAllListeners(key);
    });
    reg.clear();
}

export function initRendererShortcutManager() {
    reg = new Map();
    ipcRenderer.on(REGISTER_REPLY_CHANNEL, (_, resp: CommunicationResponse) => {
        const { ok, id } = resp;
        if (!reg.has(id)) return;
        if (ok)
            ipcRenderer.on(id, reg.get(id));
        else
            reg.delete(id);
    });

    ipcRenderer.on(UNREGISTER_REPLY_CHANNEL, (_, resp: CommunicationResponse) => {
        const { id } = resp;
        if (!reg.has(id)) return;
        ipcRenderer.removeAllListeners(id);
    });
}

