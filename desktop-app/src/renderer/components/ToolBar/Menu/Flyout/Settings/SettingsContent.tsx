import {useId, useState} from 'react';

import Button from 'renderer/components/Button';
import Toggle from 'renderer/components/Toggle';
import {SettingsContentHeaders} from './SettingsContentHeaders';

interface Props {
  onClose: () => void;
}

export const SettingsContent = ({onClose}: Props) => {
  const id = useId();
  const hideMobileScrollbarsId = useId();
  const [screenshotSaveLocation, setScreenshotSaveLocation] = useState<string>(
    window.electron.store.get('userPreferences.screenshot.saveLocation')
  );
  const [webRequestHeaderAcceptLanguage, setWebRequestHeaderAcceptLanguage] = useState<string>(
    window.electron.store.get('userPreferences.webRequestHeaderAcceptLanguage')
  );
  const [hideMobileScrollbars, setHideMobileScrollbars] = useState<boolean>(
    window.electron.store.get('userPreferences.hideMobileScrollbars')
  );

  const onSave = () => {
    if (screenshotSaveLocation === '' || screenshotSaveLocation == null) {
      // eslint-disable-next-line no-alert
      alert('Please enter a valid location.');
      return;
    }

    window.electron.store.set('userPreferences.screenshot.saveLocation', screenshotSaveLocation);

    window.electron.store.set(
      'userPreferences.webRequestHeaderAcceptLanguage',
      webRequestHeaderAcceptLanguage
    );

    window.electron.store.set('userPreferences.hideMobileScrollbars', hideMobileScrollbars);

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

      <h2>Mobile Preview</h2>
      <div className="my-4 flex flex-col space-y-4 text-sm">
        <div className="flex items-center justify-between">
          <label htmlFor={hideMobileScrollbarsId} className="flex flex-col">
            Hide scrollbars on mobile devices
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Mimics the scrollbar behaviour of real mobile devices. Disable to always show
              scrollbars.
            </span>
          </label>
          <Toggle
            id={hideMobileScrollbarsId}
            data-testid="settings-hide_mobile_scrollbars-toggle"
            isOn={hideMobileScrollbars}
            onChange={(e) => setHideMobileScrollbars(e.target.checked)}
          />
        </div>
      </div>

      <SettingsContentHeaders
        acceptLanguage={webRequestHeaderAcceptLanguage}
        setAcceptLanguage={setWebRequestHeaderAcceptLanguage}
      />

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
