import useMediaQuery from '@material-ui/core/useMediaQuery';
import {useSelector} from 'react-redux';
import {LIGHT_THEME, DARK_THEME} from '../constants/theme';
import {setTheme} from '../actions/browser';

function useIsDarkTheme() {
  const themeSource = useSelector(state => state.browser.theme);
  return themeSource === DARK_THEME;
}

export default useIsDarkTheme;
