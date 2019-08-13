// @flow
import React, {Component, createRef} from 'react';
import {ipcRenderer} from 'electron';
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
    // TODO Improve it to avoid the delay by not triggering a scroll event when it is triggered by message
    var lastTimeScrolled = null;
    var theElementYouCareAbout = document;
    var intervalMilliSeconds = 100; // interval goes here
    window.onscroll = function(){
      if (performance.now() - lastTimeScrolled > intervalMilliSeconds){
        var intervalScroll = setInterval(function(){
          if (performance.now() - lastTimeScrolled > intervalMilliSeconds){
            onScrollStop();
            clearInterval(intervalScroll);
          }
        }.bind(intervalScroll).bind(intervalMilliSeconds), 100);
      }
      lastTimeScrolled = performance.now();
    }.bind(intervalMilliSeconds);
    
    function onScrollStop (){
      console.log('scroll stopped');
      responsivelyApp.sendMessageToHost(
        '${MESSAGE_TYPES.scroll}', 
        {x: window.scrollX, y: window.scrollY}
      );
    }
      /*window.addEventListener('scroll', (e) => {
        console.log('e', e.originalEvent, e);
          responsivelyApp.sendMessageToHost(
            '${MESSAGE_TYPES.scroll}', 
            {x: window.scrollX, y: window.scrollY}
          );
      })*/
    `);
  };

  render() {
    console.log('WebView this.props', this.props);
    const {device, browser} = this.props;
    return (
      <webview
        ref={this.webviewRef}
        preload="./preload.js"
        className={cx(styles.device)}
        src={browser.address || 'about:blank'}
        style={{
          width: device.width,
          height: device.height,
          transform: `scale(${browser.zoomLevel})`,
        }}
      />
    );
  }
}

export default WebView;
