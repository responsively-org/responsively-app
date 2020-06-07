import React, {useState} from 'react';
import {Resizable} from 're-resizable';
import {Tooltip} from '@material-ui/core';

import styles from './style.module.css';
import Cross from '../icons/Cross';
import DockRight from '../icons/DockRight';
import DockBottom from '../icons/DockBottom';
import InspectElementChrome from '../icons/InspectElementChrome';
import {DEVTOOLS_MODES} from '../../reducers/browser';

const getResizingDirections = mode => {
  if (mode === DEVTOOLS_MODES.RIGHT) {
    return {left: true};
  }
  return {top: true};
};

const getResizerPosition = mode => {
  if (mode === DEVTOOLS_MODES.RIGHT) {
    return {right: 0};
  }
  return {bottom: 0};
};

const getToolbarPosition = (mode, bounds) => {
  if (mode === DEVTOOLS_MODES.RIGHT) {
    return {position: 'absolute', top: -(bounds.height + 20)};
  }
  return {};
};

const DevToolsResizer = ({
  size,
  open,
  mode,
  bounds,
  onDevToolsResize,
  onDevToolsClose,
  onDevToolsModeChange,
}) => {
  if (!open) {
    return null;
  }
  return (
    <div style={{position: 'absolute', ...getResizerPosition(mode)}}>
      <Resizable
        size={{width: size.width, height: size.height}}
        onResizeStop={(e, direction, ref, d) => {
          onDevToolsResize({
            width: size.width + d.width,
            height: size.height + d.height,
          });
        }}
        enable={getResizingDirections(mode)}
      >
        <div
          className={styles.toolbarContainer}
          style={{width: '100%', ...getToolbarPosition(mode, bounds)}}
        >
          <div className={styles.toolsGroup}>
            <InspectElementChrome style={{height: 16}} />
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
              onClick={() => console.log('Close') || onDevToolsClose()}
            >
              <Cross width={18} color="inherit" />
            </span>
          </div>
        </div>
      </Resizable>
    </div>
  );
};

export default DevToolsResizer;
