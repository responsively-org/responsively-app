import React, {useEffect, useState} from 'react';
import cx from 'classnames';
import {motion} from 'framer-motion';
import {shell} from 'electron';
import settings from 'electron-settings';
import {APP_NOTIFICATION} from '../../constants/settingKeys';
import styles from './styles.module.css';

function updateNotificationStatus(id, action) {
  const notifications = settings.get(APP_NOTIFICATION) || [];

  const notificationStatusObject = {
    id,
    action,
  };
  notifications.push(notificationStatusObject);
  settings.set(APP_NOTIFICATION, notifications);
}

function checkIfInteracted(id) {
  const notifications = settings.get(APP_NOTIFICATION);

  let seenNotification;
  if (notifications) {
    seenNotification = notifications.find(
      notification => notification.id === id
    );
  }
  if (seenNotification) {
    return true;
  }
  return false;
}

const AppNotification = () => {
  const [notificationInteracted, setNotificationInteracted] = useState(false);
  const [data, setData] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const response = await (
          await fetch('https://responsively.app/assets/appMessages.json')
        ).json();
        setData(response.notification);
      } catch (err) {
        console.log('Error fetching appMessages.json', err);
      }
    })();
  }, []);

  if (!data || (!notificationInteracted && checkIfInteracted(data.id))) {
    return null;
  }

  const {id, text, okText, dismissText, link} = data;

  const notificationClicked = () => {
    shell.openExternal(link);
    updateNotificationStatus(id, 'ANSWERED');
    setNotificationInteracted(true);
  };

  return (
    <motion.div
      className={styles.container}
      initial={{x: notificationInteracted ? 0 : 500, scale: 1}}
      animate={{x: notificationInteracted ? 500 : 0, scale: 1}}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay: notificationInteracted ? 0 : 3,
      }}
    >
      <div className={styles.content} onClick={notificationClicked}>
        {text}
      </div>
      <div className={styles.responseButtonsContainer}>
        <div
          className={cx('notificationDismiss', styles.responseButtons)}
          onClick={() => {
            updateNotificationStatus(id, 'DISMISS');
            setNotificationInteracted(true);
          }}
        >
          {dismissText}
        </div>
        <div
          className={cx(
            'notificationOK',
            styles.responseButtons,
            styles.okButton
          )}
          onClick={notificationClicked}
        >
          {okText}
        </div>
      </div>
    </motion.div>
  );
};

export default AppNotification;
