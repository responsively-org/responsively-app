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
      light: '#3450db',
      main: '#2e47d0',
    },
    secondary: {
      main: '#F5F5F5',
    },
    background: {
      l0: '#f8f8f8',
      l1: '#ffffff',
      l2: '#e7e7e7',
    },
    header: {
      main: '#F5F5F5',
    },
    gray: {
      l1: '#eff1f2',
    },
    text: {
      active: '#1e1e1e',
      dim: '#606060',
      inactive: '#b7b7b7',
      normal: '#363636',
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
      light: '#7587ec',
      main: '#536be7',
    },
    secondary: {
      main: '#424242',
    },
    divider: grey[500],
    background: {
      l0: '#1e1e1e',
      l1: '#2f2f33',
      l2: '#383838',
    },
    header: {
      main: '#252526',
    },
    gray: {
      l1: '#1e1e1e',
    },
    text: {
      active: '#ffffff',
      dim: '#868686',
      inactive: '#838383',
      normal: '#f8f8f8',
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
