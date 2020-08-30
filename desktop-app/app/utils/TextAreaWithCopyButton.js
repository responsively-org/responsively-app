import React, {useState} from 'react';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
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
