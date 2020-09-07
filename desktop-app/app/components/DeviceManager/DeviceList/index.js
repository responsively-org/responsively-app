import React, {Component} from 'react';
import {Droppable} from 'react-beautiful-dnd';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import SearchIcon from '@material-ui/icons/Search';
import TextField from '@material-ui/core/TextField';
import CancelIcon from '@material-ui/icons/Cancel';
import pubsub from 'pubsub.js';
import cx from 'classnames';
import DeviceItem from '../DeviceItem';

import styles from './styles.css';

class DeviceList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchOpen: false,
      searchText: '',
      filteredDevices: [],
    };
  }

  openSearch = () => {
    this.setState({searchOpen: true});
  };

  closeSearch = () => {
    this.setState({searchOpen: false, searchText: ''});
  };

  componentDidMount() {
    this.setState({filteredDevices: this.props.devices});
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.searchText === this.state.searchText) return;

    const filteredDevices = this.props.devices.filter(device => {
      if (!this.state.searchText) {
        return true;
      }
      return device.name.toLowerCase().indexOf(this.state.searchText) > -1;
    });

    this.updateFilteredDevices(filteredDevices);

    if (this.props.onFiltering) {
      this.props.onFiltering(filteredDevices);
    }
  }

  updateFilteredDevices = filteredDevices => {
    this.setState({filteredDevices});
  };

  render() {
    return (
      <>
        <div className={cx(styles.searchContainer)}>
          {this.props.enableFiltering && (
            <>
              {!this.state.searchOpen ? (
                <IconButton
                  className={styles.searchIcon}
                  onClick={this.openSearch}
                >
                  <SearchIcon fontSize="default" />
                </IconButton>
              ) : null}
              {this.state.searchOpen ? (
                <TextField
                  autoFocus
                  fullWidth
                  variant="outlined"
                  placeholder="Search..."
                  value={this.state.searchText}
                  onChange={e =>
                    this.setState({
                      searchText: e.target.value.toLowerCase(),
                    })
                  }
                  onKeyDown={e => {
                    if (e.key === 'Escape') this.closeSearch();
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment>
                        <IconButton
                          className={styles.searchActiveIcon}
                          onClick={() => this.closeSearch()}
                        >
                          <CancelIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              ) : null}
            </>
          )}
        </div>
        <Droppable droppableId={this.props.droppableId}>
          {provided => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={cx(styles.listHolder)}
            >
              {this.state.filteredDevices.map((device, index) => (
                <DeviceItem
                  device={device}
                  index={index}
                  key={device.id}
                  enableCustomDeviceDeletion={
                    this.props.enableCustomDeviceDeletion
                  }
                  deleteDevice={this.props.deleteDevice}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </>
    );
  }
}

export default DeviceList;
