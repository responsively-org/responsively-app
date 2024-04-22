import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectDarkMode } from 'renderer/store/features/ui';

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const darkMode = useSelector(selectDarkMode);

  useEffect(() => {
    const body = document.querySelector('body');
    'bg-slate-200 text-light-normal dark:bg-slate-800 dark:text-dark-normal'
      .split(' ')
      .forEach((className) => {
        body?.classList.add(className);
      });
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return <div className="min-w-screen min-h-screen">{children}</div>;
};

export default ThemeProvider;
