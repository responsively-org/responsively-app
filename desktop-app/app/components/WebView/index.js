import React, {Component, createRef} from 'react';
import {remote, ipcRenderer} from 'electron';
import cx from 'classnames';
import {Resizable} from 're-resizable';
import {Tooltip} from '@material-ui/core';
import {withStyles, withTheme} from '@material-ui/core/styles';
import debounce from 'lodash/debounce';
import pubsub from 'pubsub.js';
import BugIcon from '../icons/Bug';
import FullScreenshotIcon from '../icons/FullScreenshot';
import ScreenshotIcon from '../icons/Screenshot';
import DeviceRotateIcon from '../icons/DeviceRotate';
import {
  SCROLL_DOWN,
  SCROLL_UP,
  NAVIGATION_BACK,
  NAVIGATION_FORWARD,
  NAVIGATION_RELOAD,
  SCREENSHOT_ALL_DEVICES,
  FLIP_ORIENTATION_ALL_DEVICES,
  TOGGLE_DEVICE_MUTED_STATE,
  RELOAD_CSS,
  DELETE_STORAGE,
  ADDRESS_CHANGE,
  STOP_LOADING,
  CLEAR_NETWORK_CACHE,
  SET_NETWORK_TROTTLING_PROFILE,
  OPEN_CONSOLE_FOR_DEVICE,
  PROXY_AUTH_ERROR,
  APPLY_CSS,
  TOGGLE_DEVICE_DESIGN_MODE_STATE,
  TOGGLE_EVENT_MIRRORING_ALL_DEVICES,
} from '../../constants/pubsubEvents';
import {CAPABILITIES} from '../../constants/devices';
import {DESIGN_MODE_JS_VALUES} from '../../constants/values';

import styles from './style.module.css';
import {styles as commonStyles} from '../useCommonStyles';
import UnplugIcon from '../icons/Unplug';
import {captureScreenshot} from './screenshotUtil';
import {
  DEVTOOLS_MODES,
  INDIVIDUAL_LAYOUT,
} from '../../constants/previewerLayouts';
import Maximize from '../icons/Maximize';
import Minimize from '../icons/Minimize';
import Focus from '../icons/Focus';
import Unfocus from '../icons/Unfocus';
import DesignModeIcon from '../icons/DesignMode';
import {captureOnSentry} from '../../utils/logUtils';
import {getBrowserSyncEmbedScriptURL} from '../../services/browserSync';
import Spinner from '../Spinner';
import {isSslValidationFailed} from '../../utils/generalUtils';

const {BrowserWindow} = remote;

const MESSAGE_TYPES = {
  scroll: 'scroll',
  click: 'click',
  openDevToolsInspector: 'openDevToolsInspector',
  openConsole: 'openConsole',
  tiltDevice: 'tiltDevice',
  takeScreenshot: 'takeScreenshot',
  toggleEventMirroring: 'toggleEventMirroring',
};

class WebView extends Component {
  constructor(props) {
    super(props);
    this.webviewRef = createRef();
    this.devToolsWebviewRef = createRef();
    this.state = {
      screenshotInProgress: false,
      isTilted: false,
      isUnplugged: false,
      errorCode: null,
      errorDesc: null,
      deviceDimensions: {
        width: this.props.device.width,
        height: this.props.device.height,
      },
      temporaryDims: null,
      address: this.props.browser.address,
      proxyAuthError: false,
      fullDocumentHeight: null,
      fullDocumentWidth: null,
      zoomLevel: null,
    };
    this.subscriptions = [];
    this.domLoaded = false;
    this.liveCssKey = null;
    this.dbg = null;
  }

