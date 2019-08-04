export const actionTypes = { CHANGE_ZOOM: 'CHANGE_ZOOM' };

export const actions = {
  setZoom: (zoomLevel) => {
    zoomLevel = zoomLevel / 100;
    return dispatch => {
      dispatch({
        type: actionTypes.CHANGE_ZOOM,
        zoom: zoomLevel,
      });
    }
  }
};

