import {Icon} from '@iconify/react';
import cx from 'classnames';
import {Device} from 'common/deviceList';
import {useEffect, useId, useState} from 'react';
import {v4 as uuidv4} from 'uuid';

const DESKTOP_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36';
const PHONE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1';

const DPR_OPTIONS = [1, 1.5, 2, 2.75, 3];
const TYPE_OPTIONS: Array<{id: string; label: string; icon: string}> = [
  {id: 'phone', label: 'Phone', icon: 'lucide:smartphone'},
  {id: 'tablet', label: 'Tablet', icon: 'lucide:tablet'},
  {id: 'notebook', label: 'Laptop', icon: 'lucide:laptop'},
];

const MIN_SIZE = 50;
const MAX_SIZE = 6000;
const PREVIEW_W = 170;
const PREVIEW_H = 116;

const SectionLabel = ({children, htmlFor}: {children: string; htmlFor?: string}) => (
  <label htmlFor={htmlFor} className="text-[10.5px] font-bold tracking-[0.08em] text-muted">
    {children}
  </label>
);

const fieldClass =
  'h-8 w-full box-border rounded-[7px] border border-line-soft bg-input px-[10px] text-[13px] text-fg outline-none focus-visible:border-accent';

interface Props {
  /** Undefined means "create"; a device means "edit". */
  device?: Device;
  existingDevices: Device[];
  activeSuiteName: string;
  onSave: (device: Device, isNew: boolean, addToSuite: boolean) => Promise<void>;
  onRemove: (device: Device) => void;
  onClose: () => void;
}

/**
 * The custom-device form as an inline panel beside the grid (Hybrid Studio
 * "Device Manager" design), replacing the old modal.
 */
