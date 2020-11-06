import {makeStyles, useTheme} from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
  fab: {
    position: 'absolute',
    top: theme.spacing(10),
    right: theme.spacing(3),
  },
  extendedIcon: {
    marginRight: theme.spacing(1),
  },
  inputField: {
    marginRight: '1%',
    width: '49%',
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  select: {
    marginTop: theme.spacing(2),
    maxWidth: 150,
  },
  radioIcon: {
    color: theme.palette.lightIcon.main,
  },
  inputAdornment: {
    color: theme.palette.lightIcon.main,
  },
  userAgent: {
    fontSize: 12,
  },
  actionButton: {
    padding: '10px !important',
    borderRadius: '5px !important',
  },
}));
