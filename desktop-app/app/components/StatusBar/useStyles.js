import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles({
  statusBar: {
    height: '20px',
    display: 'flex',
    borderRadius: 0,
    boxShadow: '0 -3px 5px rgba(0, 0, 0, 0.35)',
    color: '#fffc',
    justifyContent: 'space-between',
  },
  section: {
    display: 'flex',
    alignItems: 'center',
    margin: '0 5px',
  },
  text: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'default',
    color: 'grey',
    fill: 'grey',
    borderRadius: 2,
    height: '100%',
    padding: '0 5px',
    filter: 'grayscale(1)',
  },
  link: {
    cursor: 'pointer',
    '&:hover': {
      color: 'lightgrey',
      fill: 'lightgrey',
      backgroundColor: '#000',
      filter: 'none',
    },
  },
  linkIcon: {
    fill: 'inherit',
    margin: '0 4px',
  },
  linkText: {
    color: 'inherit',
    fontSize: '12px',
  },
});

export default useStyles;
