import { combineReducers } from 'redux';

import previewReducer from './preview/reducer';

export default combineReducers({
  preview: previewReducer
})