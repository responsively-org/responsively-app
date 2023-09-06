// @flow
import {TOGGLE_STATUS_BAR_VISIBILITY} from '../actions/statusBar';
import {statusBarSettings} from '../settings/statusBarSettings';

export type StatusBarStateType = {visible: boolean};

export default function app(
  state: StatusBarStateType = {visible: statusBarSettings.getVisibility()},
  action: Action
) {
  switch (action.type) {
    case TOGGLE_STATUS_BAR_VISIBILITY:
      return {
        ...state,
        visible: action.visible,
      };
    default:
      return state;
  }
}
