import {describe, expect, it} from 'vitest';
import {initialNavigationState, navigationReducer} from './navigationMachine';

describe('navigationReducer', () => {
  it('enters loading and clears previous errors on load-started', () => {
    const failed = navigationReducer(initialNavigationState, {
      type: 'load-failed',
      errorCode: -105,
      errorDescription: 'ERR_NAME_NOT_RESOLVED',
      isMainFrame: true,
    });
    const next = navigationReducer(failed, {type: 'load-started'});
    expect(next).toEqual({loading: true, error: null});
  });

  it('keeps the error visible when the failed load finishes', () => {
    let state = navigationReducer(initialNavigationState, {type: 'load-started'});
    state = navigationReducer(state, {
      type: 'load-failed',
      errorCode: -105,
      errorDescription: 'ERR_NAME_NOT_RESOLVED',
      isMainFrame: true,
    });
    state = navigationReducer(state, {type: 'load-finished'});
    expect(state.loading).toBe(false);
    expect(state.error).toEqual({code: -105, description: 'ERR_NAME_NOT_RESOLVED'});
  });

  it('ignores ERR_ABORTED (superseded navigations)', () => {
    const state = navigationReducer(
      {loading: true, error: null},
      {type: 'load-failed', errorCode: -3, errorDescription: 'ERR_ABORTED', isMainFrame: true}
    );
    expect(state.error).toBeNull();
  });

  it('ignores subframe failures', () => {
    const state = navigationReducer(
      {loading: true, error: null},
      {
        type: 'load-failed',
        errorCode: -20,
        errorDescription: 'ERR_BLOCKED_BY_CSP',
        isMainFrame: false,
      }
    );
    expect(state.error).toBeNull();
  });

  it('load-finished on an idle frame is a no-op returning the same reference', () => {
    const state = navigationReducer(initialNavigationState, {type: 'load-finished'});
    expect(state).toBe(initialNavigationState);
  });
});
