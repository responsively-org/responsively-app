// @flow
import {statusBarSettings} from '../settings/statusBarSettings';

export const TOGGLE_STATUS_BAR_VISIBILITY = 'TOGGLE_STATUS_BAR_VISIBILITY';

export function toggleStatusBarVisibility() {
  const newVisibility = !statusBarSettings.getVisibility();
  statusBarSettings.setVisibility(newVisibility);

  return {
    type: TOGGLE_STATUS_BAR_VISIBILITY,
    visible: newVisibility,
  };
}
