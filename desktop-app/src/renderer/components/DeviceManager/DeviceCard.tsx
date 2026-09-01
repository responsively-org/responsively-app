import {Icon} from '@iconify/react';
import cx from 'classnames';
import {Device} from 'common/deviceList';

const TYPE_ICONS: Record<string, string> = {
  phone: 'lucide:smartphone',
  tablet: 'lucide:tablet',
  notebook: 'lucide:laptop',
};

interface Props {
  device: Device;
  isMember: boolean;
  /** True when this is the suite's only device — removing it is blocked. */
  isLastMember: boolean;
  onToggle: () => void;
  onEdit: () => void;
}

/** One device in the manager grid (Hybrid Studio "Device Manager" design). */
const DeviceCard = ({device, isMember, isLastMember, onToggle, onEdit}: Props) => {
  const isCustom = device.isCustom ?? false;
  const title = isLastMember
    ? "Can't remove the last device of a suite"
    : `Click to ${isMember ? 'remove from' : 'add to'} this suite`;

  return (
    <div
      data-device-name={device.name}
      className={cx(
        'box-border w-[236px] rounded-[10px] border bg-card px-3 py-[11px]',
        isMember ? 'border-accent' : 'border-line'
      )}
    >
      <div className="flex items-center gap-[9px]">
        <button
          type="button"
          title={title}
          aria-pressed={isMember}
          data-testid={`device-card-${device.id}`}
          onClick={onToggle}
          disabled={isLastMember && isMember}
          className="flex min-w-0 flex-1 items-center gap-[9px] text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:cursor-not-allowed"
        >
          <span className="pointer-events-none contents">
            <span
              className={cx(
                'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-[5px] border-[1.5px]',
                isMember ? 'border-accent bg-accent' : 'border-line'
              )}
            >
              <Icon
                icon="ic:round-check"
                fontSize={12}
                className={cx('text-on-accent', {'opacity-0': !isMember})}
              />
            </span>
            <Icon
              icon={TYPE_ICONS[device.type] ?? 'lucide:monitor'}
              fontSize={15}
              className="flex-shrink-0 text-muted"
            />
            <span className="truncate text-[13px] font-bold">{device.name}</span>
          </span>
        </button>
        {isCustom ? (
          <button
            type="button"
            title="Edit device"
            onClick={onEdit}
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-[13px] text-muted transition-colors hover:bg-hover hover:text-fg focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          >
            <span className="pointer-events-none contents">
              <Icon icon="lucide:pencil" />
            </span>
          </button>
        ) : null}
      </div>
      <div className="mt-[6px] flex items-center gap-2 pl-[25px]">
        <span className="font-mono text-[11px] text-muted">
          {device.width} × {device.height}
        </span>
        <span className="font-mono text-[10.5px] text-muted">@{device.dpr}x</span>
        {isCustom ? (
          <span className="rounded-full bg-accent-soft px-[7px] py-[2px] text-[9.5px] font-bold tracking-[0.06em] text-accent">
            CUSTOM
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default DeviceCard;
