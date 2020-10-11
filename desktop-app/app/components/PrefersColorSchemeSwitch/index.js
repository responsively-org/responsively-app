import React, {useState, useEffect} from 'react';
import {ipcRenderer} from 'electron';
import Tooltip from '@material-ui/core/Tooltip';
import LightColorSchemeIcon from '../icons/LightColorScheme';
import DarkColorSchemeIcon from '../icons/DarkColorScheme';

export default function PrefersColorSchemeSwitch({iconProps}) {
  const [colorScheme, setColorScheme] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );

  const handleSwitch = () => {
    setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    ipcRenderer.send('prefers-color-scheme-select', colorScheme);
  }, [colorScheme]);

  return (
    <Tooltip title="Switch color scheme">
      <div onClick={handleSwitch}>
        {colorScheme === 'dark' ? (
          <DarkColorSchemeIcon {...iconProps} />
        ) : (
          <LightColorSchemeIcon {...iconProps} />
        )}
      </div>
    </Tooltip>
  );
}
