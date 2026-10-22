import {useId, useState} from 'react';

import Button from 'renderer/components/Button';
import {DEFAULT_HOMEPAGE, normalizeHomepage} from 'renderer/lib/homepage';
import {SettingsContentHeaders} from './SettingsContentHeaders';

interface Props {
  onClose: () => void;
}

export const SettingsContent = ({onClose}: Props) => {
  const id = useId();
  const [homepage, setHomepage] = useState<string>(
    window.electron.store.get('homepage') ?? DEFAULT_HOMEPAGE
  );
  const [homepageError, setHomepageError] = useState(false);
  const [screenshotSaveLocation, setScreenshotSaveLocation] = useState<string>(
    window.electron.store.get('userPreferences.screenshot.saveLocation')
  );
  const [webRequestHeaderAcceptLanguage, setWebRequestHeaderAcceptLanguage] = useState<string>(
    window.electron.store.get('userPreferences.webRequestHeaderAcceptLanguage')
  );
  const [popupBehavior, setPopupBehavior] = useState<string>(
    window.electron.store.get('userPreferences.popupBehavior') ?? 'in-preview'
  );
  const [locationError, setLocationError] = useState<boolean>(false);

  const onSave = () => {
    const normalizedHomepage = normalizeHomepage(homepage);
    if (!normalizedHomepage) {
      setHomepageError(true);
      return;
    }
    if (screenshotSaveLocation === '' || screenshotSaveLocation == null) {
      setLocationError(true);
      return;
    }

    window.electron.store.set('userPreferences.screenshot.saveLocation', screenshotSaveLocation);

    window.electron.store.set(
      'userPreferences.webRequestHeaderAcceptLanguage',
      webRequestHeaderAcceptLanguage
    );

    window.electron.store.set('userPreferences.popupBehavior', popupBehavior);
    window.electron.store.set('homepage', normalizedHomepage);

    onClose();
  };

  return (
    <div className="w-[75vw] max-w-3xl">
      <h2>Home</h2>
      <div className="my-4 flex flex-col space-y-2 text-sm">
        <label htmlFor={`${id}-homepage`} className="flex flex-col">
          Homepage
          <input
            data-testid="settings-homepage-input"
            type="text"
            id={`${id}-homepage`}
            placeholder="https://example.com"
            className="mt-2 rounded-md border border-gray-300 px-4 py-2 text-base focus-visible:outline-gray-400 dark:border-gray-500 dark:bg-slate-900"
            value={homepage}
            aria-invalid={homepageError || undefined}
            onChange={(e) => {
              setHomepage(e.target.value);
              setHomepageError(false);
            }}
          />
        </label>
        {homepageError && (
          <p role="alert" className="text-sm text-red-500">
            Please enter a valid homepage URL (http, https, or file).
          </p>
        )}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Opened by the Home button and when Responsively starts.
        </p>
      </div>

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
              aria-invalid={locationError || undefined}
              onChange={(e) => {
                setScreenshotSaveLocation(e.target.value);
                setLocationError(false);
              }}
            />
          </label>
          {locationError && (
            <p role="alert" className="text-sm text-red-500">
              Please enter a valid location.
            </p>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            The location where screenshots will be saved.
          </p>
        </div>
      </div>

      <h2>Popups</h2>
      <div className="my-4 flex flex-col space-y-2 text-sm">
        <label htmlFor={`${id}-popup-behavior`} className="flex flex-col">
          When a page opens a new window
          <select
            data-testid="settings-popup_behavior-select"
            id={`${id}-popup-behavior`}
            className="mt-2 rounded-md border border-gray-300 px-4 py-2 text-base focus-visible:outline-gray-400 dark:border-gray-500 dark:bg-slate-900"
            value={popupBehavior}
            onChange={(e) => setPopupBehavior(e.target.value)}
          >
            <option value="in-preview">Open it in the previews</option>
            <option value="external">Open it in the default browser</option>
          </select>
        </label>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Applies to links with target=&quot;_blank&quot; and window.open calls.
        </p>
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
