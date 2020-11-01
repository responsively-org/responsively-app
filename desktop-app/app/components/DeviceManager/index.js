import React, {useState, Fragment, useEffect} from 'react';
import {makeStyles, withStyles} from '@material-ui/core/styles';
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
import SaveIcon from '@material-ui/icons/Save';
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd';
import LightBulbIcon from '../icons/LightBulb';
import DeviceList from './DeviceList';
import AddDeviceContainer from '../../containers/AddDeviceContainer';
import ErrorBoundary from '../ErrorBoundary';

import styles from './styles.css';
import {Box, ButtonGroup, InputBase, TextField} from '@material-ui/core';

function DeviceManager(props) {
  const classes = useStyles();

  const [devices, setDevices] = useState({
    active: [],
    inactive: [],
    inactiveFiltered: [],
  });

  const activeWorkspace =
    props.browser.availableWorkspaces.byId[props.browser.workspace];
  const [workspaceName, setWorkspaceName] = useState(activeWorkspace.name);

  const [editedWorkspace, setEditedWorkspace] = useState(false);

  // Update workspace name
  useEffect(() => {
    setWorkspaceName(activeWorkspace.name);
  }, [activeWorkspace]);

  useEffect(() => {
    const activeDevices = activeWorkspace.devices;
    const activeDevicesById = activeDevices.reduce((acc, val) => {
      acc[val.id] = val;
      return acc;
    }, {});

    const devicesById = props.browser.allDevices.reduce((acc, val) => {
      acc[val.id] = val;
      return acc;
    }, {});

    const inactiveDevices = [
      ...props.browser.allDevices.filter(
        device => !activeDevicesById[device.id]
      ),
    ];

    setDevices({active: activeDevices, inactive: inactiveDevices});
  }, [activeWorkspace, props.browser.allDevices]);

  const onInactiveListFiltering = inactiveFiltered => {
    setDevices({...devices, inactiveFiltered});
  };

  const closeDialog = () => props.onClose();

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

  const handleNameChange = e => {
    setWorkspaceName(e.currentTarget.value);
    setEditedWorkspace(true);
  };

  const updateDevices = devices => {
    const active = [...devices.active];
    const inactive = [...devices.inactive];
    setDevices({active, inactive});
    setEditedWorkspace(true);
  };

  const updateWorkspace = () => {
    props.updateActiveWorkspace({
      ...activeWorkspace,
      name: workspaceName,
      devices: devices.active,
    });

    setEditedWorkspace(false);
  };

  return (
    <Dialog fullScreen open={props.open} onClose={closeDialog}>
      <AppBar className={classes.appBar} color="secondary">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            Manage Workspace
          </Typography>
          <Button
            color="inherit"
            disabled={!editedWorkspace}
            onClick={updateWorkspace}
            startIcon={<SaveIcon />}
          >
            Save
          </Button>
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
              <Box mb={1}>
                <TextField
                  label="Workspace name"
                  value={workspaceName}
                  onChange={handleNameChange}
                  disabled={activeWorkspace.isDefault}
                  InputProps={{
                    classes: {
                      root: classes.workspaceNameInput,
                    },
                  }}
                  fullWidth
                />
              </Box>
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
  workspaceNameInput: {
    color: theme.palette.text.primary,
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
