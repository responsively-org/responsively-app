import React, {useEffect, useState} from 'react';
import cx from 'classnames';
import styles from './styles.module.css';
import {shell} from 'electron';
import AppNotification from '../AppNotification/AppNotification';

const Announcement = () => {
  const [appMessagesData, setAppMessagesData] = useState(null);

  useEffect(() => {
    (async () => {
      const response = await (
        await fetch('https://responsively.app/assets/appMessages.json')
      ).json();
      setAppMessagesData(response);
    })();
  }, []);

  if (!appMessagesData) {
    return null;
  }

  const data = appMessagesData.statusBarMessage;
  const notificationData = appMessagesData.notification;

  return (
    <div>
      {data && (
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
      )}
      <AppNotification data={notificationData} />
    </div>
  );
};

export default Announcement;
