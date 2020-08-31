import React, {useState, useEffect} from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import {useDispatch} from 'react-redux';
import LightColorSchemeIcon from '../icons/LightColorScheme';
import DarkColorSchemeIcon from '../icons/DarkColorScheme';
import {LIGHT_THEME, DARK_THEME} from '../../constants/theme';
import {setTheme} from '../../actions/browser';
import useIsDarkTheme from '../useIsDarkTheme';

function PrefersColorSchemeSwitch({iconProps}) {
  const dispatch = useDispatch();
  const isDark = useIsDarkTheme();

  return (
    <Tooltip title="Switch color scheme">
      <div
        onClick={() => dispatch(setTheme(isDark ? LIGHT_THEME : DARK_THEME))}
      >
        {isDark ? (
          <DarkColorSchemeIcon {...iconProps} />
        ) : (
          <LightColorSchemeIcon {...iconProps} />
        )}
      </div>
    </Tooltip>
  );
}

export default PrefersColorSchemeSwitch;
