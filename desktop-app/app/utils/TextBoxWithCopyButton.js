import React, {useState} from 'react';
import FormControl from '@material-ui/core/FormControl';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import AssignmentIcon from '@material-ui/icons/Assignment';
import Tooltip from '@material-ui/core/Tooltip';
import CopyToClipBoard from 'react-copy-to-clipboard';

const TextBoxWithCopyButton = props => (
  <FormControl variant="outlined">
    <OutlinedInput
      type="text"
      value={props.text}
      endAdornment={
        <InputAdornment position="end">
          <Tooltip arrow disableHoverListener placement="top" title="Copied!">
            <CopyToClipBoard text={props.text}>
              <IconButton disabled={props.text === ''}>
                <AssignmentIcon />
              </IconButton>
            </CopyToClipBoard>
          </Tooltip>
        </InputAdornment>
      }
    />
  </FormControl>
);

export default TextBoxWithCopyButton;
