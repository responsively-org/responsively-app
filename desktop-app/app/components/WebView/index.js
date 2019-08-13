// @flow
import React, {Component, createRef} from 'react';
import {ipcRenderer} from 'electron';
import cx from 'classnames';

import styles from './style.module.css';

class WebView extends Component {
  constructor(props) {
    super(props);
    this.webviewRef = createRef();
  }

  componentDidMount() {
    console.log('this.webviewRef', this.webviewRef);
    this.webviewRef.current.addEventListener('ipc-message', event =>
      console.log('Message recieved', event)
    );

    this.webviewRef.current.addEventListener('dom-ready', () => {
      this.initEventTriggers(this.webviewRef.current);
    });
  }

  initEventTriggers = webview => {
    console.log('Initializing triggers');
    webview.getWebContents().executeJavaScript(`
      window.addEventListener('scroll', () => responsivelyApp.sendMessageToHost('scroll', {x: window.scrollX, y: window.scrollY}));
    `);
  };

  render() {
    console.log('Renderer this.props', this.props);
    return (
      <webview
        ref={this.webviewRef}
        preload="./preload.js"
        className={cx(styles.device)}
        src={this.props.src || 'about:blank'}
        style={{
          width: this.props.width,
          height: this.props.height,
          transform: `scale(${this.props.zoomLevel})`,
        }}
      />
    );
  }
}

export default WebView;
