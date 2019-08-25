import React from 'react';
import PreviewerLayoutSelector from '../PreviewerLayoutSelector';

import styles from './styles.css';

export default function DeviceManager(props) {
  console.log('DeviceManager props', props);
  return (
    <div className={styles.container}>
      <div className={styles.label}>Select Layout:</div>
      <PreviewerLayoutSelector
        value={props.browser.previewer.layout}
        onChange={val => props.setPreviewLayout(val.value)}
      />
    </div>
  );
}
