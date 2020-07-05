import React, {useState, useEffect} from 'react';
import {ipcRenderer} from 'electron';
import Tooltip from '@material-ui/core/Tooltip';
import {iconsColor} from '../../constants/colors';
import LightColorScheme from '../icons/LightColorScheme';
import DarkColorScheme from '../icons/DarkColorScheme';

export default function PrefersColorSchemeSwitch() {
  const [colorScheme, setColorScheme] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );

  const handleSwitch = () => {
    setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    ipcRenderer.send('prefers-color-scheme-select', colorScheme);
  });

  const iconProps = {
    color: iconsColor,
    height: 25,
    width: 25,
  };

  return (
    <Tooltip title="Switch color scheme">
      <div onClick={handleSwitch}>
        {colorScheme === 'dark' ? (
          <DarkColorScheme {...iconProps} />
        ) : (
          <LightColorScheme {...iconProps} />
        )}
      </div>
    </Tooltip>
  );
}
