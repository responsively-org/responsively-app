// @flow
import React, {Component, createRef} from 'react';
import {ipcRenderer, shell, remote} from 'electron';
import {toast} from 'react-toastify';
import _mergeImg from 'merge-img';
import {promisify} from 'util';
import Promise from 'bluebird';
import os from 'os';
import path from 'path';
import pubsub from 'pubsub.js';
import BugIcon from '../icons/Bug';
import ScreenshotIcon from '../icons/Screenshot';
import DeviceRotateIcon from '../icons/DeviceRotate';
import cx from 'classnames';
import fs from 'fs-extra';
import {iconsColor} from '../../constants/colors';

import styles from './style.module.css';
import {
  SCROLL_DOWN,
  SCROLL_UP,
  NAVIGATION_BACK,
  NAVIGATION_FORWARD,
  NAVIGATION_RELOAD,
} from '../../constants/pubsubEvents';

const mergeImg = Promise.promisifyAll(_mergeImg);
const BrowserWindow = remote.BrowserWindow;

const MESSAGE_TYPES = {
  scroll: 'scroll',
  click: 'click',
};

class WebView extends Component {
  constructor(props) {
    super(props);
    this.webviewRef = createRef();
    this.state = {
      screenshotInProgress: false,
      isTilted: false,
    };
  }

  componentDidMount() {
    this.webviewRef.current.addEventListener(
      'ipc-message',
      this.messageHandler
    );
    pubsub.subscribe('scroll', this.processScrollEvent);
    pubsub.subscribe('click', this.processClickEvent);
    pubsub.subscribe(SCROLL_DOWN, this.processScrollDownEvent);
    pubsub.subscribe(SCROLL_UP, this.processScrollUpEvent);
    pubsub.subscribe(NAVIGATION_BACK, this.processNavigationBackEvent);
    pubsub.subscribe(NAVIGATION_FORWARD, this.processNavigationForwardEvent);
    pubsub.subscribe(NAVIGATION_RELOAD, this.processNavigationReloadEvent);

    this.webviewRef.current.addEventListener('dom-ready', () => {
      this.initEventTriggers(this.webviewRef.current);
    });

    this.webviewRef.current.addEventListener('will-navigate', ({url}) => {
      console.log('Navigating to ', url);
      this.props.onAddressChange(url);
    });

    this.webviewRef.current.addEventListener('did-navigate', ({url}) => {
      if (this.props.transmitNavigatorStatus) {
        this.props.updateNavigatorStatus({
          backEnabled: this.webviewRef.current.canGoBack(),
          forwardEnabled: this.webviewRef.current.canGoForward(),
        });
      }
    });

    this.webviewRef.current.addEventListener('devtools-opened', () => {
      this.webviewRef.current
        .getWebContents()
        .devToolsWebContents.executeJavaScript(
          'DevToolsAPI.enterInspectElementMode()'
        );
    });
  }

  processNavigationBackEvent = () => {
    this.webviewRef.current.goBack();
  };

  processNavigationForwardEvent = () => {
    this.webviewRef.current.goForward();
  };

  processNavigationReloadEvent = () => {
    this.webviewRef.current.reload();
  };

  processScrollEvent = message => {
    if (message.sourceDeviceId === this.props.device.id) {
      return;
    }
    this.webviewRef.current.send('scrollMessage', message.position);
  };

  processClickEvent = message => {
    if (message.sourceDeviceId === this.props.device.id) {
      return;
    }
    this.webviewRef.current.send('clickMessage', message);
  };

  processScrollDownEvent = message => {
    console.log('processScrollDownEvent');
    this.webviewRef.current.send('scrollDownMessage');
  };

  processScrollUpEvent = message => {
    this.webviewRef.current.send('scrollUpMessage');
  };

  messageHandler = ({channel: type, args: [message]}) => {
    console.log('Message recieved', message);
    switch (type) {
      case MESSAGE_TYPES.scroll:
        pubsub.publish('scroll', [message]);
        return;
      case MESSAGE_TYPES.click:
        pubsub.publish('click', [message]);
        return;
    }
  };

