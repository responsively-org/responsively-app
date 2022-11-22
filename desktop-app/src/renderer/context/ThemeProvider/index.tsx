import cx from 'classnames';
import React from 'react';
import { useSelector } from 'react-redux';
import { selectDarkMode } from 'renderer/store/features/ui';

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const darkMode = useSelector(selectDarkMode);
  return (
    <div className={cx({ dark: darkMode })}>
      <div className="h-screen w-screen bg-slate-200 text-light-normal dark:bg-slate-800 dark:text-dark-normal">
        {children}
      </div>
    </div>
  );
};

export default ThemeProvider;