const DeviceForm = ({
  device,
  existingDevices,
  activeSuiteName,
  onSave,
  onRemove,
  onClose,
}: Props) => {
  const id = useId();
  const isNew = device === undefined;

  const [name, setName] = useState<string>(device?.name ?? '');
  const [width, setWidth] = useState<string>(String(device?.width ?? 400));
  const [height, setHeight] = useState<string>(String(device?.height ?? 600));
  const [dpr, setDpr] = useState<number>(device?.dpr ?? 1);
  const [type, setType] = useState<string>(device?.type ?? 'phone');
  const [userAgent, setUserAgent] = useState<string>(device?.userAgent ?? '');
  const [isTouchCapable, setIsTouchCapable] = useState<boolean>(device?.isTouchCapable ?? true);
  const [isMobileCapable, setIsMobileCapable] = useState<boolean>(device?.isMobileCapable ?? true);
  const [addToSuite, setAddToSuite] = useState<boolean>(true);
  const [nameError, setNameError] = useState<string | null>(null);

  // Picking a form factor fills in a matching UA and capabilities, but never
  // overwrites a UA the user typed.
  useEffect(() => {
    if ((type === 'phone' || type === 'tablet') && (userAgent === DESKTOP_UA || userAgent === '')) {
      setUserAgent(PHONE_UA);
      setIsMobileCapable(true);
      setIsTouchCapable(true);
    } else if (type === 'notebook' && (userAgent === PHONE_UA || userAgent === '')) {
      setUserAgent(DESKTOP_UA);
      setIsMobileCapable(false);
      setIsTouchCapable(false);
    }
  }, [type, userAgent]);

  const widthNum = parseInt(width, 10);
  const heightNum = parseInt(height, 10);
  const sizeValid =
    widthNum >= MIN_SIZE && widthNum <= MAX_SIZE && heightNum >= MIN_SIZE && heightNum <= MAX_SIZE;
  const canSave = name.trim().length > 0 && sizeValid;
  const previewScale = sizeValid ? Math.min(PREVIEW_W / widthNum, PREVIEW_H / heightNum, 1) : 0;

  const save = async () => {
    const clash = existingDevices.find((d) => d.name === name.trim());
    if (clash != null && (isNew || clash.id !== device.id)) {
      setNameError('A device with this name already exists, try a different name.');
      return;
    }
    const capabilities: string[] = [];
    if (isTouchCapable) capabilities.push('touch');
    if (isMobileCapable) capabilities.push('mobile');

    await onSave(
      {
        id: device?.id ?? uuidv4(),
        name: name.trim(),
        width: widthNum,
        height: heightNum,
        userAgent,
        type,
        dpr,
        isTouchCapable,
        isMobileCapable,
        capabilities,
        isCustom: true,
      },
      isNew,
      addToSuite
    );
    onClose();
  };

  return (
    <div
      data-testid="device-form"
      className="box-border flex w-[312px] shrink-0 flex-col gap-3 overflow-y-auto border-l border-line-soft bg-panel p-4"
    >
      <div className="flex items-center">
        <span className="text-sm font-bold">
          {isNew ? 'New custom device' : 'Edit custom device'}
        </span>
        <span className="flex-1" />
        <button
          type="button"
          title="Close form"
          onClick={onClose}
          className="flex h-[26px] w-[26px] items-center justify-center rounded-[7px] text-[15px] text-muted transition-colors hover:bg-hover hover:text-fg focus:outline-none"
        >
          <span className="pointer-events-none contents">
            <Icon icon="ic:round-close" />
          </span>
        </button>
      </div>

      <div className="flex flex-col gap-[6px]">
        <SectionLabel htmlFor={`${id}-name`}>NAME</SectionLabel>
        <input
          id={`${id}-name`}
          aria-label="Device Name"
          className={cx(fieldClass, {'border-red-500': nameError != null})}
          placeholder="e.g. Kiosk 1080p"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setNameError(null);
          }}
        />
        {nameError != null ? (
          <p role="alert" className="text-xs text-red-500">
            {nameError}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-[6px]">
        <SectionLabel>SIZE (CSS PX)</SectionLabel>
        <div className="flex items-center gap-2">
          <input
            aria-label="Device Width"
            className={cx(fieldClass, 'font-mono')}
            value={width}
            onChange={(e) => setWidth(e.target.value)}
          />
          <span className="text-xs text-muted">×</span>
          <input
            aria-label="Device Height"
            className={cx(fieldClass, 'font-mono')}
            value={height}
            onChange={(e) => setHeight(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-[6px]">
        <SectionLabel>PIXEL RATIO</SectionLabel>
        <div className="flex gap-1">
          {DPR_OPTIONS.map((value) => (
            <button
              key={value}
              type="button"
              aria-label={`Device DPR ${value}x`}
              aria-pressed={dpr === value}
              onClick={() => setDpr(value)}
              className={cx(
                'h-7 rounded-[7px] border px-[10px] font-mono text-xs transition-colors focus:outline-none',
                dpr === value
                  ? 'border-accent bg-accent-soft text-accent'
                  : 'border-line text-muted hover:bg-hover'
              )}
            >
              {value}x
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-[6px]">
        <SectionLabel>TYPE</SectionLabel>
        <div className="flex gap-1">
          {TYPE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-label={`Device type ${option.label}`}
              aria-pressed={type === option.id}
              onClick={() => setType(option.id)}
              className={cx(
                'flex h-[30px] items-center gap-[6px] rounded-[7px] border px-[11px] text-xs transition-colors focus:outline-none',
                type === option.id
                  ? 'border-accent bg-accent-soft text-accent'
                  : 'border-line text-muted hover:bg-hover'
              )}
            >
              <span className="pointer-events-none contents">
                <Icon icon={option.icon} fontSize={14} />
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-[6px]">
        <SectionLabel>CAPABILITIES</SectionLabel>
        {[
          {
            label: 'Touch screen',
            ariaLabel: 'Touch Capable',
            checked: isTouchCapable,
            toggle: () => setIsTouchCapable(!isTouchCapable),
          },
          {
            label: 'Mobile user-agent',
            ariaLabel: 'Mobile Capable (Rotatable)',
            checked: isMobileCapable,
            toggle: () => setIsMobileCapable(!isMobileCapable),
          },
        ].map((item) => (
          <button
            key={item.ariaLabel}
            type="button"
            aria-label={item.ariaLabel}
            aria-pressed={item.checked}
            onClick={item.toggle}
            className="flex items-center gap-[9px] py-1 text-[13px] text-fg focus:outline-none"
          >
            <span className="pointer-events-none contents">
              <span
                className={cx(
                  'flex h-4 w-4 items-center justify-center rounded-[5px] border-[1.5px]',
                  item.checked ? 'border-accent bg-accent' : 'border-line'
                )}
              >
                <Icon
                  icon="ic:round-check"
                  fontSize={12}
                  className={cx('text-on-accent', {'opacity-0': !item.checked})}
                />
              </span>
              {item.label}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-[6px]">
        <SectionLabel htmlFor={`${id}-ua`}>USER AGENT (OPTIONAL)</SectionLabel>
        <input
          id={`${id}-ua`}
          aria-label="User Agent String"
          className={cx(fieldClass, 'text-xs')}
          placeholder="Default — Chrome UA"
          value={userAgent}
          onChange={(e) => setUserAgent(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-[6px]">
        <SectionLabel>PREVIEW</SectionLabel>
        <div className="flex h-[140px] items-center justify-center rounded-lg border border-line-soft bg-input">
          <div
            data-testid="device-form-preview"
            style={
              sizeValid
                ? {width: widthNum * previewScale, height: heightNum * previewScale}
                : {width: 120, height: 84}
            }
            className={cx(
              'flex items-center justify-center rounded font-mono text-[10px] text-muted',
              sizeValid
                ? 'border-[1.5px] border-accent bg-accent-soft'
                : 'border-[1.5px] border-dashed border-line'
            )}
          >
            {sizeValid ? `${widthNum} × ${heightNum}` : 'enter size'}
          </div>
        </div>
      </div>

      {isNew ? (
        <div className="flex items-center justify-between">
          <span className="text-[13px]">Add to “{activeSuiteName}”</span>
          <button
            type="button"
            aria-label="Add to active suite"
            aria-pressed={addToSuite}
            onClick={() => setAddToSuite(!addToSuite)}
            className="relative inline-flex items-center focus:outline-none"
          >
            <span
              className={cx(
                'block h-[18px] w-8 rounded-full transition-colors',
                addToSuite ? 'bg-accent' : 'bg-line'
              )}
            />
            <span
              className={cx(
                'absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white transition-[left]',
                addToSuite ? 'left-4' : 'left-[2px]'
              )}
            />
          </button>
        </div>
      ) : null}

      {!isNew && device !== undefined ? (
        <button
          type="button"
          onClick={async () => {
            await onRemove(device);
            onClose();
          }}
          className="flex items-center gap-2 py-[2px] text-[12.5px] text-red-500 focus:outline-none"
        >
          <span className="pointer-events-none contents">
            <Icon icon="carbon:trash-can" fontSize={14} />
            Delete
          </span>
        </button>
      ) : null}

      <div className="mt-[2px] flex gap-2">
        <button
          type="button"
          onClick={onClose}
          className="h-[34px] flex-1 rounded-lg border border-line text-[12.5px] text-fg transition-colors hover:bg-hover focus:outline-none"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!canSave}
          onClick={save}
          className={cx(
            'h-[34px] flex-1 rounded-lg text-[12.5px] font-bold text-on-accent focus:outline-none',
            canSave ? 'bg-accent hover:brightness-110' : 'cursor-not-allowed bg-line'
          )}
        >
          {isNew ? 'Add' : 'Save'}
        </button>
      </div>
    </div>
  );
};

export default DeviceForm;
