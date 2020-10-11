import React, {useState} from 'react';
import cx from 'classnames';
import Button from '@material-ui/core/Button';
import NetworkCheckIcon from '@material-ui/icons/NetworkCheck';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import {makeStyles} from '@material-ui/core/styles';
import ProfileManager from './ProfileManager';
import Select from '../Select';
import useCommonStyles from '../useCommonStyles';
import styles from './styles.css';

const useStyles = makeStyles(theme => ({
  appBar: {
    position: 'relative',
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
}));

function NetworkThrottling({
  throttling,
  onActiveThrottlingProfileChanged,
  onThrottlingProfilesListChanged,
}) {
  const [open, setOpen] = useState(false);
  const closeDialog = () => setOpen(false);
  const classes = useStyles();
  const commonClasses = useCommonStyles();

  const selectedIdx = throttling.findIndex(p => p.active);
  const options = throttling.map(p => ({
    value: p.title,
    label: p.title,
  }));
  const selectedOption = options[selectedIdx];

  const onThrottlingProfileChanged = val => {
    if (val.value !== selectedOption.value)
      onActiveThrottlingProfileChanged(val.value);
  };

  const saveThrottlingProfiles = profiles => {
    onThrottlingProfilesListChanged(profiles);
    closeDialog();
  };

  return (
    <div className={commonClasses.sidebarContentSection}>
      <div className={commonClasses.sidebarContentSectionTitleBar}>
        <NetworkCheckIcon className={cx(styles.networkThrottlingIcon)} />{' '}
        Network Throttling
      </div>
      <div className={commonClasses.sidebarContentSectionContainer}>
        <div className={cx(styles.throttlingProfileSelectorContainer)}>
          <Select
            options={options}
            value={selectedOption}
            onChange={onThrottlingProfileChanged}
          />
        </div>

        <Button
          variant="contained"
          color="primary"
          aria-label="clear network cache"
          component="span"
          onClick={() => setOpen(true)}
        >
          Manage Profiles
        </Button>
        <Dialog
          className={cx(styles.profileManagerDialog)}
          maxWidth="md"
          fullWidth
          open={open}
          scroll="paper"
          onClose={closeDialog}
        >
          <AppBar className={classes.appBar} color="secondary">
            <Toolbar>
              <Typography variant="h6" className={classes.title}>
                Manage Throttling Profiles
              </Typography>
              <Button color="inherit" onClick={closeDialog}>
                close
              </Button>
            </Toolbar>
          </AppBar>
          <DialogContent>
            <ProfileManager
              profiles={[...throttling]}
              onSave={saveThrottlingProfiles}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default NetworkThrottling;
