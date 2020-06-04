import React, {useState} from 'react';
import {Resizable} from 're-resizable';

import styles from './style.module.css';

const DevToolsResizer = ({size, open, onDevToolsResize, onDevToolsClose}) => {
  if (!open) {
    return null;
  }
  console.log('size', size);
  return (
    <div style={{position: 'absolute', bottom: 0}}>
      <Resizable
        size={{width: size.width + 10, height: size.height + 10}}
        onResizeStop={(e, direction, ref, d) => {
          onDevToolsResize({
            width: size.width + d.width,
            height: size.height + d.height - 10,
          });
        }}
      >
        <div
          className={styles.toolbarContainer}
          style={{width: '100%', height: 10}}
        >
          <div className={styles.rightSideTools}>
            <span onClick={() => console.log('Close') || onDevToolsClose()}>
              x
            </span>
          </div>
        </div>
      </Resizable>
    </div>
  );
};

export default DevToolsResizer;
