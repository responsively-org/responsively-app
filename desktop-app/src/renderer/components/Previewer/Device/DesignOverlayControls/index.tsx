import { Icon } from '@iconify/react';
import type { Device } from 'common/deviceList';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button from 'renderer/components/Button';
import { FileUploader } from 'renderer/components/FileUploader';
import Modal from 'renderer/components/Modal';
import type { RootState } from 'renderer/store';
import {
  DesignOverlayPosition,
  removeDesignOverlay,
  selectDesignOverlay,
  setDesignOverlay,
} from 'renderer/store/features/design-overlay';

interface Props {
  device: Device;
  isOpen: boolean;
  onClose: () => void;
}

const DesignOverlayControls = ({ device, isOpen, onClose }: Props) => {
  const dispatch = useDispatch();
  const resolution = `${device.width}x${device.height}`;
  const existingOverlay = useSelector((state: RootState) =>
    selectDesignOverlay(state)(resolution)
  );

  const [image, setImage] = useState<string>(existingOverlay?.image || '');
  const [fileName, setFileName] = useState<string>(
    existingOverlay?.fileName || ''
  );
  const [opacity, setOpacity] = useState<number>(
    existingOverlay?.opacity ?? 50
  );
  const [position, setPosition] = useState<DesignOverlayPosition>(
    existingOverlay?.position || 'overlay'
  );
  const [enabled, setEnabled] = useState<boolean>(
    existingOverlay?.enabled ?? false
  );

  useEffect(() => {
    if (existingOverlay) {
      setImage(existingOverlay.image);
      setFileName(existingOverlay.fileName || '');
      setOpacity(existingOverlay.opacity);
      setPosition(existingOverlay.position);
      setEnabled(existingOverlay.enabled);
    }
  }, [existingOverlay]);

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      // eslint-disable-next-line no-console
      console.error('File is not an image');
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImage(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!image) {
      return;
    }

    dispatch(
      setDesignOverlay({
        resolution,
        overlayState: {
          image,
          opacity,
          position,
          enabled: true,
          fileName,
        },
      })
    );
    onClose();
  };

  const handleRemove = () => {
    dispatch(removeDesignOverlay({ resolution }));
    setImage('');
    setFileName('');
    setOpacity(50);
    setPosition('overlay');
    setEnabled(false);
    onClose();
  };

  const handleToggleEnabled = () => {
    if (!image) {
      return;
    }

    const newEnabled = !enabled;
    setEnabled(newEnabled);
    dispatch(
      setDesignOverlay({
        resolution,
        overlayState: {
          image,
          opacity,
          position,
          enabled: newEnabled,
          fileName,
        },
      })
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Design Overlay Settings">
      <div className="flex max-w-[420px] flex-col gap-4">
        {/* File Uploader */}
        <div className="flex flex-col gap-2">
          <div className="text-sm font-medium">Upload Design Image</div>
          <FileUploader
            handleFileUpload={handleFileUpload}
            acceptedFileTypes="image/*"
            showFileName
            initialFileName={fileName}
          />
        </div>

        {image && (
          <>
            {/* Opacity slider */}
            <div className="flex flex-col gap-2">
              <div className="text-sm font-medium">Opacity: {opacity}</div>
              <input
                type="range"
                min="0"
                max="100"
                value={opacity}
                onChange={(e) => setOpacity(parseInt(e.target.value, 10))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-300 dark:bg-slate-600"
              />
            </div>

            {/* Position Selector */}
            <div className="flex flex-col gap-2">
              <div className="text-sm font-medium">Position</div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setPosition('overlay')}
                  isActive={position === 'overlay'}
                  className="flex-1"
                >
                  <Icon icon="lucide:layers" className="mr-1" />
                  Overlay
                </Button>
                <Button
                  onClick={() => setPosition('side')}
                  isActive={position === 'side'}
                  className="flex-1"
                >
                  <Icon icon="lucide:layout-grid" className="mr-1" />
                  Side-by-side
                </Button>
              </div>
            </div>

            {/* Enable Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="enabled"
                checked={enabled}
                onChange={handleToggleEnabled}
                className="h-4 w-4 cursor-pointer rounded border-slate-400"
              />
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label className="text-sm font-medium" htmlFor="enabled">
                Enable overlay
              </label>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          {image && (
            <Button onClick={handleRemove} className="px-4">
              <Icon icon="lucide:trash-2" className="mr-1" />
              Remove
            </Button>
          )}
          <Button onClick={onClose} className="px-4">
            Cancel
          </Button>
          {image && (
            <Button onClick={handleSave} isPrimary className="px-4">
              Save
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default DesignOverlayControls;
