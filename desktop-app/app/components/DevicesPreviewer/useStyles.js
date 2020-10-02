import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    height: 'inherit',
  },
  previewer: {
    display: 'flex',
    flex: '1',
    height: '100%',
    width: '100%',
    overflow: 'auto',
    flexDirection: 'column',
  },
  flexigrid: {
    flexWrap: 'wrap',
  },
  horizontal: {
    flexWrap: 'nowrap',
  },
  devicesContainer: {
    display: 'flex',
    paddingBottom: '100px',
  },
  tab: {
    display: 'none',
    margin: 'auto',
  },
  activeTab: {
    display: 'block',
  },
  reactTabs: {
    position: 'sticky',
    left: 0,
    top: 0,
    marginBottom: '10px',
    zIndex: '4',
    backgroundColor: theme.palette.background.l0,
  },
  reactTabs__tab: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    bottom: 'unset',
    border: '1px solid #aaa',
    borderRadius: '5px 5px 0 0',
  },
  reactTabs__tabList: {
    display: 'flex',
    marginBottom: 0,
    overflow: 'auto',
  },
}));

export default useStyles;
