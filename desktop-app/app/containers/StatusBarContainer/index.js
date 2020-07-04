// @flow
import React, {useEffect} from 'react';
import {ipcRenderer} from 'electron';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import StatusBar from '../../components/StatusBar';
import {toggleStatusBarVisibility} from '../../actions/statusBar';
import {STATUS_BAR_VISIBILITY_CHANGE} from '../../constants/pubsubEvents';

const StatusBarContainer = props => {
  useEffect(() => {
    const handler = () => {
      props.toggleStatusBarVisibility();
    };

    ipcRenderer.on(STATUS_BAR_VISIBILITY_CHANGE, handler);

    return () =>
      ipcRenderer.removeListener(STATUS_BAR_VISIBILITY_CHANGE, handler);
  }, []);

  return <StatusBar visible={props.visible} />;
};

function mapStateToProps(state) {
  return {
    visible: state.statusBar.visible,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({toggleStatusBarVisibility}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(StatusBarContainer);
