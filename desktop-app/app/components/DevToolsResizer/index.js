import React, {useState} from 'react';
import {Resizable} from 're-resizable';
import {Tooltip} from '@material-ui/core';

import styles from './style.module.css';
import Cross from '../icons/Cross';
import DockRight from '../icons/DockRight';
import InspectElementChrome from '../icons/InspectElementChrome';

const DevToolsResizer = ({size, open, onDevToolsResize, onDevToolsClose}) => {
  if (!open) {
    return null;
  }
  console.log('size', size);
  return (
    <div style={{position: 'absolute', bottom: 0}}>
      <Resizable
        size={{width: size.width, height: size.height}}
        onResizeStop={(e, direction, ref, d) => {
          onDevToolsResize({
            width: size.width + d.width,
            height: size.height + d.height,
          });
        }}
      >
        <div className={styles.toolbarContainer} style={{width: '100%'}}>
          <div className={styles.toolsGroup}></div>
          <div className={styles.toolsGroup}>
            <Tooltip title="Dock to right" placement="top">
              <span>
                <DockRight height={10} />
              </span>
            </Tooltip>
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
