import useMediaQuery from '@material-ui/core/useMediaQuery';
import {useSelector} from 'react-redux';
import {LIGHT_THEME, DARK_THEME, SYSTEM_THEME} from '../constants/theme';
import {setTheme} from '../actions/browser';

function useIsDarkTheme() {
  const prefersDarkTheme = useMediaQuery(
    `(prefers-color-scheme: ${DARK_THEME})`
  );
  const themeSource = useSelector(state => state.browser.theme);

  return themeSource === SYSTEM_THEME
    ? prefersDarkTheme
    : themeSource === DARK_THEME;
}

export default useIsDarkTheme;
