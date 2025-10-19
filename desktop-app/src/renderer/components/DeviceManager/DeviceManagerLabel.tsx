import { Icon } from '@iconify/react';
import cx from 'classnames';

type DeviceManagerLabelProps = {
  filteredType: string | null;
  type: string | null;
  label: string;
};

const DeviceManagerLabel = ({
  filteredType,
  type,
  label,
}: DeviceManagerLabelProps) => {
  return (
    <div className="flex items-center gap-2">
      {filteredType === type && <Icon icon="mdi:check" />}
      <span
        className={cx('capitalize', {
          'font-semibold text-black dark:text-white': filteredType === type,
        })}
      >
        {label}
      </span>
    </div>
  );
};

export default DeviceManagerLabel;
