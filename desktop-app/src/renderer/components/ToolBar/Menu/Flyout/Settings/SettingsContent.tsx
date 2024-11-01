import { useId, useState } from 'react';

import Button from 'renderer/components/Button';
import Toggle from 'renderer/components/Toggle';
import { SettingsContentHeaders } from './SettingsContentHeaders';

interface Props {
  onClose: () => void;
}

export const SettingsContent = ({ onClose }: Props) => {
  const id = useId();
  const [screenshotSaveLocation, setScreenshotSaveLocation] = useState<string>(
    window.electron.store.get('userPreferences.screenshot.saveLocation')
  );
  const [enableCustomTitlebar, setEnableCustomTitlebar] = useState<boolean>(
    window.electron.store.get('userPreferences.customTitlebar')
  );

  const [webRequestHeaderAcceptLanguage, setWebRequestHeaderAcceptLanguage] =
    useState<string>(
      window.electron.store.get(
        'userPreferences.webRequestHeaderAcceptLanguage'
      )
    );

  const onSave = () => {
    if (screenshotSaveLocation === '' || screenshotSaveLocation == null) {
      // eslint-disable-next-line no-alert
      alert('Please enter a valid location.');
      return;
    }

    window.electron.store.set(
      'userPreferences.screenshot.saveLocation',
      screenshotSaveLocation
    );
    window.electron.store.set(
      'userPreferences.customTitlebar',
      enableCustomTitlebar
    );

    window.electron.store.set(
      'userPreferences.webRequestHeaderAcceptLanguage',
      webRequestHeaderAcceptLanguage
    );

    onClose();
  };

  return (
    <div className="w-[75vw] max-w-3xl">
      <h2>Screenshots</h2>
      <div className="my-4 flex flex-col space-y-4 text-sm">
        <div className="flex flex-col space-y-2">
          <label htmlFor={id} className="flex flex-col">
            Location
            <input
              data-testid="settings-screenshot_location-input"
              type="text"
              id={id}
              className="mt-2 rounded-md border border-gray-300 px-4 py-2 text-base focus-visible:outline-gray-400 dark:border-gray-500 dark:bg-slate-900"
              value={screenshotSaveLocation}
              onChange={(e) => setScreenshotSaveLocation(e.target.value)}
            />
          </label>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            The location where screenshots will be saved.
          </p>
        </div>
      </div>

      <SettingsContentHeaders
        acceptLanguage={webRequestHeaderAcceptLanguage}
        setAcceptLanguage={setWebRequestHeaderAcceptLanguage}
      />

      {(navigator as any)?.userAgentData?.platform === 'Windows' && (
        <>
          <h2>Preferences</h2>
          <div className="my-4 flex flex-col space-y-4 text-sm">
            <div className="flex w-1/2 items-center gap-5 space-y-2">
              <div>
                <p className="text-sm">Menus in Titlebar</p>
                <p className="text-[10px] italic leading-snug tracking-wide text-blue-400">
                  Restart Required
                </p>
              </div>
              <Toggle
                isOn={enableCustomTitlebar}
                onChange={(value) => {
                  setEnableCustomTitlebar(value.target.checked);
                }}
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Makes the titlebar compact by including the Menu inside it.
            </p>
          </div>
        </>
      )}

      <Button
        data-testid="settings-save-button"
        className="mt-6 px-5 py-1"
        onClick={onSave}
        isPrimary
        isTextButton
      >
        Save
      </Button>
    </div>
  );
};
