import cx from 'classnames';
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'renderer/store';

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const darkMode = useSelector((state: RootState) => state.ui.darkMode);
  return (
    <div className={cx({ dark: darkMode })}>
      <div className="h-screen w-screen bg-slate-200 text-light-normal dark:bg-slate-800 dark:text-dark-normal">
        {children}
      </div>
    </div>
  );
};

export default ThemeProvider;
