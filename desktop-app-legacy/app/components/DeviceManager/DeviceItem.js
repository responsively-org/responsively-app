import React, {useState} from 'react';
import {Draggable} from 'react-beautiful-dnd';
import DragIndicator from '@material-ui/icons/DragIndicator';
import PhoneIcon from '@material-ui/icons/PhoneIphone';
import IconButton from '@material-ui/core/IconButton';
import {useTheme, makeStyles} from '@material-ui/core/styles';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import Tooltip from '@material-ui/core/Tooltip';
import cx from 'classnames';

import useCommonStyles from '../useCommonStyles';
import {DEVICE_TYPE, SOURCE} from '../../constants/devices';
import {getDeviceIcon} from '../../utils/iconUtils';
import OSIcon from './OSIcon';

function DeviceItem({device, index, enableCustomDeviceDeletion, deleteDevice}) {
  const [showDeleteIcon, setShowDeleteIcon] = useState(false);
  const theme = useTheme();
  const commonClasses = useCommonStyles();
  const classes = useStyles();

  return (
    <Draggable draggableId={device.id} index={index}>
      {provided => (
        <div
          className={classes.deviceHolder}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onMouseEnter={() => setShowDeleteIcon(true)}
          onMouseLeave={() => setShowDeleteIcon(false)}
        >
          <div
            className={cx(
              commonClasses.flexAlignVerticalMiddle,
              commonClasses.fullWidth,
              classes.content
            )}
          >
            <DragIndicator style={{color: 'grey'}} />
            <div
              className={cx(
                commonClasses.flexContainerSpaceBetween,
                commonClasses.fullWidth
              )}
            >
              <div className={commonClasses.flexAlignVerticalMiddle}>
                {getDeviceIcon(device.type)}
                <span className={classes.deviceName}>{device.name}</span>
                <span className={classes.deviceDimensions}>
                  {device.width}x{device.height}
                </span>
              </div>
              <div>
                <OSIcon os={device.os} color={theme.palette.lightIcon.main} />
              </div>
            </div>
            {enableCustomDeviceDeletion &&
            device.source === SOURCE.custom &&
            showDeleteIcon ? (
              <Tooltip title="Delete Device Profile">
                <IconButton
                  className={classes.deleteIcon}
                  onClick={() => deleteDevice(device)}
                >
                  <DeleteForeverIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : null}
          </div>
        </div>
      )}
    </Draggable>
  );
}

const useStyles = makeStyles(theme => ({
  deviceHolder: {
    display: 'flex',
    width: '100%',
    borderRadius: '10px',
    height: '70px',
    background: theme.palette.mode({
      light: theme.palette.grey[400],
      dark: '#2b2b2b',
    }),
    border: '1px solid lightgrey',
    padding: '20px',
    boxSizing: 'border-box',
    marginBottom: '10px',
  },
  deviceName: {
    fontSize: '16px',
    marginRight: '5px',
  },
  deviceDimensions: {
    fontSize: '10px',
    color: theme.palette.mode({
      light: theme.palette.grey[800],
      dark: '#ffffff90',
    }),
  },
  content: {
    padding: '0.8em 1em 0.8em 0',
    position: 'relative',
  },
  deleteIcon: {
    position: 'absolute !important',
    right: '-25px',
    top: '-10px',
  },
}));

export default DeviceItem;
