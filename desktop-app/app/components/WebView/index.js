// @flow
import React, {Component, createRef} from 'react';
import {remote, ipcRenderer} from 'electron';
import cx from 'classnames';
import {Resizable} from 're-resizable';
import {Tooltip} from '@material-ui/core';
import debounce from 'lodash.debounce';
import pubsub from 'pubsub.js';
import console from 'electron-timber';
import BugIcon from '../icons/Bug';
import MutedIcon from '../icons/Muted';
import UnmutedIcon from '../icons/Unmuted';
import ScreenshotIcon from '../icons/Screenshot';
import DeviceRotateIcon from '../icons/DeviceRotate';
import {iconsColor} from '../../constants/colors';
import {
  SCROLL_DOWN,
  SCROLL_UP,
  NAVIGATION_BACK,
  NAVIGATION_FORWARD,
  NAVIGATION_RELOAD,
  SCREENSHOT_ALL_DEVICES,
  FLIP_ORIENTATION_ALL_DEVICES,
  ENABLE_INSPECTOR_ALL_DEVICES,
  DISABLE_INSPECTOR_ALL_DEVICES,
  TOGGLE_DEVICE_MUTED_STATE,
  RELOAD_CSS,
  DELETE_STORAGE,
  ADDRESS_CHANGE,
  STOP_LOADING,
} from '../../constants/pubsubEvents';
import {CAPABILITIES} from '../../constants/devices';

import styles from './style.module.css';
import commonStyles from '../common.styles.css';
import UnplugIcon from '../icons/Unplug';
import {captureFullPage} from './screenshotUtil';
import {
  DEVTOOLS_MODES,
  INDIVIDUAL_LAYOUT,
} from '../../constants/previewerLayouts';
import Maximize from '../icons/Maximize';
import Minimize from '../icons/Minimize';
import Focus from '../icons/Focus';
import Unfocus from '../icons/Unfocus';
import {BROWSER_SYNC_EMBED_SCRIPT} from '../../constants/browserSync';

const {BrowserWindow} = remote;

