import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectDarkMode } from 'renderer/store/features/ui';

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const darkMode = useSelector(selectDarkMode);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="h-screen w-screen bg-slate-200 text-light-normal dark:bg-slate-800 dark:text-dark-normal">
      {children}
    </div>
  );
};

export default ThemeProvider;
