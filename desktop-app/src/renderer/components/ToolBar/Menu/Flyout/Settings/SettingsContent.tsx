import { useId, useState } from 'react';

import Button from 'renderer/components/Button';

interface Props {
  onClose: () => void;
}

export const SettingsContent = ({ onClose }: Props) => {
  const id = useId();
  const [screenshotSaveLocation, setScreenshotSaveLocation] = useState<string>(
    window.electron.store.get('screenshot.saveLocation')
  );

  const onSave = () => {
    if (screenshotSaveLocation === '' || screenshotSaveLocation == null) {
      // eslint-disable-next-line no-alert
      alert('Please enter a valid location.');
      return;
    }

    window.electron.store.set(
      'screenshot.saveLocation',
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

      <Button onClick={onSave} isPrimary isTextButton>
        Save
      </Button>
    </div>
  );
};
