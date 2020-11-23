import React from 'react';

import {makeStyles} from '@material-ui/core/styles';
import {useTheme} from '@material-ui/core/styles';

import {components} from 'react-select';

const useStyles = makeStyles(theme => ({
  addBtn: {
    color: theme.palette.text.normal,
    cursor: 'pointer',
    display: 'block',
    fontSize: 'inherit',
    padding: '8px 12px',
    width: '100%',

    '&:hover': {
      backgroundColor: theme.palette.background.l5,
    },
  },
}));

const Menu = props => {
  const {onAddWorkspace, ...menuProps} = props;

  const classes = useStyles();

  return (
    <components.Menu {...props}>
      {props.children}
      <div
        className={classes.addBtn}
        onClick={() => {
          onAddWorkspace();
        }}
        tabIndex="-1"
      >
        Add New Workspace ...
      </div>
    </components.Menu>
  );
};

export default Menu;
