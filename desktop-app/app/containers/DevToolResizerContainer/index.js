// @flow
import React, {useEffect} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import DevToolsResizer from '../../components/DevToolsResizer';
import * as BrowserActions from '../../actions/browser';
import {useMediaQuery} from '@material-ui/core';
import {DARK_THEME} from '../../constants/theme';

const Component = props => {
  const isDarkTheme = useMediaQuery(`(prefers-color-scheme: ${DARK_THEME})`);
  return <DevToolsResizer {...props} isDarkTheme={isDarkTheme} />;
};

function mapStateToProps(state) {
  return {
    ...state.browser.devToolsConfig,
    isInspecting: state.browser.isInspecting,
    devices: state.availableWorkspaces.byId[state.workspace].devices,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(BrowserActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Component);
