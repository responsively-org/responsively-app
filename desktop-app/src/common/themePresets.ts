export type ThemePreset = 'dark' | 'light' | 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'custom';

export interface ThemeColors {
  background: string;
  backgroundSecondary: string;
  text: string;
  textSecondary: string;
  primary: string;
  secondary: string;
  border: string;
  accent: string;
}

export interface CustomTheme {
  name: string;
  colors: ThemeColors;
}

export const themePresets: Record<ThemePreset, ThemeColors> = {
  dark: {
    background: '#1e1e1e',
    backgroundSecondary: '#2f2f33',
    text: '#f8f8f8',
    textSecondary: '#868686',
    primary: '#536be7',
    secondary: '#424242',
    border: '#383838',
    accent: '#7587ec',
  },
  light: {
    background: '#f8f8f8',
    backgroundSecondary: '#ffffff',
    text: '#363636',
    textSecondary: '#606060',
    primary: '#2e47d0',
    secondary: '#424242',
    border: '#e7e7e7',
    accent: '#3450db',
  },
  blue: {
    background: '#0f172a',
    backgroundSecondary: '#1e293b',
    text: '#e2e8f0',
    textSecondary: '#94a3b8',
    primary: '#3b82f6',
    secondary: '#1e40af',
    border: '#334155',
    accent: '#60a5fa',
  },
  green: {
    background: '#0a1f0a',
    backgroundSecondary: '#1a2e1a',
    text: '#d1fae5',
    textSecondary: '#9ca3af',
    primary: '#10b981',
    secondary: '#059669',
    border: '#2d4a2d',
    accent: '#34d399',
  },
  purple: {
    background: '#1a0a2e',
    backgroundSecondary: '#2d1b3d',
    text: '#e9d5ff',
    textSecondary: '#c084fc',
    primary: '#8b5cf6',
    secondary: '#7c3aed',
    border: '#3d2a4d',
    accent: '#a78bfa',
  },
  orange: {
    background: '#1f0f05',
    backgroundSecondary: '#2d1a0a',
    text: '#fed7aa',
    textSecondary: '#fdba74',
    primary: '#f97316',
    secondary: '#ea580c',
    border: '#3d2a1a',
    accent: '#fb923c',
  },
  pink: {
    background: '#1f0a14',
    backgroundSecondary: '#2d1a21',
    text: '#fce7f3',
    textSecondary: '#f9a8d4',
    primary: '#ec4899',
    secondary: '#db2777',
    border: '#3d2a2f',
    accent: '#f472b6',
  },
  custom: {
    background: '#1e1e1e',
    backgroundSecondary: '#2f2f33',
    text: '#f8f8f8',
    textSecondary: '#868686',
    primary: '#536be7',
    secondary: '#424242',
    border: '#383838',
    accent: '#7587ec',
  },
};

