import {actionTypes} from './actions';

const initialState = {
  zoom: 1,
}

export default function previewReducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.CHANGE_ZOOM:
      return {...state, zoom: action.zoom};
    default:
      return state
  }
}