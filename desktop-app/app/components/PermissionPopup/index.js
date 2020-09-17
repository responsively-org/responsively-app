import React, {useState, useEffect} from 'react';
import {ipcRenderer} from 'electron';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Tooltip from '@material-ui/core/Tooltip';
import {makeStyles} from '@material-ui/core/styles';
import styles from './styles.module.css';
import cx from 'classnames';
import pubsub from 'pubsub.js';
import {
  HIDE_PERMISSION_POPUP_DUE_TO_RELOAD,
  PERMISSION_MANAGEMENT_PREFERENCE_CHANGED,
} from '../../constants/pubsubEvents';
import {
  getPermissionPageTitle,
  getPermissionRequestMessage,
} from '../../utils/permissionUtils.js';
import {PERMISSION_MANAGEMENT_OPTIONS} from '../../constants/permissionsManagement';

const useStyles = makeStyles(theme => ({
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  themeBackground: {
    backgroundColor: theme.palette.mode({
      light: theme.palette.grey[100],
      dark: '#252526',
    }),
    color: theme.palette.mode({
      light: 'black',
      dark: 'white',
    }),
  },
}));

const tooltipUseStyles = makeStyles(theme => ({
  tooltip: {
    backgroundColor: theme.palette.mode({
      light: `${theme.palette.grey[200]} !important`,
      dark: `${theme.palette.grey.A700} !important`,
    }),
    color: theme.palette.mode({
      light: 'black !important',
      dark: 'white !important',
    }),
  },
}));

function getMessage(info) {
  if (info == null) return '';
  return (
    <>
      <strong>{getPermissionPageTitle(info.url)}</strong>&nbsp;
      {getPermissionRequestMessage(info.permission, info.details)}
    </>
  );
}

export default function PermissionPopup() {
  const classes = useStyles();
  const [permissionInfos, setPermissionInfos] = useState([]);

  useEffect(() => {
    const promptHandler = (event, args) => {
      setPermissionInfos(prev => [...prev, args]);
    };

    const reloadHandler = () => {
      setPermissionInfos([]);
    };

    const subscription = pubsub.subscribe(
      HIDE_PERMISSION_POPUP_DUE_TO_RELOAD,
      reloadHandler
    );
    ipcRenderer.on('permission-prompt', promptHandler);
    return () => {
      ipcRenderer.removeListener('permission-prompt', promptHandler);
      pubsub.unsubscribe(subscription);
    };
  }, []);

  useEffect(() => {
    const preferenceChangedHandler = newPreference => {
      if (newPreference === PERMISSION_MANAGEMENT_OPTIONS.ASK_ALWAYS) return;

      if (newPreference === PERMISSION_MANAGEMENT_OPTIONS.ALLOW_ALWAYS) {
        permissionInfos.forEach(info => {
          ipcRenderer.send('permission-response', {...info, allowed: true});
        });
        setPermissionInfos([]);
      } else if (newPreference === PERMISSION_MANAGEMENT_OPTIONS.DENY_ALWAYS) {
        permissionInfos.forEach(info => {
          ipcRenderer.send('permission-response', {...info, allowed: false});
        });
        setPermissionInfos([]);
      }
    };

    const subscription = pubsub.subscribe(
      PERMISSION_MANAGEMENT_PREFERENCE_CHANGED,
      preferenceChangedHandler
    );
    return () => {
      pubsub.unsubscribe(subscription);
    };
  }, [permissionInfos]);

  function handleClose(allowed) {
    ipcRenderer.send('permission-response', {...permissionInfos[0], allowed});
    setPermissionInfos(permissionInfos.slice(1));
  }

  return (
    <div
      className={cx(styles.permissionPopup, classes.themeBackground, {
        [styles.permissionPopupActive]: permissionInfos.length !== 0,
      })}
    >
      <h4 className={styles.permissionPopupTitle}>
        Permission Request
        <Tooltip classes={tooltipUseStyles()} title="Ignore" placement="left">
          <IconButton
            aria-label="close"
            className={classes.closeButton}
            onClick={() => handleClose(null)}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </h4>
      <DialogContent className={styles.permissionPopupMsgContainer}>
        <DialogContentText className={styles.permissionPopupMsg}>
          {getMessage(permissionInfos[0])}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="secondary"
          type="submit"
          onClick={() => handleClose(false)}
          size="small"
        >
          Deny
        </Button>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          onClick={() => handleClose(true)}
          size="small"
        >
          Allow
        </Button>
      </DialogActions>
    </div>
  );
}
