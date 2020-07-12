import React, {useState, useEffect} from 'react';
import {Droppable} from 'react-beautiful-dnd';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import SearchIcon from '@material-ui/icons/Search';
import TextField from '@material-ui/core/TextField';
import CancelIcon from '@material-ui/icons/Cancel';
import cx from 'classnames';
import DeviceItem from '../DeviceItem';

import styles from './styles.css';

export default function DeviceList({
  droppableId,
  devices,
  enableFiltering,
  onFiltering,
  enableCustomDeviceDeletion,
  deleteDevice,
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredDevices, setFilteredList] = useState(devices);
  useEffect(() => {
    const filteredDevices = devices.filter(device => {
      if (!searchText) {
        return true;
      }
      return device.name.toLowerCase().indexOf(searchText) > -1;
    });

    setFilteredList(filteredDevices);
    if (onFiltering) {
      onFiltering(filteredDevices);
    }
  }, [searchText, devices]);
  return (
    <>
      <div className={cx(styles.searchContainer)}>
        {enableFiltering && (
          <>
            {!searchOpen ? (
              <IconButton
                className={styles.searchIcon}
                onClick={() => setSearchOpen(true)}
              >
                <SearchIcon fontSize="default" />
              </IconButton>
            ) : null}
            {searchOpen ? (
              <TextField
                autoFocus
                fullWidth
                variant="outlined"
                placeholder="Search..."
                value={searchText}
                onChange={e => setSearchText(e.target.value.toLowerCase())}
                InputProps={{
                  endAdornment: (
                    <InputAdornment>
                      <IconButton
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchText('');
                        }}
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
      <Droppable droppableId={droppableId}>
        {provided => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cx(styles.listHolder)}
          >
            {filteredDevices.map((device, index) => (
              <DeviceItem
                device={device}
                index={index}
                key={device.id}
                enableCustomDeviceDeletion={enableCustomDeviceDeletion}
                deleteDevice={deleteDevice}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </>
  );
}
