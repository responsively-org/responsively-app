import { useId, useState } from 'react';
import { useSelector } from 'react-redux';

import Button from 'renderer/components/Button';
import { selectDarkMode } from 'renderer/store/features/ui';

interface Props {
  onClose: () => void;
}

export const SettingsContent = ({ onClose }: Props) => {
  const id = useId();
  const [screenshotSaveLocation, setScreenshotSaveLocation] = useState<string>(
    window.electron.store.get('userPreferences.screenshot.saveLocation')
  );
  const darkMode = useSelector(selectDarkMode);

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
    onClose();
  };

  return (
    <div className="w-[75vw]">
      <h2>Screenshots</h2>
      <div className="my-4 flex flex-col space-y-4 text-sm">
        <div className="flex flex-col space-y-2">
          <label htmlFor={id} className="flex flex-col">
            Location
            <input
              type="text"
              id={id}
              className={`rounded-md border border-gray-300 p-2 ${
                darkMode ? 'bg-slate-700' : 'bg-white'
              }`}
              value={screenshotSaveLocation}
              onChange={(e) => setScreenshotSaveLocation(e.target.value)}
            />
          </label>
          <p className="text-sm text-gray-500">
            The location where screenshots will be saved.
          </p>
        </div>
      </div>

      <Button onClick={onSave} isPrimary isTextButton>
        Save
      </Button>
    </div>
  );
};
