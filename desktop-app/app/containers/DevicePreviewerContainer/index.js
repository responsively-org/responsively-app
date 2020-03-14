// @flow
import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import DevicesPreviewer from '../../components/DevicesPreviewer';
import * as BrowserActions from '../../actions/browser';

function mapStateToProps(state) {
    return {
        browser: state.browser,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(BrowserActions, dispatch);
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DevicesPreviewer);
