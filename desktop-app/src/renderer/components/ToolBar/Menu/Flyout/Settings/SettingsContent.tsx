import { useId, useState } from 'react';

import Button from 'renderer/components/Button';

interface Props {
  onClose: () => void;
}

export const SettingsContent = ({ onClose }: Props) => {
  const [screenshotSaveLocationId, onlyVisiblePartsId] = [useId(), useId()];
  const [screenshotSaveLocation, setScreenshotSaveLocation] = useState<string>(
    window.electron.store.get('userPreferences.screenshot.saveLocation')
  );
  const [onlyVisibleParts, setOnlyVisibleParts] = useState<boolean>(
    window.electron.store.get('userPreferences.screenshot.onlyVisibleParts')
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
      'userPreferences.screenshot.onlyVisibleParts',
      onlyVisibleParts
    );
    onClose();
  };

  return (
    <div className="w-[75vw]">
      <h2>Screenshots</h2>
      <div className="my-4 flex flex-col space-y-4 text-sm">
        <div className="flex flex-col space-y-2">
          <label htmlFor={screenshotSaveLocationId} className="flex flex-col">
            Location
            <input
              type="text"
              id={screenshotSaveLocationId}
              className="rounded-md border border-gray-300 p-2"
              value={screenshotSaveLocation}
              onChange={(e) => setScreenshotSaveLocation(e.target.value)}
            />
          </label>
          <p className="text-sm text-gray-500">
            The location where screenshots will be saved.
          </p>
        </div>
      </div>

      <div className="my-4 flex flex-col space-y-4 text-sm">
        <div className="flex flex-col space-y-2">
          <label htmlFor={onlyVisiblePartsId} className="flex space-x-2">
            <input
              type="checkbox"
              id={onlyVisiblePartsId}
              className="rounded-md border border-gray-300 p-2"
              checked={onlyVisibleParts}
              onChange={(e) => setOnlyVisibleParts(e.target.checked)}
            />
            <span>Only Visible Parts</span>
          </label>
          <p className="text-sm text-gray-500">
            When disabled, the screenshot will have a minimum height of the
            device height
          </p>
        </div>
      </div>

      <Button onClick={onSave} isPrimary isTextButton>
        Save
      </Button>
    </div>
  );
};
