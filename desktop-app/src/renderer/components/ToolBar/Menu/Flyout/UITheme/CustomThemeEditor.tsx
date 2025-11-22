import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useSelector } from 'react-redux';
import { selectCustomTheme } from 'renderer/store/features/ui';
import { themePresets, type CustomTheme, type ThemeColors } from 'common/themePresets';
import Button from 'renderer/components/Button';

interface Props {
  onSave: (theme: CustomTheme) => void;
  onClose: () => void;
}

const CustomThemeEditor = ({ onSave, onClose }: Props) => {
  const existingCustomTheme = useSelector(selectCustomTheme);
  const [themeName, setThemeName] = useState(existingCustomTheme?.name || 'My Custom Theme');
  const [colors, setColors] = useState<ThemeColors>(
    existingCustomTheme?.colors || themePresets.dark
  );

  const colorFields: Array<keyof ThemeColors> = [
    'background',
    'backgroundSecondary',
    'text',
    'textSecondary',
    'primary',
    'secondary',
    'border',
    'accent',
  ];

  const colorLabels: Record<keyof ThemeColors, string> = {
    background: 'Background',
    backgroundSecondary: 'Background Secondary',
    text: 'Text',
    textSecondary: 'Text Secondary',
    primary: 'Primary Button',
    secondary: 'Secondary Button',
    border: 'Border',
    accent: 'Accent',
  };

  const handleColorChange = (field: keyof ThemeColors, value: string) => {
    setColors((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (themeName.trim()) {
      onSave({
        name: themeName.trim(),
        colors,
      });
    }
  };

  const handleReset = () => {
    setColors(themePresets.dark);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl rounded-lg bg-slate-100 p-6 shadow-xl dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Custom Theme Editor</h2>
          <Button onClick={onClose} subtle>
            <Icon icon="mdi:close" />
          </Button>
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">Theme Name</label>
          <input
            type="text"
            value={themeName}
            onChange={(e) => setThemeName(e.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-slate-600 dark:bg-slate-800"
            placeholder="Enter theme name"
          />
        </div>

        <div className="mb-4 max-h-96 overflow-y-auto">
          <label className="mb-2 block text-sm font-medium">Colors</label>
          <div className="space-y-3">
            {colorFields.map((field) => (
              <div key={field} className="flex items-center gap-3">
                <label className="w-40 text-sm">{colorLabels[field]}</label>
                <input
                  type="color"
                  value={colors[field]}
                  onChange={(e) => handleColorChange(field, e.target.value)}
                  className="h-10 w-20 cursor-pointer rounded border border-slate-300 dark:border-slate-600"
                />
                <input
                  type="text"
                  value={colors[field]}
                  onChange={(e) => handleColorChange(field, e.target.value)}
                  className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-slate-600 dark:bg-slate-800"
                  placeholder="#000000"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button onClick={handleReset} subtle>
            Reset
          </Button>
          <Button onClick={onClose} subtle>
            Cancel
          </Button>
          <Button onClick={handleSave} isPrimary>
            Save Theme
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomThemeEditor;

