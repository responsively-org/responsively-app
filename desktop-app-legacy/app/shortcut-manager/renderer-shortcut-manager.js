import {ipcRenderer} from 'electron';
import Mousetrap from 'mousetrap';
import {
  REGISTER_CHANNEL,
  UNREGISTER_CHANNEL,
  REGISTER_REPLY_CHANNEL,
  UNREGISTER_REPLY_CHANNEL,
  GET_ALL_CHANNEL,
  CLEAR_CHANNEL,
  ShortcutDefinition,
  validateDefinition,
  CommunicationResponse,
} from './shared';

import 'mousetrap/plugins/global-bind/mousetrap-global-bind';

Mousetrap.addKeycodes({
  44: 'prtsc',
});

const reg: Map<string, string[]> = new Map();

function validate(shortcut: ShortcutDefinition, checkUnique = true) {
  return validateDefinition(shortcut) && !(checkUnique && reg.has(shortcut.id));
}

export function registerShortcut(
  definition: ShortcutDefinition,
  callback: e => any,
  global: boolean = false,
  action?: 'keypres' | 'keydown' | 'keyup'
): boolean {
  if (!validate(definition) || callback == null) return false;
  reg.set(definition.id, definition.accelerators);
  ipcRenderer.send(REGISTER_CHANNEL, definition);
  if (global) Mousetrap.bindGlobal(definition.accelerators, callback, action);
  else Mousetrap.bind(definition.accelerators, callback, action);
  return true;
}

export function unregisterShortcut(id: string): boolean {
  if (id == null || !reg.has(id)) return false;
  const accelerators = reg.get(id);
  reg.delete(id);
  ipcRenderer.send(UNREGISTER_CHANNEL, id);
  Mousetrap.unbind(accelerators);
}

export function getAllShortcuts() {
  return ipcRenderer.invoke(GET_ALL_CHANNEL);
}

export function clearAllShortcuts() {
  ipcRenderer.send(CLEAR_CHANNEL);
  reg.clear();
  Mousetrap.reset();
}
