import React, {useState, useEffect} from 'react';
import {Droppable} from 'react-beautiful-dnd';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import SearchIcon from '@material-ui/icons/Search';
import TextField from '@material-ui/core/TextField';
import CancelIcon from '@material-ui/icons/Cancel';
import {makeStyles} from '@material-ui/core/styles';
import cx from 'classnames';
import DeviceItem from './DeviceItem';

function DeviceList({
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
  const classes = useStyles();
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
      <div className={classes.searchContainer}>
        {enableFiltering && (
          <>
            {!searchOpen ? (
              <IconButton
                className={classes.searchIcon}
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
                        className={classes.searchActiveIcon}
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
            className={classes.listHolder}
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

const useStyles = makeStyles(theme => ({
  listHolder: {
    padding: '20px',
    background: theme.palette.mode({
      light: theme.palette.background.primary,
      dark: '#00000030',
    }),
    borderRadius: '10px',
    border: '1px solid lightgrey',
    height: '65vh',
    width: '400px',
    overflow: 'scroll',
  },
  searchContainer: {
    height: '50px',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  searchIcon: {
    margin: '0 14px 0 !important',
    color: 'white !important',
  },
  searchActiveIcon: {
    color: 'white !important',
  },
}));

export default DeviceList;
