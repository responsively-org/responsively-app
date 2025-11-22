import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectDarkMode, selectThemePreset, selectCustomTheme } from 'renderer/store/features/ui';
import { themePresets, type ThemeColors } from 'common/themePresets';

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const darkMode = useSelector(selectDarkMode);
  const themePreset = useSelector(selectThemePreset);
  const customTheme = useSelector(selectCustomTheme);

  useEffect(() => {
    const body = document.querySelector('body');
    'bg-slate-200 text-light-normal dark:bg-slate-800 dark:text-dark-normal'
      .split(' ')
      .forEach((className) => {
        body?.classList.add(className);
      });
    
    // Apply theme colors via CSS variables
    const root = document.documentElement;
    const themeColors: ThemeColors = themePreset === 'custom' && customTheme 
      ? customTheme.colors 
      : themePresets[themePreset];

    root.style.setProperty('--theme-bg', themeColors.background);
    root.style.setProperty('--theme-bg-secondary', themeColors.backgroundSecondary);
    root.style.setProperty('--theme-text', themeColors.text);
    root.style.setProperty('--theme-text-secondary', themeColors.textSecondary);
    root.style.setProperty('--theme-primary', themeColors.primary);
    root.style.setProperty('--theme-secondary', themeColors.secondary);
    root.style.setProperty('--theme-border', themeColors.border);
    root.style.setProperty('--theme-accent', themeColors.accent);

    // Apply theme colors directly to body for immediate effect
    if (body) {
      body.style.backgroundColor = themeColors.background;
      body.style.color = themeColors.text;
    }

    // Apply dark mode class for backward compatibility
    // Only apply dark class for actual dark themes, not for custom themes
    if (themePreset === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (themePreset === 'custom' && customTheme) {
      // For custom themes, determine based on background brightness
      const bgColor = customTheme.colors.background;
      const isDark = bgColor && parseInt(bgColor.replace('#', ''), 16) < 0x808080;
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      // For preset themes, add dark class for all except light
      document.documentElement.classList.add('dark');
    }
  }, [darkMode, themePreset, customTheme]);

  return <div className="min-w-screen min-h-screen">{children}</div>;
};

export default ThemeProvider;
