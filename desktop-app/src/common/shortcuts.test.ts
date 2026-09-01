import {describe, expect, it} from 'vitest';
import {matchShortcut, parseCombo, SHORTCUT_CHANNEL, ShortcutInput} from './shortcuts';

const press = (overrides: Partial<ShortcutInput> & {code: string}): ShortcutInput => ({
  control: false,
  meta: false,
  alt: false,
  shift: false,
  ...overrides,
});

describe('parseCombo', () => {
  it('splits modifiers from the key', () => {
    expect(parseCombo('mod+alt+z')).toEqual({mod: true, alt: true, shift: false, code: 'KeyZ'});
  });

  it('treats a trailing ++ as the plus key', () => {
    expect(parseCombo('mod++')).toEqual({mod: true, alt: false, shift: false, code: 'Equal'});
  });

  it('maps named keys to physical codes', () => {
    expect(parseCombo('alt+left').code).toBe('ArrowLeft');
    expect(parseCombo('mod+alt+del').code).toBe('Delete');
    expect(parseCombo('mod+-').code).toBe('Minus');
  });
});

describe('matchShortcut', () => {
  it('matches mod as Cmd on macOS and Ctrl elsewhere', () => {
    expect(matchShortcut(press({code: 'KeyR', meta: true}), 'darwin')).toBe(
      SHORTCUT_CHANNEL.RELOAD
    );
    expect(matchShortcut(press({code: 'KeyR', control: true}), 'win32')).toBe(
      SHORTCUT_CHANNEL.RELOAD
    );
    // The wrong modifier for the platform must not fire.
    expect(matchShortcut(press({code: 'KeyR', control: true}), 'darwin')).toBeNull();
  });

  it('matches zoom in with and without shift', () => {
    expect(matchShortcut(press({code: 'Equal', meta: true}), 'darwin')).toBe(
      SHORTCUT_CHANNEL.ZOOM_IN
    );
    expect(matchShortcut(press({code: 'Equal', meta: true, shift: true}), 'darwin')).toBe(
      SHORTCUT_CHANNEL.ZOOM_IN
    );
  });

  it('matches zoom out', () => {
    expect(matchShortcut(press({code: 'Minus', meta: true}), 'darwin')).toBe(
      SHORTCUT_CHANNEL.ZOOM_OUT
    );
  });

  it('distinguishes shifted combos from unshifted ones', () => {
    expect(matchShortcut(press({code: 'KeyL', meta: true}), 'darwin')).toBe(
      SHORTCUT_CHANNEL.EDIT_URL
    );
    expect(matchShortcut(press({code: 'KeyL', meta: true, shift: true}), 'darwin')).toBe(
      SHORTCUT_CHANNEL.PREVIEW_LAYOUT
    );
  });

  it('matches alt-only combos', () => {
    expect(matchShortcut(press({code: 'ArrowLeft', alt: true}), 'darwin')).toBe(
      SHORTCUT_CHANNEL.BACK
    );
    expect(matchShortcut(press({code: 'KeyR', alt: true}), 'darwin')).toBe(
      SHORTCUT_CHANNEL.TOGGLE_RULERS
    );
  });

  it('ignores plain typing', () => {
    expect(matchShortcut(press({code: 'KeyR'}), 'darwin')).toBeNull();
    expect(matchShortcut(press({code: 'KeyA', shift: true}), 'darwin')).toBeNull();
  });

  it('does not hijack text editing shortcuts', () => {
    for (const code of ['KeyC', 'KeyV', 'KeyX', 'KeyZ', 'KeyA']) {
      expect(matchShortcut(press({code, meta: true}), 'darwin')).toBeNull();
    }
  });
});
