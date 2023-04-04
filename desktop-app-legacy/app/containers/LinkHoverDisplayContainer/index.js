import React from 'react';
import {connect} from 'react-redux';
import LinkHoverDisplay from '../../components/LinkHoverDisplay';

const LinkHoverDisplayContainer = ({url}) => (
  <LinkHoverDisplay visible={!!url.length} url={url} />
);

const mapState = state => ({
  url: state.browser.hoveredLink,
});

export default connect(mapState)(LinkHoverDisplayContainer);
