import {makeStyles, useTheme, withStyles} from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
  appBar: {
    position: 'relative',
    backgroundColor: theme.palette.mode({
      dark: theme.palette.background.l1,
      light: 'inherit',
    }),
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
  workspaceNameInput: {
    color: theme.palette.text.primary,
  },
  toolTip: {
    background: theme.palette.mode({
      light: theme.palette.grey[400],
      dark: '#ffffff10',
    }),
    padding: '10px 40px',
    borderRadius: '5px',
    margin: '0 auto 20px',
    textAlign: 'center',
    fontSize: '14px',
    color: theme.palette.text.primary,
    width: 'fit-content',
  },
}));