  componentDidMount() {
    // this.initDeviceEmulationParams();
    this.webviewRef.current.addEventListener(
      'ipc-message',
      this.messageHandler
    );
    this.subscriptions.push(
      pubsub.subscribe('scroll', this.processScrollEvent)
    );
    this.subscriptions.push(
      pubsub.subscribe(APPLY_CSS, this.processApplyCssEvent)
    );
    this.subscriptions.push(pubsub.subscribe('click', this.processClickEvent));
    this.subscriptions.push(
      pubsub.subscribe(SCROLL_DOWN, this.processScrollDownEvent)
    );
    this.subscriptions.push(
      pubsub.subscribe(SCROLL_UP, this.processScrollUpEvent)
    );
    this.subscriptions.push(
      pubsub.subscribe(NAVIGATION_BACK, this.processNavigationBackEvent)
    );
    this.subscriptions.push(
      pubsub.subscribe(NAVIGATION_FORWARD, this.processNavigationForwardEvent)
    );
    this.subscriptions.push(
      pubsub.subscribe(NAVIGATION_RELOAD, this.processNavigationReloadEvent)
    );
    this.subscriptions.push(
      pubsub.subscribe(RELOAD_CSS, this.processReloadCSSEvent)
    );
    this.subscriptions.push(
      pubsub.subscribe(DELETE_STORAGE, this.processDeleteStorageEvent)
    );
    this.subscriptions.push(
      pubsub.subscribe(SCREENSHOT_ALL_DEVICES, this.processScreenshotEvent)
    );
    this.subscriptions.push(
      pubsub.subscribe(
        TOGGLE_EVENT_MIRRORING_ALL_DEVICES,
        this.processToggleEventMirroring
      )
    );
    this.subscriptions.push(
      pubsub.subscribe(ADDRESS_CHANGE, this.processAddressChangeEvent)
    );
    this.subscriptions.push(
      pubsub.subscribe(STOP_LOADING, this.processStopLoadingEvent)
    );
    this.subscriptions.push(
      pubsub.subscribe(
        FLIP_ORIENTATION_ALL_DEVICES,
        this.processFlipOrientationEvent
      )
    );
    this.subscriptions.push(
      pubsub.subscribe(TOGGLE_DEVICE_MUTED_STATE, this.processToggleMuteEvent)
    );
    this.subscriptions.push(
      pubsub.subscribe(
        TOGGLE_DEVICE_DESIGN_MODE_STATE,
        this.changeDesignModeState
      )
    );

    this.subscriptions.push(
      pubsub.subscribe(
        SET_NETWORK_TROTTLING_PROFILE,
        this.setNetworkThrottlingProfile
      )
    );

    this.subscriptions.push(
      pubsub.subscribe(CLEAR_NETWORK_CACHE, this.clearNetworkCache)
    );

    this.subscriptions.push(
      pubsub.subscribe(PROXY_AUTH_ERROR, this.onProxyError)
    );

    this.subscriptions.push(
      pubsub.subscribe(
        OPEN_CONSOLE_FOR_DEVICE,
        this.processOpenConsoleForDeviceEvent
      )
    );

    this.webviewRef.current.addEventListener('dom-ready', () => {
      this.initEventTriggers(this.webviewRef.current);
      this.dbg = this.getWebContents().debugger;
      if (!this.dbg.isAttached()) {
        this.dbg.attach();
        this.dbg.on('message', this._onDebuggerEvent);
      }
      if (this.isMobile) this.hideScrollbar();
    });

    if (this.props.transmitNavigatorStatus) {
      this.webviewRef.current.addEventListener(
        'page-favicon-updated',
        ({favicons}) => this.props.onPageMetaFieldUpdate('favicons', favicons)
      );

      this.webviewRef.current.addEventListener(
        'page-title-updated',
        ({title}) => this.props.onPageMetaFieldUpdate('title', title)
      );

      this.webviewRef.current.addEventListener('new-window', e => {
        if (
          e.url.startsWith('file://') &&
          !this.webviewRef.current.getURL().startsWith('file://')
        ) {
          this.webviewRef.current
            .executeJavaScript(
              `{
                console.error('Not allowed to load local resource');
              }`
            )
            .catch(captureOnSentry);
          return;
        }
        ipcRenderer.send('open-new-window', {url: e.url});
      });
    }

    this.webviewRef.current.addEventListener('did-start-loading', () => {
      this.setState({errorCode: null, errorDesc: null, proxyAuthError: false});
      this.props.onLoadingStateChange(true);
      this.props.deviceLoadingChange({id: this.props.device.id, loading: true});
    });
    this.webviewRef.current.addEventListener('did-stop-loading', () => {
      this.props.onLoadingStateChange(false);
      this.props.deviceLoadingChange({
        id: this.props.device.id,
        loading: false,
      });
      this.changeDesignModeState({
        designMode: !!this.props.device.designMode,
      });
    });
    this.webviewRef.current.addEventListener(
      'did-fail-load',
      ({errorCode, errorDescription}) => {
        if (errorCode === -3) {
          // Aborted error, can be ignored
          return;
        }
        this.setState({
          errorCode,
          errorDesc: errorDescription,
        });
      }
    );

    this.webviewRef.current.addEventListener(
      'login',
      (event, request, authInfo, callback) => {
        event.preventDefault();
        callback('username', 'secret');
      }
    );

    const urlChangeHandler = async ({url, isMainFrame = true}) => {
      if (!isMainFrame || url === this.props.browser.address) {
        return;
      }
      await new Promise(r => setTimeout(r, 200));
      this.props.onAddressChange(url);
    };

    const navigationHandler = event => {
      if (this.props.transmitNavigatorStatus) {
        this.props.updateNavigatorStatus({
          backEnabled: this.webviewRef.current.canGoBack(),
          forwardEnabled: this.webviewRef.current.canGoForward(),
        });
      }
    };

    this.webviewRef.current.addEventListener('will-navigate', urlChangeHandler);

    this.webviewRef.current.addEventListener('did-navigate-in-page', event => {
      navigationHandler(event);
      urlChangeHandler(event);
    });

    this.webviewRef.current.addEventListener('did-navigate', event => {
      urlChangeHandler(event);
      navigationHandler(event);
    });

    this.webviewRef.current.addEventListener('update-target-url', event => {
      this.props.setHoveredLink(event.url);
    });

    this.webviewRef.current.addEventListener('devtools-closed', () => {
      if (
        this.props.browser.devToolsConfig.mode === DEVTOOLS_MODES.UNDOCKED &&
        this._isDevToolsOpen()
      ) {
        this._toggleDevTools();
      }
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.device.isMuted !== this.props.device.isMuted) {
      if (this.props.device.isMuted) {
        this._muteWebView();
      } else {
        this._unmuteWebView();
      }
    }

    if (prevProps.device.designMode !== this.props.device.designMode) {
      this.changeDesignModeState({
        designMode: !!this.props.device.designMode,
      });
    }
  }

  getWebContentsId() {
    return this.webviewRef.current.getWebContentsId();
  }

  getWebContents() {
    return this.getWebContentForId(this.getWebContentsId());
  }

  getWebContentForId(id) {
    return remote.webContents.fromId(id);
  }

  componentWillUnmount() {
    this.subscriptions.forEach(pubsub.unsubscribe);
    if (this.dbg && this.dbg.isAttached()) this.dbg.detach();
  }

  initDeviceEmulationParams = () => {
    try {
      return;
      this.getWebContents().enableDeviceEmulation({
        screenPosition: this.isMobile ? 'mobile' : 'desktop',
        screenSize: {
          width: this.props.device.width,
          height: this.props.device.height,
        },
        deviceScaleFactor: this.props.device.dpr,
      });
    } catch (err) {
      console.log('err', err);
    }
  };

  processNavigationBackEvent = () => {
    this.webviewRef.current.goBack();
  };

  processNavigationForwardEvent = () => {
    this.webviewRef.current.goForward();
  };

  processNavigationReloadEvent = ({ignoreCache}) => {
    if (ignoreCache) {
      return this.webviewRef.current.reloadIgnoringCache();
    }
    this.webviewRef.current.reload();
  };

  processReloadCSSEvent = () => {
    this.webviewRef.current
      .executeJavaScript(
        `{
        var elements = document.querySelectorAll('link[rel=stylesheet][href]');
        elements.forEach(element=>{
          var href = element.href;
          if(href){
            var href = href.replace(/[?&]invalidateCacheParam=([^&$]*)/,'');
            element.href = href + (href.indexOf('?')>=0?'&':'?') + 'invalidateCacheParam=' + (new Date().valueOf());
          }
        })
    }`
      )
      .catch(captureOnSentry);
  };

  processAddressChangeEvent = ({address, force}) => {
    if (address !== this.webviewRef.current.src) {
      if (force) {
        this.webviewRef.current.loadURL(address);
      }
      this.setState({
        address,
      });
    }
  };

  processStopLoadingEvent = () => {
    this.webviewRef.current.stop();
  };

  processDeleteStorageEvent = ({storages}) => {
    this.getWebContents().session.clearStorageData({storages});
  };

  processScrollEvent = message => {
    if (
      this.state.isUnplugged ||
      message.sourceDeviceId === this.props.device.id
    ) {
      return;
    }
    this.webviewRef.current.send('scrollMessage', message.position);
  };

  processClickEvent = message => {
    if (
      this.state.isUnplugged ||
      message.sourceDeviceId === this.props.device.id
    ) {
      return;
    }
    this.webviewRef.current.send('clickMessage', message);
  };

  processScrollDownEvent = message => {
    if (this.state.isUnplugged) {
      return;
    }
    this.webviewRef.current.send('scrollDownMessage');
  };

  processScrollUpEvent = message => {
    if (this.state.isUnplugged) {
      return;
    }
    this.webviewRef.current.send('scrollUpMessage');
  };

  processToggleEventMirroring = async ({status}) => {
    if (status) {
      this.setState(
        () => ({
          ...this.state,
          isUnplugged: !status,
        }),
        async () => {
          await this.openBrowserSyncSocket(this.webviewRef.current);
        }
      );
    } else {
      this.setState(
        () => ({
          ...this.state,
          isUnplugged: !status,
        }),
        async () => {
          await this.closeBrowserSyncSocket(this.webviewRef.current);
        }
      );
    }
  };

  processScreenshotEvent = async ({
    now,
    fullScreen = true,
    deviceId,
  }: {
    now?: Date,
    fullScreen?: boolean,
  }) => {
    if (deviceId && this.props.device.id !== deviceId) {
      return;
    }
    this.setState({screenshotInProgress: true});
    try {
      await this.closeBrowserSyncSocket(this.webviewRef.current);
      await captureScreenshot({
        address: this.props.browser.address,
        device: this.props.device,
        webView: this.webviewRef.current,
        createSeparateDir: now != null,
        fullScreen,
        now,
        removeFixedPositionedElements: this.props.browser.userPreferences
          .removeFixedPositionedElements,
        screenshotMechanism: this.props.browser.userPreferences
          .screenshotMechanism,
        setFullDocumentDimensions: this._setFullDocumentDimensions,
      });
    } catch (err) {
      console.log('Error during screen capture', err);
    }
    await this.openBrowserSyncSocket(this.webviewRef.current);
    this.setState({screenshotInProgress: false});
  };

  processFlipOrientationEvent = (message = {}) => {
    const {deviceId} = message;
    if (deviceId && this.props.device.id !== deviceId) {
      return;
    }
    this._flipOrientation();
  };

  processToggleMuteEvent = ({muted}) => {
    this.getWebContents().setAudioMuted(muted);
  };

  changeDesignModeState = ({designMode}) => {
    this.webviewRef.current
      .executeJavaScript(
        `document.designMode = "${
          designMode ? DESIGN_MODE_JS_VALUES.ON : DESIGN_MODE_JS_VALUES.OFF
        }";`
      )
      .catch(captureOnSentry);
  };

  processOpenDevToolsInspectorEvent = message => {
    const {
      x: webViewX,
      y: webViewY,
    } = this.webviewRef.current.getBoundingClientRect();
    const {x: deviceX, y: deviceY} = message;
    const zoomFactor = this.props.browser.zoomLevel;
    if (this.props.browser.isInspecting) {
      this.props.toggleInspector();
    }
    if (!this._isDevToolsOpen()) {
      this._toggleDevTools();
    }
    this.getWebContents().inspectElement(
      Math.round(webViewX + deviceX * zoomFactor),
      Math.round(webViewY + deviceY * zoomFactor)
    );
  };

  processOpenConsoleForDeviceEvent = message => {
    const {deviceId} = message;
    if (this.props.device.id !== deviceId) {
      return;
    }
    this._toggleDevTools();
  };

  setNetworkThrottlingProfile = ({type, downloadKps, uploadKps, latencyMs}) => {
    // TODO : change this when https://github.com/electron/electron/issues/21250 is solved
    // if (type === 'Online') {
    //   this.getWebContents().session.disableNetworkEmulation();
    // } else if (type === 'Offline') {
    //   this.getWebContents().session.enableNetworkEmulation({offline: true});
    // } else if (type === 'Custom') {
    //   const downloadThroughput = downloadKps != null? downloadKps * 128 : undefined;
    //   const uploadThroughput = uploadKps != null? uploadKps * 128 : undefined;
    //   this.getWebContents().session.enableNetworkEmulation({offline: false, latency: latencyMs, downloadThroughput, uploadThroughput });
    // }

    // WORKAROUND
    if (type === 'Online') {
      this.dbg.sendCommand('Network.disable');
    } else if (type === 'Offline') {
      this.dbg.sendCommand('Network.enable').then(_ => {
        this.dbg.sendCommand('Network.emulateNetworkConditions', {
          offline: true,
          latency: 0,
          downloadThroughput: -1,
          uploadThroughput: -1,
        });
      });
    } else {
      const downloadThroughput = downloadKps != null ? downloadKps * 128 : -1;
      const uploadThroughput = uploadKps != null ? uploadKps * 128 : -1;
      const latency = latencyMs || 0;
      this.dbg.sendCommand('Network.enable').then(_ => {
        this.dbg.sendCommand('Network.emulateNetworkConditions', {
          offline: false,
          latency,
          downloadThroughput,
          uploadThroughput,
        });
      });
    }
  };

  clearNetworkCache = () => {
    this.getWebContents().session.clearCache();
  };

  onProxyError = () => {
    this.setState({proxyAuthError: true});
  };

  messageHandler = ({channel: type, args: [message]}) => {
    if (type !== MESSAGE_TYPES.toggleEventMirroring && this.state.isUnplugged) {
      return;
    }
    switch (type) {
      case MESSAGE_TYPES.scroll:
        pubsub.publish('scroll', [message]);
        return;
      case MESSAGE_TYPES.click:
        pubsub.publish('click', [message]);
        return;
      case MESSAGE_TYPES.openDevToolsInspector:
        this.processOpenDevToolsInspectorEvent(message);
        return;
      case MESSAGE_TYPES.openConsole:
        this._toggleDevTools();
        return;
      case MESSAGE_TYPES.tiltDevice:
        this._flipOrientation();
        return;
      case MESSAGE_TYPES.takeScreenshot:
        this.processScreenshotEvent({});
        return;
      case MESSAGE_TYPES.toggleEventMirroring:
        this._unPlug();
        break;
      default:
        break;
    }
  };

  initBrowserSync = async webview => {
    await this.getWebContentForId(webview.getWebContentsId())
      .executeJavaScript(
        `
          var bsScript= document.createElement('script');
          bsScript.src = '${getBrowserSyncEmbedScriptURL()}';
          bsScript.async = true;
          document.body.appendChild(bsScript);
          true
        `
      )
      .catch(captureOnSentry);
  };

  closeBrowserSyncSocket = async webview => {
    await this.getWebContentForId(webview.getWebContentsId())
      .executeJavaScript(
        `
        if(window.___browserSync___){
          window.___browserSync___.socket.close()
        }
        true
      `
      )
      .catch(captureOnSentry);
  };

  openBrowserSyncSocket = async webview => {
    await this.getWebContentForId(webview.getWebContentsId())
      .executeJavaScript(
        `
        if(window.___browserSync___){
          window.___browserSync___.socket.open()
        }
        true
      `
      )
      .catch(captureOnSentry);
  };

  processApplyCssEvent = async message => {
    if (!message.css || !this.domLoaded) {
      return;
    }
    if (this.liveCssKey) {
      this.webviewRef.current.removeInsertedCSS(this.liveCssKey);
      this.liveCssKey = null;
    }
    this.liveCssKey = await this.webviewRef.current.insertCSS(message.css);
  };

  initEventTriggers = async webview => {
    await this.initBrowserSync(webview);
    this.getWebContentForId(webview.getWebContentsId())
      .executeJavaScript(
        `{
          responsivelyApp.deviceId = '${this.props.device.id}';
        }`
      )
      .catch(captureOnSentry);

    if (this.state.isUnplugged) {
      await this.closeBrowserSyncSocket(webview);
    }
    this.domLoaded = true;
  };

  hideScrollbar = () => {
    this.webviewRef.current.insertCSS(
      `
        ::-webkit-scrollbar {
          display: none;
        }
        `
    );
  };

  _setFullDocumentDimensions = (
    fullDocumentHeight,
    fullDocumentWidth,
    zoomLevel = null
  ) => {
    this.setState({fullDocumentHeight, fullDocumentWidth, zoomLevel});
  };

  _isDevToolsOpen = () =>
    !!this.props.browser.devToolsConfig.activeDevTools.find(
      ({deviceId}) => deviceId === this.props.device.id
    );

  _toggleDevTools = () => {
    if (this._isDevToolsOpen()) {
      return this.props.onDevToolsClose({
        deviceId: this.props.device.id,
        webViewId: this.getWebContentsId(),
      });
    }
    this.props.onDevToolsOpen(this.props.device.id, this.getWebContentsId());
  };

  _flipOrientation = () => {
    if (!this.isMobile) return;

    if (this.props.sendFlipStatus) {
      this.props.sendFlipStatus(!this.state.isTilted);
    }
    const flippedDeviceDims = {
      width: this.state.deviceDimensions.height,
      height: this.state.deviceDimensions.width,
    };
    this.setState({
      isTilted: !this.state.isTilted,
      deviceDimensions: flippedDeviceDims,
    });
  };

  _unPlug = () => {
    if (this.state.isUnplugged) {
      this.openBrowserSyncSocket(this.webviewRef.current);
    } else {
      this.closeBrowserSyncSocket(this.webviewRef.current);
    }
    this.setState({isUnplugged: !this.state.isUnplugged}, () => {
      this.webviewRef.current.send(
        'eventsMirroringState',
        !this.state.isUnplugged
      );
    });
  };

  _toggleDesignMode = () => {
    const {id: deviceId} = this.props.device;
    this.props.onToggleDeviceDesignMode(deviceId);
  };

  _focusDevice = () => {
    this.props.setPreviewLayout(INDIVIDUAL_LAYOUT);
    this.props.setFocusedDevice(this.props.device.id);
  };

  _unfocusDevice = () => {
    if (this.props.browser.previewer.previousLayout) {
      this.props.setPreviewLayout(this.props.browser.previewer.previousLayout);
    }
  };

  _muteWebView = () => {
    this.getWebContents().setAudioMuted(true);
  };

  _unmuteWebView = () => {
    this.getWebContents().setAudioMuted(false);
  };

  get isMobile() {
    return this.props.device.capabilities.indexOf(CAPABILITIES.mobile) > -1;
  }

  _setResizeDimensions = (event, direction, ref, delta) => {
    const {temporaryDims} = this.state;
    const {updateResponsiveDimensions} = this.props;
    if (!temporaryDims) return;
    const updatedDeviceDims = {
      width: temporaryDims.width + delta.width,
      height: temporaryDims.height + delta.height,
    };
    this.setState(
      {
        deviceDimensions: updatedDeviceDims,
      },
      () => {
        updateResponsiveDimensions(this.state.deviceDimensions);
      }
    );
  };

  _onDebuggerEvent = async (event, method, params) => {
    switch (method) {
      case 'Overlay.inspectNodeRequested':
        await this._onInspectNodeRequested(params);
        break;
      default:
        break;
    }
  };

  _onInspectNodeRequested = async ({backendNodeId}) => {
    if (!this.props.browser.isInspecting) {
      return;
    }
    const [
      {
        model: {
          content: [x, y],
        },
      },
    ] = await Promise.all([
      this.dbg.sendCommand('DOM.getBoxModel', {
        backendNodeId,
      }),
      this.dbg.sendCommand('Overlay.setInspectMode', {
        mode: 'none',
        highlightConfig: {},
      }),
    ]);
    this.processOpenDevToolsInspectorEvent({x, y});
  };

  _onMouseEnter = async () => {
    if (!this.props.browser.isInspecting) {
      return;
    }
    try {
      await this.dbg.sendCommand('DOM.enable');
      await this.dbg.sendCommand('Overlay.enable');
      await this.dbg.sendCommand('Overlay.setInspectMode', {
        mode: 'searchForNode',
        highlightConfig: {
          showInfo: true,
          showStyles: true,
          contentColor: {r: 111, g: 168, b: 220, a: 0.66},
          paddingColor: {r: 147, g: 196, b: 125, a: 0.66},
          borderColor: {r: 255, g: 229, b: 153, a: 0.66},
          marginColor: {r: 246, g: 178, b: 107, a: 0.66},
        },
      });
    } catch (err) {
      console.log('Error enabling overlay', err);
    }
  };

  _onMouseLeave = async () => {
    if (!this.props.browser.isInspecting) {
      return;
    }
    try {
      await this.dbg.sendCommand('Overlay.disable');
      await this.dbg.sendCommand('DOM.disable');
    } catch (err) {
      console.log('Error disabling overlay', err);
    }
  };

  _getWebViewTag = (deviceStyles, containerWidth, containerHeight) => {
    const {
      classes,
      device: {id, useragent, capabilities},
    } = this.props;
    const {deviceDimensions, address, isTilted} = this.state;
    const outlinePx = this.props.browser.userPreferences.deviceOutlineStyle
      ? 3
      : 0;

    if (capabilities.includes(CAPABILITIES.responsive)) {
      return (
        <Resizable
          className={styles.resizableView}
          size={{
            width: containerWidth + outlinePx,
            height: containerHeight + outlinePx,
          }}
          onResizeStart={() => {
            const updatedTempDims = {
              width: deviceDimensions.width,
              height: deviceDimensions.height,
            };
            this.setState({
              temporaryDims: updatedTempDims,
            });
          }}
          onResize={debounce(this._setResizeDimensions, 25, {maxWait: 50})}
          onResizeStop={() => {
            this.setState({
              temporaryDims: null,
            });
          }}
          handleComponent={{
            right: (
              <div
                className={cx(classes.iconWrapper, styles.iconWrapperE)}
                {...this.props}
              >
                <div className={classes.iconHolder} />
              </div>
            ),
            bottom: (
              <div
                className={cx(classes.iconWrapper, styles.iconWrapperS)}
                {...this.props}
              >
                <div className={classes.iconHolder} />
              </div>
            ),
            bottomRight: (
              <div
                className={cx(classes.iconWrapper, styles.iconWrapperSE)}
                {...this.props}
              >
                <div className={classes.iconHolder} />
              </div>
            ),
          }}
        >
          <webview
            ref={this.webviewRef}
            preload="./preload.js"
            className={cx(styles.device)}
            src={address}
            useragent={useragent}
            style={deviceStyles}
          />
        </Resizable>
      );
    }

    return (
      <>
        <webview
          ref={this.webviewRef}
          preload="./preload.js"
          className={cx(styles.device)}
          src={address}
          useragent={useragent}
          style={deviceStyles}
          webpreferences={
            this.props.browser.userPreferences.disableSpellCheck
              ? 'spellcheck=no'
              : 'spellcheck=yes'
          }
        />
      </>
    );
  };

  render() {
    const {
      browser: {zoomLevel, previewer},
      device: {capabilities},
      classes,
      theme,
    } = this.props;
    const {
      deviceDimensions,
      errorCode,
      errorDesc,
      screenshotInProgress,
      proxyAuthError,
    } = this.state;
    const screenshotZoomLevel = screenshotInProgress && this.state.zoomLevel;
    const outline = `4px solid ${
      this._isDevToolsOpen()
        ? `#6075ef`
        : this.props.browser.userPreferences.deviceOutlineStyle ||
          'rgba(0, 0, 0, 0)'
    }`;
    const deviceStyles = {
      outline,
      width:
        (this.state.screenshotInProgress && this.state.fullDocumentWidth) ||
        deviceDimensions.width,
      height:
        (this.state.screenshotInProgress && this.state.fullDocumentHeight) ||
        deviceDimensions.height,
      transform: `scale(${screenshotZoomLevel || zoomLevel})`,
    };
    const overlayStyles = {
      outline,
      width: deviceDimensions.width,
      height: deviceDimensions.height,
      transform: `scale(${zoomLevel})`,
    };

    const containerWidth = deviceStyles.width * zoomLevel;
    const containerHeight = deviceStyles.height * zoomLevel;

    const isMuted = this.props.device.isMuted;
    const isResponsive = capabilities.includes(CAPABILITIES.responsive);
    const shouldMaximize = previewer.layout !== INDIVIDUAL_LAYOUT;
    const IconFocus = () => {
      if (shouldMaximize) return <Focus height={30} padding={6} />;
      return <Unfocus height={30} padding={6} />;
    };
    return (
      <div
        className={cx(styles.webViewContainer, {
          [styles.withMarginRight]: isResponsive,
        })}
      >
        <div className={cx(styles.webViewToolbar)}>
          <div className={cx(styles.webViewToolbarLeft)}>
            <Tooltip title="Open DevTools">
              <div
                className={cx(styles.webViewToolbarIcons, classes.icon, {
                  [classes.iconSelected]: this._isDevToolsOpen(),
                })}
                onClick={this._toggleDevTools}
              >
                <BugIcon width={20} />
              </div>
            </Tooltip>
            <Tooltip title="Quick Screenshot">
              <div
                className={cx(styles.webViewToolbarIcons, classes.icon)}
                onClick={() => this.processScreenshotEvent({fullScreen: false})}
              >
                <ScreenshotIcon height={18} />
              </div>
            </Tooltip>
            <Tooltip title="Disable event mirroring">
              <div
                className={cx(styles.webViewToolbarIcons, classes.icon, {
                  [classes.iconSelected]: this.state.isUnplugged,
                })}
                onClick={this._unPlug}
              >
                <UnplugIcon height={30} />
              </div>
            </Tooltip>
            <Tooltip
              title={`${
                this.props.device.designMode ? 'Disable' : 'Enable'
              } Design Mode`}
            >
              <div
                className={cx(styles.webViewToolbarIcons, classes.icon, {
                  [classes.iconSelected]: this.props.device.designMode,
                })}
                onClick={this._toggleDesignMode}
              >
                <DesignModeIcon height={20} />
              </div>
            </Tooltip>
          </div>
          <div className={cx(styles.webViewToolbarRight)}>
            <Tooltip
              title={shouldMaximize ? 'Maximize' : 'Minimize'}
              disableFocusListener
            >
              <div
                className={cx(styles.webViewToolbarIcons, classes.icon)}
                onClick={
                  shouldMaximize ? this._focusDevice : this._unfocusDevice
                }
              >
                <IconFocus />
              </div>
            </Tooltip>
          </div>
        </div>
        <div
          className={classes.deviceContainer}
          style={{
            width: containerWidth,
            height: containerHeight,
          }}
          onMouseEnter={this._onMouseEnter}
          onMouseLeave={this._onMouseLeave}
        >
          <div
            className={cx(styles.deviceOverlay, {
              [styles.overlayEnabled]: screenshotInProgress,
            })}
            style={overlayStyles}
          >
            <Spinner size={24} />
          </div>
          <div
            className={cx(styles.deviceOverlay, {
              [styles.overlayEnabled]: errorCode,
            })}
            style={deviceStyles}
          >
            <p>ERROR: {errorCode}</p>
            <p className={cx(styles.errorDesc)}>{errorDesc}</p>

            {proxyAuthError && (
              <p className={cx(styles.errorDesc)}>Proxy Authentication Error</p>
            )}

            {isSslValidationFailed(errorCode) && (
              <p className={cx(classes.errorHelpSuggestion)}>
                If you wish to proceed, you can disable the SSL validation in
                the user preferences.
              </p>
            )}
          </div>
          {this._getWebViewTag(deviceStyles, containerWidth, containerHeight)}
        </div>
      </div>
    );
  }
}

const webViewStyles = theme => ({
  ...commonStyles(theme),
  deviceContainer: {
    position: 'relative',
    display: 'inline-flex',
    transformOrigin: 'top left',
  },
  iconWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    backgroundPosition: 'center',
    padding: 0,
    backgroundColor: theme.palette.background.l2,
    '&:hover': {
      backgroundColor: theme.palette.background.l5,
    },
  },
  iconHolder: {
    position: 'relative',
    display: 'block',
    height: '7px',
    cursor: 'pointer',
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      width: '15px',
      height: '2px',
      backgroundColor: theme.palette.text.dim,
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      width: '15px',
      height: '2px',
      backgroundColor: theme.palette.text.dim,
      bottom: 0,
    },
  },
  errorHelpSuggestion: {
    position: 'absolute',
    top: '25%',
    width: '100%',
    padding: 35,
    background: theme.palette.primary.main,
  },
});
export default withStyles(webViewStyles)(withTheme(WebView));
