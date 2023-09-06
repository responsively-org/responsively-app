import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  preferenceName: {
    fontSize: '14px',
  },
  preferenceColor: {
    width: '24px',
    height: '20px',
    margin: '0 10px',
    border: 'transparent',
    '& input': {
      width: '24px',
      height: '26px',
      border: 'transparent',
    },
  },
  sectionTitle: {
    margin: '5px 0',
  },
  sectionHeader: {
    '&:after': {
      content: '""',
      flex: 1,
      marginLeft: 5,
      height: 1,
      backgroundColor: theme.palette.text.primary,
    },
  },
  marginTop: {
    marginTop: '10px',
  },
  permissionsSelectorSmallNote: {
    color: theme.palette.text.primary,
    margin: 0,
    fontSize: '0.75rem',
    marginTop: '10px',
    textAlign: 'left',
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    fontWeight: 400,
    lineHeight: 1.66,
    letterSpacing: '0.03333em',
  },
  spellCheckToggleSmallNote: {
    color: theme.palette.text.primary,
    margin: 0,
    fontSize: '10px',
  },
  exportPreferencesButtons: {
    display: 'flex',
    justifyContent: 'space-around',
  },
  importAndExportLabels: {
    fontSize: '12px',
    paddingRight: '1.5em',
  },
  containerImportButton: {
    display: 'flex',
    alignItems: 'center',
  },
}));

export default useStyles;
