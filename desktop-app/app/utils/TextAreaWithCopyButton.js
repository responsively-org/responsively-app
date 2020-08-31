import React from 'react';
import CopyToClipBoard from 'react-copy-to-clipboard';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  codeBoxContainer: {
    overflow: 'auto',
    width: '30vw',
    height: '40vh',
    marginBottom: '10px',
    marginTop: '10px',
    border: '1px white solid',
    padding: '0 10px',
    borderRadius: '4px',
  },
  codeBox: {
    fontSize: '14px',
    textAlign: 'left',
  },
}));

const TextAreaWithCopyButton = props => {
  const classes = useStyles();
  return (
    <Box>
      <div className={classes.codeBoxContainer}>
        <pre className={classes.codeBox}>
          {(props.text || '').split('\\n ').map((line, idx) => {
            if (idx === 0) return line;
            return (
              <>
                <br />
                {line}
              </>
            );
          })}
        </pre>
      </div>
      <CopyToClipBoard text={props.text}>
        <Button size="small" variant="contained" color="primary">
          Copy
        </Button>
      </CopyToClipBoard>
    </Box>
  );
};

export default TextAreaWithCopyButton;
