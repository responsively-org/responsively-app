/**
 * Navigation state for one preview webview, driven exclusively by webview
 * events so scattered setState calls can't disagree about what the frame is
 * doing (the #1482-class of bugs). Pure reducer — unit-tested.
 */

// Chromium's net::ERR_ABORTED: fired for superseded navigations; never a
// user-visible failure.
const ERR_ABORTED = -3;

export interface NavigationError {
  code: number;
  description: string;
}

export interface NavigationState {
  loading: boolean;
  error: NavigationError | null;
}

export type NavigationEvent =
  | {type: 'load-started'}
  | {type: 'load-finished'}
  | {type: 'load-failed'; errorCode: number; errorDescription: string; isMainFrame: boolean};

export const initialNavigationState: NavigationState = {loading: false, error: null};

export const navigationReducer = (
  state: NavigationState,
  event: NavigationEvent
): NavigationState => {
  switch (event.type) {
    case 'load-started':
      return {loading: true, error: null};
    case 'load-finished':
      return state.loading ? {...state, loading: false} : state;
    case 'load-failed': {
      // Subframe failures (e.g. iframe CSP violations) and superseded loads
      // must not blank the whole preview with an error overlay.
      if (event.errorCode === ERR_ABORTED || !event.isMainFrame) {
        return state;
      }
      return {...state, error: {code: event.errorCode, description: event.errorDescription}};
    }
    default:
      return state;
  }
};
