import {describe, expect, it} from 'vitest';
import reducer, {
  APP_VIEWS,
  closeMenuFlyout,
  hideSupportForever,
  setAppView,
  setDarkMode,
  setPresenting,
  setSupportShownAt,
  setWhatsNewSeen,
} from './index';

describe('ui slice', () => {
  it('has pure defaults', () => {
    const state = reducer(undefined, {type: '@@INIT'});
    expect(state).toEqual({
      darkMode: true,
      appView: 'BROWSER',
      menuFlyout: false,
      isPresenting: false,
      announcements: {seenVersion: null, supportShownAt: null, supportHidden: false},
    });
  });

  it('setDarkMode updates state', () => {
    const state = reducer(undefined, setDarkMode(false));
    expect(state.darkMode).toBe(false);
  });

  it('setAppView switches views', () => {
    const state = reducer(undefined, setAppView(APP_VIEWS.DEVICE_MANAGER));
    expect(state.appView).toBe('DEVICE_MANAGER');
  });

  it('closeMenuFlyout sets the flyout flag', () => {
    const state = reducer(undefined, closeMenuFlyout(true));
    expect(state.menuFlyout).toBe(true);
  });

  it('setPresenting toggles present mode', () => {
    let state = reducer(undefined, setPresenting(true));
    expect(state.isPresenting).toBe(true);
    state = reducer(state, setPresenting(false));
    expect(state.isPresenting).toBe(false);
  });

  it('tracks announcement state', () => {
    let state = reducer(undefined, setWhatsNewSeen('2.0.0'));
    expect(state.announcements.seenVersion).toBe('2.0.0');

    state = reducer(state, setSupportShownAt(1700000000000));
    expect(state.announcements.supportShownAt).toBe(1700000000000);

    state = reducer(state, hideSupportForever());
    expect(state.announcements.supportHidden).toBe(true);
  });
});
