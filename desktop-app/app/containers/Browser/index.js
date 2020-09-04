// @flow
import React, {Fragment} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import Grid from '@material-ui/core/Grid';
import Header from '../../components/Header';
import DevicePreviewerContainer from '../DevicePreviewerContainer';
import DrawerContainer from '../DrawerContainer';
import * as BrowserActions from '../../actions/browser';
import {DEVTOOLS_MODES} from '../../constants/previewerLayouts';

type Props = {};

const Browser = ({browser}) => (
  <Fragment>
    <Header />
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
