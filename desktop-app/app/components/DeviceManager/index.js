import React, {useState, Fragment, useEffect} from 'react';
import allDevices from '../../constants/devices';
import {makeStyles} from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import EditIcon from '@material-ui/icons/Edit';
import CloseIcon from '@material-ui/icons/Close';
import AddIcon from '@material-ui/icons/Add';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd';
import LightBulbIcon from '../icons/LightBulb';
import DeviceList from './DeviceList';
import AddDeviceContainer from '../../containers/AddDeviceContainer';

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

export default function DeviceManager(props) {
  const [open, setOpen] = useState(false);
  const classes = useStyles();

  const [devices, setDevices] = useState({
    active: [],
    inactive: [],
  });

  useEffect(() => {
    const activeDevices = props.browser.devices;
    const activeDevicesById = activeDevices.reduce((acc, val) => {
      acc[val.id] = val;
      return acc;
    }, {});
    const inactiveDevices = allDevices.filter(
      device => !activeDevicesById[device.id]
    );
    setDevices({active: activeDevices, inactive: inactiveDevices});
  }, props.browser.devices.map(JSON.stringify).join(','));

  const closeDialog = () => setOpen(false);

  const onDragEnd = result => {
    const {source, destination} = result;

    const sourceList = devices[source.droppableId];
    const destinationList = devices[destination.droppableId];

    const itemDragged = sourceList[source.index];
    sourceList.splice(source.index, 1);

    destinationList.splice(destination.index, 0, itemDragged);

    setDevices({...devices});
    props.setActiveDevices(devices.active);
  };
  return (
    <Fragment>
      <Button
        variant="contained"
        color="primary"
        aria-label="upload picture"
        component="span"
        onClick={() => setOpen(true)}
        className={styles.editButton}
      >
        Customize
        <EditIcon style={{fontSize: 'inherit'}} />
      </Button>
      <Dialog fullScreen open={open} onClose={closeDialog}>
        <AppBar className={classes.appBar} color="secondary">
          <Toolbar>
            <IconButton edge="start" onClick={closeDialog} aria-label="close">
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              Manage Devices
            </Typography>
            <Button color="inherit" onClick={closeDialog}>
              save
            </Button>
          </Toolbar>
        </AppBar>
        <div className={styles.container}>
          <p className={styles.toolTip}>
            <span>✨</span>Drag and drop the devices across as needed to
            re-order them.
          </p>
          <DragDropContext onDragEnd={onDragEnd}>
            <Grid container spacing={3} className={styles.content}>
              <Grid item xs={3} className={styles.section}>
                <div className={styles.listTitle}>
                  <LightBulbIcon height={30} color="#FFD517" />
                  Active Devices
                </div>
                <DeviceList droppableId={'active'} devices={devices.active} />
              </Grid>
              <Grid item xs={3} className={styles.section}>
                <div className={styles.listTitle}>
                  <LightBulbIcon height={30} color="darkgrey" />
                  Inactive Devices
                </div>
                <DeviceList
                  droppableId={'inactive'}
                  devices={devices.inactive}
                />
              </Grid>
            </Grid>
          </DragDropContext>
          <AddDeviceContainer />
        </div>
      </Dialog>
    </Fragment>
  );
}
