import React, {useState} from 'react';
import FormControl from '@material-ui/core/FormControl';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import AssignmentIcon from '@material-ui/icons/Assignment';
import Tooltip from '@material-ui/core/Tooltip';
import CopyToClipBoard from 'react-copy-to-clipboard';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';

const TextAreaWithCopyButton = props => (
  <Box>
    <p>
      <TextareaAutosize rowsMax={10} defaultValue={props.text} />
    </p>
    <CopyToClipBoard text={props.text}>
      <Button>Copy</Button>
    </CopyToClipBoard>
  </Box>
);

export default TextAreaWithCopyButton;
