import cx from 'classnames';
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'renderer/store';

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const darkMode = useSelector((state: RootState) => state.ui.darkMode);
  return (
    <div className={cx({ dark: darkMode })}>
      <div className="bg-slate-200 text-gray-700 dark:bg-slate-800 dark:text-gray-300">
        {children}
      </div>
    </div>
  );
};

export default ThemeProvider;
