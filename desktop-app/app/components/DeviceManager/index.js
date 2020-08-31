import React, {useState, Fragment, useEffect} from 'react';
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
import ErrorBoundary from '../ErrorBoundary';

import styles from './styles.css';

function DeviceManager(props) {
  const [open, setOpen] = useState(false);
  const classes = useStyles();

  const [devices, setDevices] = useState({
    active: [],
    inactive: [],
    inactiveFiltered: [],
  });

  useEffect(() => {
    const activeDevices = props.browser.devices;
    const activeDevicesById = activeDevices.reduce((acc, val) => {
      acc[val.id] = val;
      return acc;
    }, {});

    const currentInactiveDevicesById = devices.inactive.reduce((acc, val) => {
      acc[val.id] = val;
      return acc;
    }, {});

    const devicesById = props.browser.allDevices.reduce((acc, val) => {
      acc[val.id] = val;
      return acc;
    }, {});

    const inactiveDevices = [
      ...props.browser.allDevices.filter(
        device =>
          !activeDevicesById[device.id] &&
          !currentInactiveDevicesById[device.id]
      ),
      ...devices.inactive.filter(device => devicesById[device.id]),
    ];

    setDevices({active: activeDevices, inactive: inactiveDevices});
  }, [props.browser.devices, props.browser.allDevices]);

  const onInactiveListFiltering = inactiveFiltered => {
    setDevices({...devices, inactiveFiltered});
  };

  const closeDialog = () => setOpen(false);

  const onDragEnd = result => {
    const {source, destination} = result;

    if (!source || !destination) {
      return;
    }

    const sourceList = devices[source.droppableId];
    const destinationList = devices[destination.droppableId];

    if (!sourceList || !destinationList) {
      return;
    }

    const itemDragged =
      source.droppableId === 'inactive'
        ? devices.inactiveFiltered[source.index]
        : sourceList[source.index];

    let idx = destination.index;

    if (destination.droppableId === 'inactive') {
      idx =
        destination.index < devices.inactiveFiltered.length
          ? devices.inactive.findIndex(
              d => d.id === devices.inactiveFiltered[destination.index].id
            )
          : devices.inactive.length;
    }

    sourceList.splice(sourceList.indexOf(itemDragged), 1);

    destinationList.splice(idx, 0, itemDragged);

    updateDevices(devices);
  };

  const updateDevices = devices => {
    const active = [...devices.active];
    const inactive = [...devices.inactive];
    setDevices({active, inactive});
    props.setActiveDevices(active);
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
      </Button>
      {open ? (
        <Dialog fullScreen open={open} onClose={closeDialog}>
          <AppBar className={classes.appBar} color="secondary">
            <Toolbar>
              <Typography variant="h6" className={classes.title}>
                Manage Devices
              </Typography>
              <Button color="inherit" onClick={closeDialog}>
                close
              </Button>
            </Toolbar>
          </AppBar>
          <div className={styles.container}>
            <Typography variant="body1" className={classes.toolTip}>
              <span>✨</span>Drag and drop the devices across to re-order them.
            </Typography>
            <DragDropContext onDragEnd={onDragEnd}>
              <Grid container className={styles.content}>
                <Grid item className={styles.section}>
                  <div className={styles.listTitle}>
                    <LightBulbIcon height={30} color="#FFD517" />
                    Active Devices
                  </div>
                  <DeviceList droppableId="active" devices={devices.active} />
                </Grid>
                <Grid item className={styles.section}>
                  <div className={styles.listTitle}>
                    <LightBulbIcon height={30} color="darkgrey" />
                    Inactive Devices
                  </div>
                  <DeviceList
                    droppableId="inactive"
                    devices={devices.inactive}
                    enableFiltering
                    onFiltering={onInactiveListFiltering}
                    enableCustomDeviceDeletion
                    deleteDevice={props.deleteDevice}
                  />
                </Grid>
              </Grid>
            </DragDropContext>
            <AddDeviceContainer />
          </div>
        </Dialog>
      ) : null}
    </Fragment>
  );
}

const useStyles = makeStyles(theme => ({
  appBar: {
    position: 'relative',
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
  toolTip: {
    background: theme.palette.mode({
      light: theme.palette.grey[400],
      dark: '#ffffff10',
    }),
    padding: '10px 40px',
    borderRadius: '5px',
    margin: '0 auto 20px',
    textAlign: 'center',
    fontSize: '14px',
    color: theme.palette.text.primary,
    width: 'fit-content',
  },
}));

export default DeviceManager;
