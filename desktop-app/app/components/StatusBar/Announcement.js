import React, {useEffect, useState} from 'react';
import cx from 'classnames';

import styles from './styles.module.css';

const Announcement = () => {
  const [data, setData] = useState(null);
  useEffect(() => {
    (async () => {
      const response = await (
        await fetch('https://responsively.app/assets/appMessages.json')
      ).json();
      setData(response.statusBarMessage);
    })();
  }, []);

  if (!data) {
    return null;
  }

  return (
    <div className={styles.section}>
      <div
        className={styles.link}
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
