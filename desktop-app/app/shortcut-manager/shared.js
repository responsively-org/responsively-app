export const REGISTER_CHANNEL = 'register-shortcut';
export const UNREGISTER_CHANNEL = 'unregister-shortcut';
export const REGISTER_REPLY_CHANNEL = 'register-shortcut-reply';
export const UNREGISTER_REPLY_CHANNEL = 'unregister-shortcut-reply';
export const GET_ALL_CHANNEL = 'get-all-shortcuts';
export const CLEAR_CHANNEL = 'clear-shortcuts';
export type ShortcutDefinition = {
  id: string,
  title: string,
  accelerators: string[],
};
export type CommunicationResponse = {
  ok: boolean,
  id: string,
};

export function validateDefinition(shortcut: ShortcutDefinition): boolean {
  return (
    shortcut != null &&
    shortcut.id != null &&
    shortcut.title != null &&
    (shortcut.accelerators || []).length !== 0 &&
    shortcut.accelerators.every(x => x != null)
  );
}
