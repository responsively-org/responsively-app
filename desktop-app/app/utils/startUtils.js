import pubsub from 'pubsub.js';
import {START_MANAGEMENT_PREFERENCE_CHANGED} from '../constants/pubsubEvents';

export function notifyStartPreferenceChanged(newPreference) {
  pubsub.publish(START_MANAGEMENT_PREFERENCE_CHANGED, [newPreference]);
}
