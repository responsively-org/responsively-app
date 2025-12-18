import { Icon } from '@iconify/react';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Float } from '@headlessui-float/react';
import cx from 'classnames';
import { selectThemePreset, setThemePreset, setCustomTheme } from 'renderer/store/features/ui';
import { themePresets, type ThemePreset } from 'common/themePresets';
import CustomThemeEditor from './CustomThemeEditor';

const themeLabels: Record<ThemePreset, string> = {
  dark: 'Dark',
  light: 'Light',
  blue: 'Blue',
  green: 'Green',
  purple: 'Purple',
  orange: 'Orange',
  pink: 'Pink',
  custom: 'Custom',
};

const UITheme = () => {
  const themePreset = useSelector(selectThemePreset);
  const dispatch = useDispatch();
  const [isCustomEditorOpen, setIsCustomEditorOpen] = useState(false);

  const handleThemeChange = (preset: ThemePreset) => {
    if (preset === 'custom') {
      setIsCustomEditorOpen(true);
    } else {
      dispatch(setThemePreset(preset));
    }
  };

  const handleCustomThemeSave = (theme: { name: string; colors: any }) => {
    dispatch(setCustomTheme(theme));
    setIsCustomEditorOpen(false);
  };

  return (
    <>
      <div className="flex flex-row items-center justify-start px-4">
        <span className="w-1/2">UI Theme</span>
        <div className="flex items-center gap-2 border-l px-4 dark:border-slate-400">
          <Menu as="div" className="relative inline-block text-left">
            <Float placement="bottom-end" flip portal>
              <Menu.Button className="inline-flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-300 hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 dark:hover:bg-slate-700">
                <span>{themeLabels[themePreset]}</span>
                <Icon icon="mdi:chevron-down" />
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="z-50 mt-2 w-40 origin-top-right divide-y divide-slate-100 rounded-md bg-slate-100 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-slate-900 dark:divide-slate-700">
                  <div className="px-1 py-1">
                    {(Object.keys(themePresets) as ThemePreset[]).map((preset) => (
                      <Menu.Item key={preset}>
                        {({ active }) => (
                          <button
                            type="button"
                            className={cx(
                              'group flex w-full items-center rounded-md px-2 py-2 text-sm',
                              {
                                'bg-slate-200 dark:bg-slate-800': active,
                                'bg-slate-300 dark:bg-slate-700': preset === themePreset,
                              }
                            )}
                            onClick={() => handleThemeChange(preset)}
                          >
                            <div
                              className="mr-2 h-4 w-4 rounded"
                              style={{
                                backgroundColor:
                                  preset === 'custom'
                                    ? '#536be7'
                                    : themePresets[preset].primary,
                              }}
                            />
                            {themeLabels[preset]}
                          </button>
                        )}
                      </Menu.Item>
                    ))}
                  </div>
                </Menu.Items>
              </Transition>
            </Float>
          </Menu>
        </div>
      </div>
      {isCustomEditorOpen && (
        <CustomThemeEditor
          onSave={handleCustomThemeSave}
          onClose={() => setIsCustomEditorOpen(false)}
        />
      )}
    </>
  );
};

export default UITheme;
