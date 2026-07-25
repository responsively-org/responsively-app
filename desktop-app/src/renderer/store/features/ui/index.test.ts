import {describe, expect, it} from 'vitest';
import reducer, {APP_VIEWS, closeMenuFlyout, setAppView, setDarkMode} from './index';

describe('ui slice', () => {
  it('has pure defaults', () => {
    const state = reducer(undefined, {type: '@@INIT'});
    expect(state).toEqual({darkMode: true, appView: 'BROWSER', menuFlyout: false});
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
});