const MESSAGE_TYPES = {
  scroll: 'scroll',
  click: 'click',
  openDevToolsInspector: 'openDevToolsInspector',
  disableInspector: 'disableInspector',
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
    };
    this.subscriptions = [];
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
        ENABLE_INSPECTOR_ALL_DEVICES,
        this.processEnableInspectorEvent
      )
    );
    this.subscriptions.push(
      pubsub.subscribe(
        DISABLE_INSPECTOR_ALL_DEVICES,
        this.processDisableInspectorEvent
      )
    );

    this.webviewRef.current.addEventListener('dom-ready', () => {
      this.initEventTriggers(this.webviewRef.current);
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
        ipcRenderer.send('open-new-window', {url: e.url});
      });
    }

    this.webviewRef.current.addEventListener('did-start-loading', () => {
      this.setState({errorCode: null, errorDesc: null});
      this.props.onLoadingStateChange(true);
      this.props.deviceLoadingChange({id: this.props.device.id, loading: true});
    });
    this.webviewRef.current.addEventListener('did-stop-loading', () => {
      this.props.onLoadingStateChange(false);
      this.props.deviceLoadingChange({
        id: this.props.device.id,
        loading: false,
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

    this.webviewRef.current.addEventListener('devtools-closed', () => {
      if (
        this.props.browser.devToolsConfig.mode === DEVTOOLS_MODES.UNDOCKED &&
        this._isDevToolsOpen()
      ) {
        this._toggleDevTools();
      }
    });
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
    this.webviewRef.current.executeJavaScript(`
        var elements = document.querySelectorAll('link[rel=stylesheet][href]');
        elements.forEach(element=>{
          var href = element.href;
          if(href){
            var href = href.replace(/[?&]invalidateCacheParam=([^&$]*)/,'');
            element.href = href + (href.indexOf('?')>=0?'&':'?') + 'invalidateCacheParam=' + (new Date().valueOf());
          }
        })
    `);
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

  processScreenshotEvent = async ({now}) => {
    this.setState({screenshotInProgress: true});
    await captureFullPage(
      this.props.browser.address,
      this.props.device,
      this.webviewRef.current,
      now != null,
      now
    );
    this.setState({screenshotInProgress: false});
  };

  processFlipOrientationEvent = () => {
    if (!this.isMobile) {
      return;
    }
    this._flipOrientation();
  };

  processToggleMuteEvent = ({muted}) => {
    this.getWebContents().setAudioMuted(muted);
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

  processEnableInspectorEvent = () => {
    this.webviewRef.current.send('enableInspectorMessage');
  };

  processDisableInspectorEvent = message => {
    this.webviewRef.current.send('disableInspectorMessage');
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
      case MESSAGE_TYPES.disableInspector:
        this.transmitDisableInspectorToAllDevices(message);
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

  transmitDisableInspectorToAllDevices = message => {
    pubsub.publish(DISABLE_INSPECTOR_ALL_DEVICES, [message]);
  };

  initEventTriggers = webview => {
    this.getWebContentForId(webview.getWebContentsId()).executeJavaScript(`

      var bsScript= document.createElement('script');
      bsScript.src = '${BROWSER_SYNC_EMBED_SCRIPT}';
      bsScript.async = true;
      document.body.appendChild(bsScript);
    
      responsivelyApp.deviceId = '${this.props.device.id}';
      document.addEventListener('mouseleave', () => {
        window.responsivelyApp.mouseOn = false;
        if (responsivelyApp.domInspectorEnabled) {
          responsivelyApp.domInspector.disable();
        }
      });
      document.addEventListener('mouseenter', () => {
        responsivelyApp.mouseOn = true;
        if (responsivelyApp.domInspectorEnabled) {
          responsivelyApp.domInspector.enable();
        }
      });

      document.addEventListener(
        'click',
        (e) => {
          if (e.target === window.responsivelyApp.lastClickElement || e.responsivelyAppProcessed) {
            window.responsivelyApp.lastClickElement = null;
            e.responsivelyAppProcessed = true;
            return;
          }
          if (window.responsivelyApp.domInspectorEnabled) {
            e.preventDefault();
            window.responsivelyApp.domInspector.disable();
            window.responsivelyApp.domInspectorEnabled = false;
            const targetRect = e.target.getBoundingClientRect();
            window.responsivelyApp.sendMessageToHost(
              '${MESSAGE_TYPES.disableInspector}'
            );
            window.responsivelyApp.sendMessageToHost(
              '${MESSAGE_TYPES.openDevToolsInspector}',
              {x: targetRect.left, y: targetRect.top}
            );
            return;
          }
          e.responsivelyAppProcessed = true;
        },
        true
      );
    `);
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
    this.setState({isUnplugged: !this.state.isUnplugged}, () => {
      this.webviewRef.current.send(
        'eventsMirroringState',
        !this.state.isUnplugged
      );
    });
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

  _muteDevice = () => {
    this.getWebContents().setAudioMuted(true);
    this.props.onDeviceMutedChange(this.props.device.id, true);
  };

  _unmuteDevice = () => {
    this.getWebContents().setAudioMuted(false);
    this.props.onDeviceMutedChange(this.props.device.id, false);
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

  _getWebViewTag = deviceStyles => {
    const {
      device: {id, useragent, capabilities},
    } = this.props;
    const {deviceDimensions, address, isTilted} = this.state;

    if (capabilities.includes(CAPABILITIES.responsive)) {
      const responsiveStyle = {
        width: deviceDimensions.width,
        height: deviceDimensions.height,
      };
      return (
        <Resizable
          className={cx(styles.resizableView)}
          size={{width: responsiveStyle.width, height: responsiveStyle.height}}
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
                className={cx(styles.iconWrapper, styles.iconWrapperE)}
                {...this.props}
              >
                <div className={styles.iconHolder} />
              </div>
            ),
            bottom: (
              <div
                className={cx(styles.iconWrapper, styles.iconWrapperS)}
                {...this.props}
              >
                <div className={styles.iconHolder} />
              </div>
            ),
            bottomRight: (
              <div
                className={cx(styles.iconWrapper, styles.iconWrapperSE)}
                {...this.props}
              >
                <div className={styles.iconHolder} />
              </div>
            ),
          }}
        >
          <webview
            ref={this.webviewRef}
            preload="./preload.js"
            className={cx(styles.device)}
            src={address || 'about:blank'}
            useragent={useragent}
            style={responsiveStyle}
          />
        </Resizable>
      );
    }

    return (
      <webview
        ref={this.webviewRef}
        preload="./preload.js"
        className={cx(styles.device)}
        src={address || 'about:blank'}
        useragent={useragent}
        style={deviceStyles}
      />
    );
  };

  render() {
    const {
      browser: {zoomLevel, previewer},
      device: {capabilities},
    } = this.props;
    const {
      deviceDimensions,
      errorCode,
      errorDesc,
      screenshotInProgress,
    } = this.state;
    const deviceStyles = {
      outline: `4px solid ${this.props.browser.userPreferences.deviceOutlineStyle}`,
      width: deviceDimensions.width,
      height: deviceDimensions.height,
    };
    const isMuted = this.props.device.isMuted;
    const isResponsive = capabilities.includes(CAPABILITIES.responsive);
    const shouldMaximize = previewer.layout !== INDIVIDUAL_LAYOUT;
    const IconFocus = () => {
      if (shouldMaximize)
        return <Focus height={30} padding={6} color={iconsColor} />;
      return <Unfocus height={30} padding={6} color={iconsColor} />;
    };
    return (
      <div
        className={cx(styles.webViewContainer, {
          [styles.withMarginRight]: isResponsive,
        })}
        style={{
          width: deviceStyles.width * zoomLevel,
          height: deviceStyles.height * zoomLevel + 40,
        }}
      >
        <div className={cx(styles.webViewToolbar)}>
          <div className={cx(styles.webViewToolbarLeft)}>
            <Tooltip title="Open DevTools">
              <div
                className={cx(
                  styles.webViewToolbarIcons,
                  commonStyles.icons,
                  commonStyles.enabled,
                  {
                    [commonStyles.selected]: this._isDevToolsOpen(),
                  }
                )}
                onClick={this._toggleDevTools}
              >
                <BugIcon width={20} color={iconsColor} />
              </div>
            </Tooltip>
            <Tooltip title="Take Screenshot">
              <div
                className={cx(
                  styles.webViewToolbarIcons,
                  commonStyles.icons,
                  commonStyles.enabled
                )}
                onClick={() => this.processScreenshotEvent({})}
              >
                <ScreenshotIcon height={18} color={iconsColor} />
              </div>
            </Tooltip>
            <Tooltip title="Tilt Device">
              <div
                className={cx(styles.webViewToolbarIcons, commonStyles.icons, {
                  [commonStyles.enabled]: this.isMobile,
                  [commonStyles.disabled]: !this.isMobile,
                  [commonStyles.selected]: this.state.isTilted,
                })}
                onClick={this._flipOrientation}
              >
                <DeviceRotateIcon height={17} color={iconsColor} />
              </div>
            </Tooltip>
            <Tooltip title="Disable event mirroring">
              <div
                className={cx(
                  styles.webViewToolbarIcons,
                  commonStyles.icons,
                  commonStyles.enabled,
                  {
                    [commonStyles.selected]: this.state.isUnplugged,
                  }
                )}
                onClick={this._unPlug}
              >
                <UnplugIcon height={30} color={iconsColor} />
              </div>
            </Tooltip>
            <Tooltip
              title={isMuted ? 'Unmute' : 'Mute'}
              disableFocusListener={true}
            >
              <div
                className={cx(
                  styles.webViewToolbarIcons,
                  commonStyles.icons,
                  commonStyles.enabled
                )}
                onClick={isMuted ? this._unmuteDevice : this._muteDevice}
              >
                {isMuted ? (
                  <MutedIcon height={20} color="white" />
                ) : (
                  <UnmutedIcon height={20} color="white" />
                )}
              </div>
            </Tooltip>
          </div>
          <div className={cx(styles.webViewToolbarRight)}>
            <Tooltip
              title={shouldMaximize ? 'Maximize' : 'Minimize'}
              disableFocusListener
            >
              <div
                className={cx(
                  styles.webViewToolbarIcons,
                  commonStyles.icons,
                  commonStyles.enabled
                )}
                onClick={
                  shouldMaximize ? this._focusDevice : this._unfocusDevice
                }
              >
                <IconFocus />
              </div>
            </Tooltip>
            {/* {expandOrCollapse} */}
          </div>
        </div>
        <div
          className={cx(styles.deviceContainer, {
            [styles.devToolsActive]: this._isDevToolsOpen(),
          })}
          style={{
            width: deviceStyles.width,
            transform: `scale(${zoomLevel})`,
          }}
        >
          <div
            className={cx(styles.deviceOverlay, {
              [styles.overlayEnabled]: screenshotInProgress,
            })}
            style={deviceStyles}
          />
          <div
            className={cx(styles.deviceOverlay, {
              [styles.overlayEnabled]: errorCode,
            })}
            style={deviceStyles}
          >
            <p>ERROR: {errorCode}</p>
            <p className={cx(styles.errorDesc)}>{errorDesc}</p>
          </div>
          {this._getWebViewTag(deviceStyles)}
        </div>
      </div>
    );
  }
}

export default WebView;
