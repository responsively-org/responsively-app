import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  wrapper: {
    position: 'relative',
    display: 'flex',
    flexShrink: 0,
    marginBottom: 10,
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
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
    padding: '5px 0',
  },
  dragHandle: {
    cursor: 'move',
  },
  mainContent: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  editor: {
    height: '100%',
    marginBottom: 10,
  },
}));

export default useStyles;
