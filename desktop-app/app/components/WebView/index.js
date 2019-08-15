// @flow
import React, {Component, createRef} from 'react';
import {ipcRenderer} from 'electron';
import BugIcon from '../icons/Bug';
import cx from 'classnames';

import styles from './style.module.css';

const MESSAGE_TYPES = {
  scroll: 'scroll',
};

class WebView extends Component {
  constructor(props) {
    super(props);
    this.webviewRef = createRef();
  }

  componentDidMount() {
    this.webviewRef.current.addEventListener(
      'ipc-message',
      this.messageHandler
    );

    this.webviewRef.current.addEventListener('dom-ready', () => {
      this.initEventTriggers(this.webviewRef.current);
    });

    this.webviewRef.current.addEventListener('will-navigate', ({url}) => {
      console.log('Navigating to ', url);
      this.props.onAddressChange(url);
    });
  }

  componentDidUpdate(prevProps, prevState) {
    this.processIfScrollChange(prevProps);
  }

  processIfScrollChange = prevProps => {
    const {
      browser: {
        scrollPosition: {x: prevX, y: prevY},
      },
    } = prevProps;
    const {
      browser: {
        scrollPosition: {x, y},
      },
    } = this.props;
    if (x === prevX && y === prevY) {
      return;
    }
    console.log('Scrolling to ', {x, y});
    this.webviewRef.current.send('scroll', {x, y});
  };

  messageHandler = ({channel: type, args: [message]}) => {
    console.log('Message recieved', message);
    switch (type) {
      case MESSAGE_TYPES.scroll:
        this.props.onScrollChange(message);
        return;
    }
  };

  initEventTriggers = webview => {
    console.log('Initializing triggers');
    webview.getWebContents().executeJavaScript(`
      document.body.addEventListener('mouseleave', () => responsivelyApp.mouseOn = false)
      document.body.addEventListener('mouseenter', () => responsivelyApp.mouseOn = true)

      window.addEventListener('scroll', (e) => {
        if (!responsivelyApp.mouseOn) {
          return;
        }
        responsivelyApp.sendMessageToHost(
          '${MESSAGE_TYPES.scroll}', 
          {x: window.scrollX, y: window.scrollY}
        );
      })
    `);
  };

  _toggleDevTools = () => {
    this.webviewRef.current.getWebContents().toggleDevTools();
  };

  render() {
    console.log('WebView this.props', this.props);
    const {device, browser} = this.props;
    return (
      <div className={cx(styles.webViewContainer)}>
        <div className={cx(styles.webViewToolbar)}>
          <div
            className={cx(styles.webViewToolbarIcons)}
            onClick={this._toggleDevTools}
          >
            <BugIcon width={20} color="#03ce6c" />
          </div>
        </div>
        <webview
          ref={this.webviewRef}
          preload="./preload.js"
          className={cx(styles.device)}
          src={browser.address || 'about:blank'}
          useragent={device.useragent}
          style={{
            width: device.width,
            height: device.height,
            transform: `scale(${browser.zoomLevel})`,
          }}
        />
      </div>
    );
  }
}

export default WebView;
