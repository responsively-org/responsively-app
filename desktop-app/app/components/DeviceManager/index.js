import React, {Component, createRef, Fragment} from 'react';
import {withStyles} from '@material-ui/core/styles';
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
import Mousetrap from 'mousetrap';

import styles from './styles.css';

const additionalStyles = theme => ({
  appBar: {
    position: 'relative',
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
});

class DeviceManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      devices: {
        active: [],
        inactive: [],
        inactiveFiltered: [],
      },
    };
    this.inactiveDeviceSearch = createRef();
  }

  componentDidMount() {
    const activeDevices = this.props.browser.devices;
    const activeDevicesById = activeDevices.reduce((acc, val) => {
      acc[val.id] = val;
      return acc;
    }, {});

    const currentInactiveDevicesById = this.state.devices.inactive.reduce(
      (acc, val) => {
        acc[val.id] = val;
        return acc;
      },
      {}
    );

    const devicesById = this.props.browser.allDevices.reduce((acc, val) => {
      acc[val.id] = val;
      return acc;
    }, {});

    const inactiveDevices = [
      ...this.props.browser.allDevices.filter(
        device =>
          !activeDevicesById[device.id] &&
          !currentInactiveDevicesById[device.id]
      ),
      ...this.state.devices.inactive.filter(device => devicesById[device.id]),
    ];

    this.setState({
      devices: {active: activeDevices, inactive: inactiveDevices},
    });

    Mousetrap.bind('mod+f', () => {
      this.inactiveDeviceSearch.current.openSearch();
    });
  }

  componentWillUnmount() {
    Mousetrap.unbind('mod+f');
  }

  onInactiveListFiltering = inactiveFiltered => {
    this.setState((state, props) => ({
      devices: {
        active: state.devices.active,
        inactive: state.devices.inactive,
        inactiveFiltered,
      },
    }));
  };

  closeDialog = () => this.setState({open: false});

  onDragEnd = result => {
    const {source, destination} = result;

    if (!source || !destination) {
      return;
    }

    const sourceList = this.state.devices[source.droppableId];
    const destinationList = this.state.devices[destination.droppableId];

    if (!sourceList || !destinationList) {
      return;
    }

    console.log(this.state.devices.inactiveFiltered);

    const itemDragged =
      source.droppableId === 'inactive'
        ? this.state.devices.inactiveFiltered[source.index]
        : sourceList[source.index];

    let idx = destination.index;

    if (destination.droppableId === 'inactive') {
      idx =
        destination.index < this.state.devices.inactiveFiltered.length
          ? this.state.devices.inactive.findIndex(
              d =>
                d.id ===
                this.state.devices.inactiveFiltered[destination.index].id
            )
          : this.state.devices.inactive.length;
    }

    sourceList.splice(sourceList.indexOf(itemDragged), 1);

    destinationList.splice(idx, 0, itemDragged);

    this.updateDevices(this.state.devices);
  };

  updateDevices = devices => {
    const active = [...devices.active];
    const inactive = [...devices.inactive];
    this.setState({devices: {active, inactive}});
    this.props.setActiveDevices(active);
  };

  render() {
    const {classes} = this.props;
    // console.log(this.inactiveDeviceSearch);
    return (
      <Fragment>
        <Button
          variant="contained"
          color="primary"
          aria-label="upload picture"
          component="span"
          onClick={() => this.setState({open: true})}
          className={styles.editButton}
        >
          Customize
          {/* <EditIcon style={{fontSize: 'inherit'}} /> */}
        </Button>
        <Dialog fullScreen open={this.state.open}>
          <AppBar className={classes.appBar} color="secondary">
            <Toolbar>
              {/* <IconButton edge="start" onClick={this.closeDialog} aria-label="close">
              <CloseIcon />
             </IconButton> */}
              <Typography variant="h6" className={classes.title}>
                Manage Devices
              </Typography>
              <Button color="inherit" onClick={this.closeDialog}>
                close
              </Button>
            </Toolbar>
          </AppBar>
          <div className={styles.container}>
            <p className={styles.toolTip}>
              <span>✨</span>Drag and drop the devices across to re-order them.
            </p>
            <DragDropContext onDragEnd={this.onDragEnd}>
              <Grid container className={styles.content}>
                <Grid item className={styles.section}>
                  <div className={styles.listTitle}>
                    <LightBulbIcon height={30} color="#FFD517" />
                    Active Devices
                  </div>
                  <DeviceList
                    droppableId="active"
                    devices={this.state.devices.active}
                  />
                </Grid>
                <Grid item className={styles.section}>
                  <div className={styles.listTitle}>
                    <LightBulbIcon height={30} color="darkgrey" />
                    Inactive Devices
                  </div>
                  <DeviceList
                    droppableId="inactive"
                    devices={this.state.devices.inactive}
                    enableFiltering
                    onFiltering={this.onInactiveListFiltering}
                    enableCustomDeviceDeletion
                    deleteDevice={this.props.deleteDevice}
                    ref={this.inactiveDeviceSearch}
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
}

export default withStyles(additionalStyles)(DeviceManager);
