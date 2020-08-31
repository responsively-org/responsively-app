import React, {useState} from 'react';
import cx from 'classnames';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import ProxyManager from './ProxyManager';
import commonStyles from '../common.styles.css';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import {makeStyles} from '@material-ui/core/styles';
import ProxyIcon from '../icons/Proxy';

const useStyles = makeStyles(theme => ({
  appBar: {
    position: 'relative',
  },
  title: {
    flex: 1,
  },
  preferenceName:{
    fontSize: '14px'
  },
  networkProxyTitle: {
    marginBottom: 0
  },
  sidebarContentSectionContainer: {
    marginTop: 0
  }
}));

export default function NetworkProxy({
  proxy,
  onToggleUseProxy,
  onProxyProfileChanged,
}) {
  const [open, setOpen] = useState(false);
  const closeDialog = () => setOpen(false);
  const classes = useStyles();
  const active = !!proxy?.active;

  const onSave = profile => {
    onProxyProfileChanged(profile);
    closeDialog();
  };

  return (
    <div className={cx(commonStyles.sidebarContentSection)}>
      <div
        className={cx(
          commonStyles.sidebarContentSectionTitleBar,
          classes.networkProxyTitle
        )}
      >
        <ProxyIcon
          color="white"
          height={24}
          width={24}
          margin="0 5px 0 0"
          className={cx(classes.networkProxyIcon)}
        />{' '}
        Proxy
      </div>
      <div
        className={cx(
          commonStyles.sidebarContentSectionContainer,
          classes.sidebarContentSectionContainer
        )}
      >
        <div>
          <FormControlLabel
            control={
              <Checkbox
                checked={active}
                onChange={() => onToggleUseProxy(!active)}
                name="Use Proxy"
                color="primary"
              />
            }
            label={<span className={cx(classes.preferenceName)}>Use Proxy</span>}
          />
          <Button
            variant="contained"
            color="primary"
            aria-label="clear network cache"
            component="span"
            onClick={() => setOpen(true)}
          >
            Configure
          </Button>
        </div>

        <Dialog
          className={cx(classes.profileManagerDialog)}
          maxWidth="lg"
          fullWidth
          open={open}
          scroll="paper"
          onClose={closeDialog}
        >
          <AppBar className={classes.appBar} color="secondary">
            <Toolbar>
              <Typography variant="h6" className={classes.title}>
                Configure Proxy Settings
              </Typography>
              <Button color="inherit" onClick={closeDialog}>
                close
              </Button>
            </Toolbar>
          </AppBar>
          <DialogContent>
            <ProxyManager proxy={proxy} onSave={onSave} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