  initEventTriggers = webview => {
    console.log('Initializing triggers');
    webview.getWebContents().executeJavaScript(`
      responsivelyApp.deviceId = ${this.props.device.id};
      document.body.addEventListener('mouseleave', () => responsivelyApp.mouseOn = false)
      document.body.addEventListener('mouseenter', () => responsivelyApp.mouseOn = true)

      window.addEventListener('scroll', (e) => {
        if (!responsivelyApp.mouseOn) {
          return;
        }
        window.responsivelyApp.sendMessageToHost(
          '${MESSAGE_TYPES.scroll}', 
          {
            sourceDeviceId: window.responsivelyApp.deviceId,
            position: {x: window.scrollX, y: window.scrollY},
          }
        );
      });

        document.addEventListener(
          'click', 
          (e) => {
            if (e.target === window.responsivelyApp.lastClickElement || e.responsivelyAppProcessed) {
              window.responsivelyApp.lastClickElement = null;
              e.responsivelyAppProcessed = true;
              return;
            } 
            e.responsivelyAppProcessed = true;
            console.log('clicked', e);
            window.responsivelyApp.sendMessageToHost(
              '${MESSAGE_TYPES.click}', 
              {
                sourceDeviceId: window.responsivelyApp.deviceId,
                cssPath: window.responsivelyApp.cssPath(e.target),
              }
            );
          },
          true
        );
    `);
  };

  _toggleDevTools = () => {
    const devtools = new BrowserWindow({
      fullscreen: false,
      acceptFirstMouse: true,
      show: true,
    });
    //devtools.hide();

    this.webviewRef.current
      .getWebContents()
      .setDevToolsWebContents(devtools.webContents);
    this.webviewRef.current.getWebContents().openDevTools({mode: 'detach'});
    //this.webviewRef.current.getWebContents().toggleDevTools();
  };

  _takeFullPageSnapshot = async () => {
    this.setState({screenshotInProgress: true});
    const toastId = toast.info(
      `Capturing ${this.props.device.name} screenshot...`,
      {autoClose: false}
    );
    //Hiding scrollbars in the screenshot
    await this.webviewRef.current.insertCSS(`
        .screenshotInProgress::-webkit-scrollbar {
          display: none;
        }
      `);

    //Get the windows's scroll details
    let scrollX = 0;
    let scrollY = 0;
    let pageX = 0;
    let pageY = 0;
    const {
      previousScrollPosition,
      scrollHeight,
      viewPortHeight,
      scrollWidth,
      viewPortWidth,
    } = await this.webviewRef.current.executeJavaScript(`
      document.body.classList.add('screenshotInProgress');
      responsivelyApp.screenshotVar = {
        previousScrollPosition : {
          left: window.scrollX, 
          top: window.scrollY,
        },
        scrollHeight: document.body.scrollHeight,
        scrollWidth: document.body.scrollWidth,
        viewPortHeight: document.documentElement.clientHeight,
        viewPortWidth: document.documentElement.clientWidth,
      };
      responsivelyApp.screenshotVar;
    `);

    let images = [];

    for (
      let pageY = 0;
      scrollY < scrollHeight;
      pageY++, scrollY = viewPortHeight * pageY
    ) {
      if (!images[pageY]) {
        images[pageY] = [];
      }
      scrollX = 0;
      for (
        let pageX = 0;
        scrollX < scrollWidth;
        pageX++, scrollX = viewPortWidth * pageX
      ) {
        console.log(`scrolling to ${scrollX}, ${scrollY}`);
        await this.webviewRef.current.executeJavaScript(`
          window.scrollTo(${scrollX}, ${scrollY})
        `);
        await this._delay(200);
        const options = {
          x: 0,
          y: 0,
          width: viewPortWidth,
          height: viewPortHeight,
        };
        if (scrollX + viewPortWidth > scrollWidth) {
          options.width = scrollWidth - scrollX;
          options.x = viewPortWidth - options.width;
        }
        if (scrollY + viewPortHeight > scrollHeight) {
          options.height = scrollHeight - scrollY;
          options.y = viewPortHeight - options.height;
        }
        console.log('Capture options', options);
        const image = await this._takeSnapshot(options);
        images[pageY].push(image);
      }
    }

    this.webviewRef.current.executeJavaScript(`
      window.scrollTo(${JSON.stringify(previousScrollPosition)});
      document.body.classList.remove('screenshotInProgress');
    `);

    toast.update(toastId, {
      render: `Processing ${this.props.device.name} screenshot...`,
      type: toast.TYPE.INFO,
    });

    images = await Promise.map(images, columnImages => {
      return mergeImg(
        columnImages.map(img => ({src: img.toPNG()})),
        {direction: false} //horizontal stitching
      );
    });

    const mergedImage = await (await mergeImg(
      await Promise.map(images, async img => {
        const getBufferAsync = promisify(img.getBuffer.bind(img));
        return {
          src: await getBufferAsync('image/png'),
        };
      }),
      {
        direction: true,
      }
    ))
      .rgba(false)
      .background(0xffffffff);
    const getBufferAsync = promisify(mergedImage.getBuffer.bind(mergedImage));
    await this._writeScreenshotFile(
      await getBufferAsync('image/png'),
      this._getScreenshotFileName()
    );
    toast.update(toastId, {
      render: `${this.props.device.name} screenshot taken!`,
      type: toast.TYPE.INFO,
      autoClose: 2000,
    });
    this.setState({screenshotInProgress: false});
  };

