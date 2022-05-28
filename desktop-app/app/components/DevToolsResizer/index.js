import React, {useState, useEffect, useMemo} from 'react';
import cx from 'classnames';
import {ipcRenderer} from 'electron';
import {Resizable} from 're-resizable';
import {Tooltip} from '@material-ui/core';
import pubsub from 'pubsub.js';
import debounce from 'lodash/debounce';
import styles from './style.module.css';
import Cross from '../icons/Cross';
import DockRight from '../icons/DockRight';
import DockBottom from '../icons/DockBottom';
import InspectElementChrome from '../icons/InspectElementChrome';
import {DEVTOOLS_MODES} from '../../constants/previewerLayouts';
import CrossChrome from '../icons/CrossChrome';
import {OPEN_CONSOLE_FOR_DEVICE} from '../../constants/pubsubEvents';
import {DARK_THEME, LIGHT_THEME} from '../../constants/theme';

const getResizingDirections = mode => {
  if (mode === DEVTOOLS_MODES.RIGHT) {
    return {left: true};
  }
  return {top: true};
};

const getResizerPosition = (mode, bounds) => {
  if (mode === DEVTOOLS_MODES.RIGHT) {
    return {right: 0, top: bounds.y - 30};
  }
  return {bottom: 0};
};

const getToolbarPosition = (mode, bounds) => {
  if (mode === DEVTOOLS_MODES.RIGHT) {
    return {position: 'absolute', top: 0};
  }
  return {};
};

const DevToolsResizer = ({
  activeDevTools,
  devices,
  size,
  open,
  mode,
  bounds,
  isInspecting,
  onDevToolsResize,
  onDevToolsClose,
  onDevToolsModeChange,
  onWindowResize,
  toggleInspector,
  isDarkTheme,
}) => {
  useEffect(() => {
    const handler = debounce(
      (event, args) => {
        const {height, width} = args;
        onWindowResize({height, width});
      },
      100,
      {maxWait: 200}
    );
    ipcRenderer.on('window-resize', handler);
    return () => {
      ipcRenderer.removeListener('window-resize', handler);
    };
  }, []);

  const initialTheme = useMemo(() => (isDarkTheme ? DARK_THEME : LIGHT_THEME), [
    activeDevTools[0]?.deviceId,
  ]);

  const [sizeBeforeDrag, setSizeBeforeDrag] = useState(null);

  if (!open || mode === DEVTOOLS_MODES.UNDOCKED) {
    return null;
  }

  const switchDevTools = e => {
    pubsub.publish(OPEN_CONSOLE_FOR_DEVICE, [{deviceId: e.target.value}]);
  };

  return (
    <div style={{position: 'absolute', ...getResizerPosition(mode, bounds)}}>
      <Resizable
        className={styles.resizable}
        size={{width: size.width, height: size.height}}
        onResizeStart={() => setSizeBeforeDrag(size)}
        onResizeStop={() => setSizeBeforeDrag(null)}
        onResize={debounce(
          (e, direction, ref, d) => {
            onDevToolsResize({
              width: sizeBeforeDrag.width + d.width,
              height: sizeBeforeDrag.height + d.height,
            });
          },
          25,
          {maxWait: 50}
        )}
        enable={getResizingDirections(mode)}
      >
        <div
          className={cx(
            styles.toolbarContainer,
            initialTheme === DARK_THEME ? styles.darkMode : styles.lightMode
          )}
          style={{width: '100%', ...getToolbarPosition(mode, bounds)}}
        >
          <div className={styles.toolsGroup}>
            <span className={styles.icon} onClick={toggleInspector}>
              <InspectElementChrome
                style={{height: 16}}
                selected={isInspecting}
              />
            </span>
            <div className={styles.inputSection}>
              <span className={styles.labelText}>Device:</span>
              <select
                id="devices"
                onChange={switchDevTools}
                className={styles.chromeSelect}
                value={activeDevTools[0].deviceId}
              >
                {devices.map(device => (
                  <option value={device.id} key={device.id}>
                    {device.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className={styles.toolsGroup}>
            {mode !== DEVTOOLS_MODES.RIGHT ? (
              <Tooltip title="Dock to right" placement="top">
                <span
                  className={styles.icon}
                  onClick={() => onDevToolsModeChange(DEVTOOLS_MODES.RIGHT)}
                >
                  <DockRight height={10} />
                </span>
              </Tooltip>
            ) : null}
            {mode !== DEVTOOLS_MODES.BOTTOM ? (
              <Tooltip title="Dock to bottom" placement="top">
                <span
                  className={styles.icon}
                  onClick={() => onDevToolsModeChange(DEVTOOLS_MODES.BOTTOM)}
                >
                  <DockBottom height={10} />
                </span>
              </Tooltip>
            ) : null}
            <span
              className={styles.icon}
              onClick={() => onDevToolsClose(null, true)}
            >
              <CrossChrome width={18} color="inherit" />
            </span>
          </div>
        </div>
      </Resizable>
    </div>
  );
};

export default DevToolsResizer;
