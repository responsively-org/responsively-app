import {Icon} from '@iconify/react';
import cx from 'classnames';
import {getDevicesMap} from 'common/deviceList';
import {useDispatch, useSelector} from 'react-redux';
import Popover from 'renderer/components/Popover';
import {
  selectActiveSuite,
  selectSuites,
  setActiveSuite,
  setSuiteDevices,
} from 'renderer/store/features/device-manager';
import {APP_VIEWS, setAppView} from 'renderer/store/features/ui';

/**
 * Suites as inline chips with an editor popover (Hybrid Studio design):
 * switching suites and changing which devices are in one no longer requires
 * opening the Device Manager.
 */
export const PreviewSuiteSelector = () => {
  const dispatch = useDispatch();
  const suites = useSelector(selectSuites);
  const activeSuite = useSelector(selectActiveSuite);
  const devicesMap = getDevicesMap();

  const activeDeviceIds = activeSuite.devices;
  const knownDevices = Object.values(devicesMap);

  const toggleDevice = (deviceId: string) => {
    const isMember = activeDeviceIds.includes(deviceId);
    // An empty suite renders no previews at all, so keep the last device.
    if (isMember && activeDeviceIds.length === 1) {
      return;
    }
    dispatch(
      setSuiteDevices({
        suite: activeSuite.id,
        devices: isMember
          ? activeDeviceIds.filter((id) => id !== deviceId)
          : [...activeDeviceIds, deviceId],
      })
    );
  };

  return (
    <div
      className="flex min-w-0 max-w-[320px] items-center gap-[6px] overflow-x-auto"
      data-testid="suite-selector"
    >
      {suites.map((suite) => {
        const isActive = suite.id === activeSuite.id;
        return (
          <button
            key={suite.id}
            type="button"
            aria-pressed={isActive}
            title={`${suite.name} suite`}
            data-testid={`suite-chip-${suite.id}`}
            onClick={() => dispatch(setActiveSuite(suite.id))}
            className={cx(
              'flex h-7 items-center gap-[6px] rounded-full border px-3 text-[12.5px] font-bold transition-colors',
              'focus:outline-none focus-visible:ring-1 focus-visible:ring-accent',
              isActive
                ? 'border-accent bg-accent-soft text-accent'
                : 'border-line text-fg hover:bg-hover'
            )}
          >
            <span className="pointer-events-none contents">
              {suite.name}
              <span className="text-[11px] font-normal text-muted">{suite.devices.length}</span>
            </span>
          </button>
        );
      })}

      <Popover
        triggerTitle="Edit suite"
        anchor="bottom end"
        triggerClassName="flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-line text-sm text-muted transition-colors hover:bg-hover hover:text-fg"
        className="w-[264px] p-[6px]"
        trigger={
          <span className="pointer-events-none contents">
            <Icon icon="lucide:plus" />
          </span>
        }
      >
        {({close}) => (
          <>
            <div className="px-[10px] pb-1 pt-2 text-[10.5px] font-bold tracking-[0.08em] text-muted">
              DEVICES IN “{activeSuite.name.toUpperCase()}”
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {knownDevices.map((device) => {
                const isMember = activeDeviceIds.includes(device.id);
                return (
                  <button
                    key={device.id}
                    type="button"
                    aria-pressed={isMember}
                    onClick={() => toggleDevice(device.id)}
                    className="flex w-full items-center gap-[10px] rounded-[7px] px-[10px] py-[7px] text-[13px] text-fg hover:bg-hover focus:outline-none focus-visible:bg-hover"
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
                      <span className="truncate">{device.name}</span>
                      <span className="ml-auto flex-shrink-0 font-mono text-[11px] text-muted">
                        {device.width}×{device.height}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mx-1 my-[6px] border-t border-line-soft" />
            <button
              type="button"
              onClick={() => {
                close();
                dispatch(setAppView(APP_VIEWS.DEVICE_MANAGER));
              }}
              className="flex w-full items-center gap-2 rounded-[7px] px-[10px] py-2 text-[13.5px] text-fg hover:bg-hover focus:outline-none focus-visible:bg-hover"
            >
              <span className="pointer-events-none contents">
                <Icon icon="heroicons:swatch" fontSize={15} className="text-accent" />
                Manage suites &amp; devices
              </span>
            </button>
          </>
        )}
      </Popover>
    </div>
  );
};
