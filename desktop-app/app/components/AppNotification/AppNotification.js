import React, {useEffect, useState} from 'react';
import cx from 'classnames';
import {motion} from 'framer-motion';
import {shell} from 'electron';
import Button from '@material-ui/core/Button';
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

const AppNotification = props => {
  const data = props.data;
  const [notificationInteracted, setNotificationInteracted] = useState(false);
  console.log(props);
  if (
    !data ||
    !Object.keys(data).length ||
    (!notificationInteracted && checkIfInteracted(data.id))
  ) {
    return null;
  }

  return (
    <motion.div
      className={styles.container}
      initial={{x: notificationInteracted ? 0 : 300, scale: 1}}
      animate={{x: notificationInteracted ? 300 : 0, scale: 1}}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
      }}
    >
      <div
        className={styles.content}
        onClick={() => {
          shell.openExternal(data.link);
          updateNotificationStatus(data.id, 'ANSWERED');
          setNotificationInteracted(true);
        }}
      >
        {data.text}
      </div>
      <div className={styles.responseButtonsContainer}>
        <div className={styles.responseButtons}>
          <Button
            variant="contained"
            color="primary"
            aria-label="dismiss notfication"
            component="span"
            onClick={() => {
              shell.openExternal(data.link);
              updateNotificationStatus(data.id, 'ANSWER');
              setNotificationInteracted(true);
            }}
          >
            Yes
          </Button>
        </div>
        <div className={styles.dismiss}>
          <Button
            variant="contained"
            color="primary"
            aria-label="dismiss notfication"
            component="span"
            onClick={() => {
              updateNotificationStatus(data.id, 'DISMISS');
              setNotificationInteracted(true);
            }}
          >
            Dismiss
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default AppNotification;
