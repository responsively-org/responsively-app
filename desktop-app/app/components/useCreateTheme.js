import {useMemo} from 'react';
import {createMuiTheme} from '@material-ui/core/styles';
import {grey} from '@material-ui/core/colors';
import useIsDarkTheme from './useIsDarkTheme';

function useCreateTheme() {
  const isDark = useIsDarkTheme();
  return useMemo(() => createMuiTheme(isDark ? darkTheme : lightTheme), [
    isDark,
  ]);
}

const lightTheme = {
  palette: {
    type: 'light',
    primary: {
      main: '#6075ef',
    },
    secondary: {
      main: '#F5F5F5',
    },
    header: {
      main: '#F5F5F5',
    },
    lightIcon: {
      main: 'black',
    },
    mode({light, dark}) {
      return light;
    },
  },
};

const darkTheme = {
  palette: {
    type: 'dark',
    primary: {
      main: '#7587ec',
    },
    secondary: {
      main: '#424242',
    },
    divider: grey[500],
    background: {
      default: '#1e1e1e',
    },
    header: {
      main: '#252526',
    },
    lightIcon: {
      main: '#ffffff90',
    },
    mode({light, dark}) {
      return dark;
    },
  },
};

export default useCreateTheme;
