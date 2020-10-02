import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  wrapper: {
    position: 'relative',
    display: 'flex',
    flexShrink: 0,
  },
  container: {
    background: theme.palette.background.l2,
    margin: 5,
    padding: 10,
    borderRadius: 2,
    boxShadow: `0 ${theme.palette.mode({
      light: '0px',
      dark: '3px',
    })} 5px rgba(0, 0, 0, 0.35)`,
  },
  titleBar: {
    cursor: 'move',
    padding: '5px 0',
  },
  editor: {
    minHeight: 200,
    height: 'auto',
    marginBottom: 10,
  },
}));

export default useStyles;
