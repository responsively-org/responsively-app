// @flow
import React, {useEffect} from 'react';
import {ipcRenderer} from 'electron';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import StatusBar from '../../components/StatusBar';
import {toggleStatusBarVisibility as _toggleStatusBarVisibility} from '../../actions/statusBar';
import {STATUS_BAR_VISIBILITY_CHANGE} from '../../constants/pubsubEvents';

const StatusBarContainer = ({visible, zoomLevel, toggleStatusBarVisibility}) => {
  useEffect(() => {
    const handler = () => {
      toggleStatusBarVisibility();
    };

    ipcRenderer.on(STATUS_BAR_VISIBILITY_CHANGE, handler);

    return () =>
      ipcRenderer.removeListener(STATUS_BAR_VISIBILITY_CHANGE, handler);
  }, []);

  return <StatusBar visible={visible} zoomLevel={zoomLevel}/>;
};

function mapStateToProps(state) {
  return {
    visible: state.statusBar.visible,
    zoomLevel: state.browser.zoomLevel
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {toggleStatusBarVisibility: _toggleStatusBarVisibility},
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(StatusBarContainer);