  _delay = ms =>
    new Promise((resolve, reject) => {
      setTimeout(() => resolve(), ms);
    });

  _takeSnapshot = options => {
    return this.webviewRef.current.getWebContents().capturePage(options);
  };

  _getScreenshotFileName(now = new Date()) {
    return `${this._getWebsiteName()} - ${this.props.device.name} - ${now
      .toLocaleDateString()
      .split('/')
      .reverse()
      .join('-')} at ${now
      .toLocaleTimeString([], {hour12: true})
      .replace(/\:/g, '.')
      .toUpperCase()}.png`;
  }

  _writeScreenshotFile = (content, name = new Date().getTime() + '.png') => {
    try {
      const folder = path.join(
        os.homedir(),
        `Desktop/Responsively-Screenshots`
      );
      fs.ensureDirSync(folder);
      const filePath = path.join(folder, name);
      fs.writeFileSync(filePath, content);
      shell.showItemInFolder(filePath);
    } catch (e) {
      console.log('err', e);
      alert('Failed to save the file !', e);
    }
  };

  _takeVisibleSectionSnapshot = async () => {
    const image = this._takeSnapshot();
    await this._writeScreenshotFile(
      image.toPNG(),
      this._getScreenshotFileName()
    );
  };

  _flipOrientation = () => {
    this.setState({isTilted: !this.state.isTilted});
  };

  _getWebsiteName = () => {
    let domain = new URL(this.props.browser.address).hostname;
    domain = domain.replace('www.', '');
    const dotIndex = domain.indexOf('.');
    if (dotIndex > -1) {
      domain = domain.substr(0, domain.indexOf('.'));
    }
    return domain.charAt(0).toUpperCase() + domain.slice(1);
  };

  render() {
    const {device, browser} = this.props;
    const deviceStyles = {
      width: this.state.isTilted ? device.height : device.width,
      height: this.state.isTilted ? device.width : device.height,
      transform: `scale(${browser.zoomLevel})`,
    };
    return (
      <div className={cx(styles.webViewContainer)}>
        <div className={cx(styles.webViewToolbar)}>
          <div
            className={cx(styles.webViewToolbarIcons)}
            onClick={this._toggleDevTools}
          >
            <BugIcon width={20} color={iconsColor} />
          </div>
          <div
            className={cx(styles.webViewToolbarIcons)}
            onClick={this._takeFullPageSnapshot}
          >
            <ScreenshotIcon height={15} color={iconsColor} />
          </div>
          <div
            className={cx(styles.webViewToolbarIcons)}
            onClick={this._flipOrientation}
          >
            <DeviceRotateIcon height={15} color={iconsColor} />
          </div>
        </div>
        <div
          className={cx(styles.deviceContainer)}
          style={{
            width: deviceStyles.width * browser.zoomLevel,
            heigth: deviceStyles.height * browser.zoomLevel,
          }}
        >
          <div
            className={cx(styles.screenshotOverlay, {
              [styles.screenshotInProgress]: this.state.screenshotInProgress,
            })}
            style={deviceStyles}
          />
          <webview
            ref={this.webviewRef}
            preload="./preload.js"
            className={cx(styles.device)}
            src={browser.address || 'about:blank'}
            useragent={device.useragent}
            style={deviceStyles}
          />
        </div>
      </div>
    );
  }
}

export default WebView;
