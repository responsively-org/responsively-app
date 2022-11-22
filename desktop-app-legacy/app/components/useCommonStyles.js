import {makeStyles} from '@material-ui/core/styles';

const styles = theme => ({
  sidebarContentSection: {
    background: theme.palette.mode({
      light: theme.palette.grey[300],
      dark: '#00000040',
    }),
    borderRadius: '5px',
    margin: '8px',
    padding: '8px',
  },
  sidebarContentSectionTitleBar: {
    display: 'flex',
    alignItems: 'center',
    padding: '5px',
    marginBottom: '5px',
    textTransform: 'uppercase',
    fontSize: '14px',
  },
  sidebarContentSectionContainer: {
    margin: '8px 8px 25px 8px',
  },
  icon: {
    cursor: 'pointer',
    position: 'relative',
    opacity: 0.8,
    borderRadius: '5px',
    '&:hover': {
      opacity: 1,
      backgroundColor: theme.palette.primary.main,
      color: 'white',
    },
  },
  iconSelected: {
    backgroundColor: theme.palette.primary.light,
    color: 'white',
  },
  iconRound: {
    borderRadius: '50%',
  },
  iconDisabled: {
    opacity: 0.3,
    cursor: 'auto',
  },
  iconHoverDisabled: {
    '&:hover': {
      opacity: 0.3,
      backgroundColor: 'unset',
    },
  },
  iconDisabler: {
    position: 'absolute',
    top: 0,
    left: 0,
    display: 'none',
    zIndex: 2,
    height: '100%',
    width: '100%',
  },
  flexContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexAlignVerticalMiddle: {
    display: 'flex',
    alignItems: 'center',
  },
  flexContainerSpaceBetween: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  fullWidth: {
    width: '100%',
  },
  hidden: {
    display: 'none',
  },
});

export default makeStyles(styles);
export {styles};
