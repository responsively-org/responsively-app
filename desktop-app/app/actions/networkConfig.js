import pubsub from 'pubsub.js';
import type {Dispatch, GetState} from '../reducers/types';
import {
  SET_NETWORK_TROTTLING_PROFILE,
  CLEAR_NETWORK_CACHE
} from '../constants/pubsubEvents';

export const CHANGE_ACTIVE_THROTTLING_PROFILE = 'CHANGE_ACTIVE_THROTTLING_PROFILE';
export const SAVE_THROTTLING_PROFILES = 'SAVE_THROTTLING_PROFILES';

export function changeActiveThrottlingProfile(title='Online') {
  return {
      type: CHANGE_ACTIVE_THROTTLING_PROFILE,
      title,
  };
}

export function saveThrottlingProfilesList(profiles) {
  return {
      type: SAVE_THROTTLING_PROFILES,
      profiles,
  };
}

export function onActiveThrottlingProfileChanged(title) {
  return (dispatch: Dispatch, getState: GetState) => {
    const {
      browser: {networkConfiguration: {throttling}},
    } = getState();

    const activeProfile = throttling.find(x => x.title === title);

    if (activeProfile != null) {
      pubsub.publish(SET_NETWORK_TROTTLING_PROFILE, [activeProfile]);
      dispatch(changeActiveThrottlingProfile(title))
    }
  };
}

export function onThrottlingProfilesListChanged(profiles) {
  return (dispatch: Dispatch, getState: GetState) => {
    dispatch(saveThrottlingProfilesList(profiles));
    const activeProfile = profiles.find(x => x.type === 'Online');
    pubsub.publish(SET_NETWORK_TROTTLING_PROFILE, [activeProfile]);
  };
}

export function onClearNetworkCache() {
  return (dispatch: Dispatch, getState: GetState) => {
    pubsub.publish(CLEAR_NETWORK_CACHE);
  };
}
