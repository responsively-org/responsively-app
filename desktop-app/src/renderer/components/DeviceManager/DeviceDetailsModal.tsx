import { Device } from 'common/deviceList';
import { v4 as uuidv4 } from 'uuid';
import { useEffect, useState } from 'react';
import Button from '../Button';
import Input from '../Input';
import Modal from '../Modal';
import Select from '../Select';

interface Props {
  device?: Device;
  onSaveDevice: (device: Device, isNew: boolean) => Promise<void>;
  onRemoveDevice: (device: Device) => void;
  existingDevices: Device[];
  isCustom: boolean;
  isOpen: boolean;
  onClose: () => void;
}

const DeviceDetailsModal = ({
  onSaveDevice,
  onRemoveDevice,
  existingDevices,
  device,
  isOpen,
  onClose,
}: Props) => {
  const [name, setName] = useState<string>(device?.name ?? '');
  const [width, setWidth] = useState<number>(device?.width ?? 400);
  const [height, setHeight] = useState<number>(device?.height ?? 600);
  const [userAgent, setUserAgent] = useState<string>(device?.userAgent ?? '');
  const [type, setType] = useState<string>(device?.type ?? 'phone');
  const [dpr, setDpr] = useState<number>(device?.dpr ?? 1);
  const [isTouchCapable, setIsTouchCapable] = useState<boolean>(
    device?.isTouchCapable ?? true
  );
  const [isMobileCapable, setIsMobileCapable] = useState<boolean>(
    device?.isMobileCapable ?? true
  );

  useEffect(() => {
    if (device) {
      setName(device.name);
      setWidth(device.width);
      setHeight(device.height);
      setUserAgent(device.userAgent);
      setType(device.type);
      setDpr(device.dpr);
      setIsTouchCapable(device.isTouchCapable);
      setIsMobileCapable(device.isMobileCapable);
    } else {
      setName('');
      setWidth(400);
      setHeight(600);
      setUserAgent('');
      setType('phone');
      setDpr(1);
      setIsTouchCapable(true);
      setIsMobileCapable(true);
    }
  }, [device]);

  useEffect(() => {
    const desktopUA =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36';
    const phoneUA =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1';
    if (
      (type === 'phone' || type === 'tablet') &&
      (userAgent === desktopUA || userAgent === '')
    ) {
      setUserAgent(phoneUA);
      setIsMobileCapable(true);
      setIsTouchCapable(true);
    } else if (
      type === 'notebook' &&
      (userAgent === phoneUA || userAgent === '')
    ) {
      setUserAgent(desktopUA);
      setIsMobileCapable(false);
      setIsTouchCapable(false);
    }
  }, [type, userAgent]);

  const isNew = !device;
  const isCustom = device != null ? device.isCustom ?? false : true;

  const handleAddDevice = async (): Promise<void> => {
    const existingDevice = existingDevices.find((d) => d.name === name);
    const doesDeviceExist =
      existingDevice != null && (isNew || existingDevice.id !== device.id);

    if (doesDeviceExist) {
      // eslint-disable-next-line no-alert
      return alert(
        'Device With the name already exists, try with a different name'
      );
    }
    const capabilities = [];
    if (isTouchCapable) {
      capabilities.push('touch');
    }
    if (isMobileCapable) {
      capabilities.push('mobile');
    }
    await onSaveDevice(
      {
        id: device?.id ?? uuidv4(),
        name,
        width,
        height,
        userAgent,
        type,
        dpr,
        isTouchCapable,
        isMobileCapable,
        capabilities,
        isCustom,
      },
      isNew
    );

    return onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={isNew ? 'Add Custom Device' : 'Device Details'}
      >
        <div className="flex flex-col gap-4">
          <div className="flex w-[420px] flex-col gap-2">
            <Input
              label="Device Name"
              type="text"
              placeholder="My Mobile Device"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isCustom}
            />
            <Input
              label="Device Width"
              type="number"
              placeholder="1200"
              min="100"
              value={width}
              onChange={(e) => setWidth(parseInt(e.target.value, 10))}
              disabled={!isCustom}
            />
            <Input
              label="Device Height"
              type="number"
              placeholder="800"
              min="100"
              value={height}
              onChange={(e) => setHeight(parseInt(e.target.value, 10))}
              disabled={!isCustom}
            />
            <Input
              label="Device DPR"
              type="number"
              min="1"
              step="0.1"
              value={dpr}
              onChange={(e) => setDpr(parseFloat(e.target.value))}
              disabled={!isCustom}
            />
            <Select
              label="Device type"
              onChange={(e) => setType(e.target.value)}
              value={type}
              disabled={!isCustom}
            >
              <option value="notebook">Desktop</option>
              <option value="phone">Phone</option>
              <option value="tablet">Tablet</option>
            </Select>
            <Input
              label="User Agent String"
              type="text"
              placeholder="User agent string for this device's network requests"
              value={userAgent}
              onChange={(e) => setUserAgent(e.target.value)}
              disabled={!isCustom}
            />
            <Input
              label="Touch Capable"
              type="checkbox"
              checked={isTouchCapable}
              onChange={(e) => setIsTouchCapable(e.target.checked)}
              disabled={!isCustom}
            />
            <Input
              label="Mobile Capable (Rotatable)"
              type="checkbox"
              checked={isMobileCapable}
              onChange={(e) => setIsMobileCapable(e.target.checked)}
              disabled={!isCustom}
            />
          </div>
          {isCustom ? (
            <div className="flex flex-row justify-between">
              {device != null ? (
                <Button
                  className="bg-red-500 px-2 text-white hover:bg-red-700 dark:hover:bg-red-600"
                  onClick={async () => {
                    await onRemoveDevice(device);
                    onClose();
                  }}
                >
                  Delete
                </Button>
              ) : (
                <div />
              )}

              <div className="flex flex-row justify-end gap-2">
                <Button className="px-2" onClick={onClose}>
                  Cancel
                </Button>
                <Button className="px-2" onClick={handleAddDevice} isActive>
                  {isNew ? 'Add' : 'Save'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-row justify-end gap-2">
              <Button className="px-2" onClick={onClose}>
                Close
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default DeviceDetailsModal;
