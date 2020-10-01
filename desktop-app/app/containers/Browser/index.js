// @flow
import React, {Fragment} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import Grid from '@material-ui/core/Grid';
import DevicePreviewerContainer from '../DevicePreviewerContainer';
import DrawerContainer from '../DrawerContainer';
import * as BrowserActions from '../../actions/browser';
import {DEVTOOLS_MODES} from '../../constants/previewerLayouts';
import LeftIconsPaneContainer from '../LeftIconsPaneContainer';
import HeaderContainer from '../HeaderContainer';
import Toolbar from '../../components/Toolbar';
import os from 'os';

const Browser = ({browser}) => (
  <Fragment>
    {os.platform() === 'darwin' && <Toolbar />}
    <HeaderContainer />
    <div style={{display: 'flex', height: '100%'}}>
      <LeftIconsPaneContainer />
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          overflowX: 'hidden',
          flexGrow: 1,
          flexBasis: 0,
        }}
      >
        <DrawerContainer />
        <div
          style={{
            display: 'flex',
            flex: 1,
            height: '100%',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <DevicePreviewerContainer />
          {browser.devToolsConfig.open &&
          browser.devToolsConfig.mode === DEVTOOLS_MODES.BOTTOM ? (
            <div
              style={{
                display: 'flex',
                width: '100%',
                height: browser.devToolsConfig.size.height,
              }}
            />
          ) : null}
        </div>
        {browser.devToolsConfig.open &&
        browser.devToolsConfig.mode === DEVTOOLS_MODES.RIGHT ? (
          <div
            style={{
              height: '100%',
              width: browser.devToolsConfig.size.width,
              display: 'flex',
            }}
          />
        ) : null}
      </div>
    </div>
  </Fragment>
);

function mapStateToProps(state) {
  return {
    browser: state.browser,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(BrowserActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Browser);
