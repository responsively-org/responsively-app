import React, {useState} from 'react';
import cx from 'classnames';
import Button from '@material-ui/core/Button';
import NetworkCheckIcon from '@material-ui/icons/NetworkCheck';
import Select from 'react-select';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import ProfileManager from './ProfileManager';

import {makeStyles} from '@material-ui/core/styles';
import commonStyles from '../common.styles.css';
import styles from './styles.css';

const selectStyles = {
  control: selectStyles => ({...selectStyles, backgroundColor: '#ffffff10'}),
  option: (selectStyles, {data, isDisabled, isFocused, isSelected}) => {
    const color = 'white';
    return {
      ...selectStyles,
      backgroundColor: isDisabled
        ? null
        : isSelected
        ? '#ffffff40'
        : isFocused
        ? '#ffffff20'
        : null,
      color: 'white',

      ':active': {
        ...selectStyles[':active'],
        backgroundColor: !isDisabled && '#ffffff40',
      },
    };
  },
  input: selectStyles => ({...selectStyles}),
  placeholder: selectStyles => ({...selectStyles}),
  singleValue: (selectStyles, {data}) => ({...selectStyles, color: 'white'}),
  menu: selectStyles => ({...selectStyles, background: '#4b4b4b', zIndex: 100}),
};

const useStyles = makeStyles(theme => ({
  appBar: {
    position: 'relative',
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
}));

export default function NetworkThrottling({
  throttling,
  onActiveThrottlingProfileChanged,
  onThrottlingProfilesListChanged,
}) {
  const [open, setOpen] = useState(false);
  const closeDialog = () => setOpen(false);
  const classes = useStyles();

  const selectedIdx = throttling.findIndex(p => p.active);
  const options = throttling.map(p => {
    return {
      value: p.title,
      label: p.title,
    };
  });
  const selectedOption = options[selectedIdx];

  const onThrottlingProfileChanged = (val) => {
  if (val.value !== selectedOption.value)
    onActiveThrottlingProfileChanged(val.value);
  };

  const saveThrottlingProfiles = (profiles) => {
    onThrottlingProfilesListChanged(profiles);
    closeDialog();
  }

  return (
    <div className={cx(commonStyles.sidebarContentSection)}>
      <div className={cx(commonStyles.sidebarContentSectionTitleBar)}>
        <NetworkCheckIcon className={cx(styles.networkThrottlingIcon)}/>  Network Throttling
      </div>
      <div className={cx(commonStyles.sidebarContentSectionContainer)}>
        <div className={cx(styles.throttlingProfileSelectorContainer)}>
          <Select
            options={options}
            value={selectedOption}
            onChange={onThrottlingProfileChanged}
            styles={selectStyles}
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
        <Dialog className={cx(styles.profileManagerDialog)} maxWidth="md" fullWidth open={open} scroll="paper" onClose={closeDialog}>
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
            <ProfileManager profiles={[...throttling]} onSave={saveThrottlingProfiles} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
