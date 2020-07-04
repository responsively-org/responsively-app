import React, {useState, useEffect} from 'react';
import {ipcRenderer} from 'electron';
import {Resizable} from 're-resizable';
import {Tooltip} from '@material-ui/core';
import debounce from 'lodash/debounce';
import styles from './style.module.css';
import Cross from '../icons/Cross';
import DockRight from '../icons/DockRight';
import DockBottom from '../icons/DockBottom';
import InspectElementChrome from '../icons/InspectElementChrome';
import {DEVTOOLS_MODES} from '../../constants/previewerLayouts';
import CrossChrome from '../icons/CrossChrome';

const getResizingDirections = mode => {
  if (mode === DEVTOOLS_MODES.RIGHT) {
    return {left: true};
  }
  return {top: true};
};

const getResizerPosition = (mode, bounds) => {
  if (mode === DEVTOOLS_MODES.RIGHT) {
    return {right: 0, top: 0};
  }
  return {bottom: 0};
};

const getToolbarPosition = (mode, bounds) => {
  if (mode === DEVTOOLS_MODES.RIGHT) {
    return {position: 'absolute', top: bounds.y - 20};
  }
  return {};
};

const DevToolsResizer = ({
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

  const [sizeBeforeDrag, setSizeBeforeDrag] = useState(null);

  if (!open || mode === DEVTOOLS_MODES.UNDOCKED) {
    return null;
  }

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
          className={styles.toolbarContainer}
          style={{width: '100%', ...getToolbarPosition(mode, bounds)}}
        >
          <div className={styles.toolsGroup}>
            <span className={styles.icon} onClick={toggleInspector}>
              <InspectElementChrome
                style={{height: 16}}
                selected={isInspecting}
              />
            </span>
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
