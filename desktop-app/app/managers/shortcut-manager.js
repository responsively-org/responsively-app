import Mousetrap from 'mousetrap';
import 'mousetrap/plugins/global-bind/mousetrap-global-bind';

export type ShortcutDefinition = {
  id: string,
  title: string,
  accelerators: string[],
};

class ShortcutManager {
  shortcuts: Map<string, ShortcutDefinition> = null;
  constructor() {
    Mousetrap.addKeycodes({
      44: 'prtsc',
    });
    this.shortcuts = new Map();
  }

  _validateDefinition(shortcut: ShortcutDefinition): boolean {
    return (
      shortcut != null &&
      shortcut.id != null &&
      shortcut.title != null &&
      (shortcut.accelerators || []).length !== 0 &&
      shortcut.accelerators.every(x => x != null)
    );
  }

  _validate(shortcut: ShortcutDefinition, checkUnique = true) {
    return (
      this._validateDefinition(shortcut) &&
      !(checkUnique && this.shortcuts.has(shortcut.id))
    );
  }

  registerShortcut(
    definition: ShortcutDefinition,
    callback: e => any,
    global: boolean = false,
    action?: 'keypres' | 'keydown' | 'keyup'
  ): boolean {
    if (!this._validate(definition)) return false;
    this.shortcuts.set(definition.id, definition);
    if (callback) {
      if (global)
        Mousetrap.bindGlobal(definition.accelerators, callback, action);
      else Mousetrap.bind(definition.accelerators, callback, action);
    }
    return true;
  }

  unregisterShortcut(id: string): boolean {
    if (id == null || !this.shortcuts.has(id)) return false;
    const {accelerators} = this.shortcuts.get(id);
    this.shortcuts.delete(id);
    Mousetrap.unbind(accelerators);
  }

  clearAllShortcuts() {
    this.shortcuts.clear();
    Mousetrap.reset();
  }

  getAllShortcuts(): ShortcutDefinition[] {
    return [...this.shortcuts.values()];
  }
}

const instance = new ShortcutManager();
export {instance as ShortcutManager};
