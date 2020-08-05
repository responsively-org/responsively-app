import React, {useEffect, useState} from 'react';
import cx from 'classnames';
import {shell} from 'electron';

import styles from './styles.module.css';

const Announcement = () => {
  const [data, setData] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const response = await (
          await fetch('https://responsively.app/assets/appMessages.json')
        ).json();
        setData(response.statusBarMessage);
      } catch (err) {
        console.log('Error fetching appMessages.json', err);
      }
    })();
  }, []);

  if (!data) {
    return null;
  }

  return (
    <div className={styles.section}>
      <div
        className={cx(styles.text, styles.link)}
        onClick={() => shell.openExternal(data.link)}
      >
        <span className={cx('featureSuggestionLink', styles.linkText)}>
          {data.text}
        </span>
      </div>
    </div>
  );
};

export default Announcement;
