import {Icon} from '@iconify/react';
import {IPC_MAIN_CHANNELS} from 'common/constants';
import {SetNativeThemeArgs, SetNativeThemeResult} from 'main/native-functions';
import {useState} from 'react';
import {ToolbarAction} from '../primitives';

const ColorSchemeToggle = () => {
  const [isDarkColorScheme, setIsDarkColorScheme] = useState<boolean>(false);

  return (
    <ToolbarAction
      onClick={() => {
        window.electron.ipcRenderer.invoke<SetNativeThemeArgs, SetNativeThemeResult>(
          IPC_MAIN_CHANNELS.SET_NATIVE_THEME,
          {
            theme: isDarkColorScheme ? 'light' : 'dark',
          }
        );
        setIsDarkColorScheme(!isDarkColorScheme);
      }}
      isActive={isDarkColorScheme}
      title="Device theme color toggle"
    >
      <Icon icon={isDarkColorScheme ? 'carbon:moon' : 'carbon:sun'} fontSize={15} />
      Scheme
    </ToolbarAction>
  );
};

export default ColorSchemeToggle;
