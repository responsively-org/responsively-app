import React, {Component, useEffect, useState} from 'react';
import {Droppable} from 'react-beautiful-dnd';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import SearchIcon from '@material-ui/icons/Search';
import TextField from '@material-ui/core/TextField';
import CancelIcon from '@material-ui/icons/Cancel';
import cx from 'classnames';
import DeviceItem from '../DeviceItem';

import styles from './styles.css';

const DeviceListHandler = props => {
  const [filteredDevices, setFilteredList] = useState(props.devices);
  useEffect(() => {
    const filteredDevices = props.devices.filter(device => {
      if (!props.searchText) {
        return true;
      }
      return device.name.toLowerCase().indexOf(props.searchText) > -1;
    });

    setFilteredList(filteredDevices);
    if (props.onFiltering) {
      props.onFiltering(filteredDevices);
    }
  }, [props.searchText, props.devices]);

  return filteredDevices.map((device, index) => (
    <DeviceItem device={device} index={index} key={device.id} />
  ));
};

class DeviceList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchOpen: false,
      searchText: '',
    };
  }

  openSearch = () => {
    this.setState({searchOpen: true});
  };

  closeSearch = () => {
    this.setState({searchOpen: false, searchText: ''});
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
              <DeviceListHandler
                devices={this.props.devices}
                onFiltering={this.props.onFiltering}
                searchText={this.state.searchText}
              />
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </>
    );
  }
}

export default DeviceList;
