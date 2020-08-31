import React, {useState} from 'react';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import TextField from '@material-ui/core/TextField';
import CopyToClipBoard from 'react-copy-to-clipboard';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';

const TextAreaWithCopyButton = props => (
  <Box>
    <p>
      <TextField
        style={{width: '150%'}}
        rowsMax={10}
        defaultValue={props.text}
        multiline
      />
    </p>
    <CopyToClipBoard text={props.text}>
      <Button>Copy</Button>
    </CopyToClipBoard>
  </Box>
);

export default TextAreaWithCopyButton;
