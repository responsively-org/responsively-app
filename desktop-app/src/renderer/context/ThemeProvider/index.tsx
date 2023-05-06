import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectTheme } from 'renderer/store/features/ui';

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const theme = useSelector(selectTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="min-w-screen min-h-screen bg-slate-200 text-normal">
      {children}
    </div>
  );
};

export default ThemeProvider;
