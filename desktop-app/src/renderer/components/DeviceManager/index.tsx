import {Icon} from '@iconify/react';
import cx from 'classnames';
import {defaultDevices, Device, getDevicesMap, invalidateDevicesMap} from 'common/deviceList';
import {useEffect, useMemo, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import useOverlayRegistry from 'renderer/hooks/useOverlayRegistry';
import {selectActiveSuite, setSuiteDevices} from 'renderer/store/features/device-manager';
import {APP_VIEWS, selectAppView, setAppView} from 'renderer/store/features/ui';
import DeviceCard from './DeviceCard';
import DeviceForm from './DeviceForm';
import {ManageSuitesTool} from './PreviewSuites/ManageSuitesTool/ManageSuitesTool';
import SuitesColumn from './SuitesColumn';

const FILTERS = [
  {id: 'all', label: 'All'},
  {id: 'phone', label: 'Phones'},
  {id: 'tablet', label: 'Tablets'},
  {id: 'notebook', label: 'Laptops'},
  {id: 'custom', label: 'Custom'},
] as const;

type FilterId = (typeof FILTERS)[number]['id'];

const matchesFilter = (device: Device, filter: FilterId): boolean => {
  if (filter === 'all') {
    return true;
  }
  if (filter === 'custom') {
    return device.isCustom ?? false;
  }
  return device.type === filter;
};

const matchesSearch = (device: Device, search: string): boolean => {
  const term = search.trim().toLowerCase();
  if (term === '') {
    return true;
  }
  return `${device.name.toLowerCase()} ${device.width}x${device.height}`.includes(term);
};

/**
 * Device Manager sheet: suites on the left, the device catalogue in the
 * middle, and the custom-device form on the right. Rendered over the stage
 * rather than replacing it, so the previews stay in view.
 */
const DeviceManagerSheet = () => {
  const dispatch = useDispatch();
  const activeSuite = useSelector(selectActiveSuite);
  const [search, setSearch] = useState<string>('');
  const [filter, setFilter] = useState<FilterId>('all');
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | undefined>(undefined);
  const [customDevices, setCustomDevices] = useState<Device[]>(
    window.electron.store.get('deviceManager.customDevices') ?? []
  );

  // Docked devtools is a native view that would paint over this sheet.
  useOverlayRegistry(true);

  const allDevices = useMemo(() => [...defaultDevices, ...customDevices], [customDevices]);
  const visibleDevices = allDevices.filter(
    (device) => matchesFilter(device, filter) && matchesSearch(device, search)
  );

  const close = () => dispatch(setAppView(APP_VIEWS.BROWSER));

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveCustomDevices = (next: Device[]) => {
    setCustomDevices(next);
    window.electron.store.set('deviceManager.customDevices', next);
    invalidateDevicesMap();
  };

  const onSaveDevice = async (device: Device, isNew: boolean, addToSuite: boolean) => {
    const next = isNew
      ? [...customDevices, device]
      : customDevices.map((d) => (d.id === device.id ? device : d));
    saveCustomDevices(next);
    if (isNew && addToSuite) {
      dispatch(
        setSuiteDevices({suite: activeSuite.id, devices: [...activeSuite.devices, device.id]})
      );
    }
  };

  const onRemoveDevice = (device: Device) => {
    saveCustomDevices(customDevices.filter((d) => d.id !== device.id));
    dispatch(
      setSuiteDevices({
        suite: activeSuite.id,
        devices: activeSuite.devices.filter((id) => id !== device.id),
      })
    );
  };

  const toggleMembership = (device: Device) => {
    const isMember = activeSuite.devices.includes(device.id);
    if (isMember && activeSuite.devices.length === 1) {
      return;
    }
    dispatch(
      setSuiteDevices({
        suite: activeSuite.id,
        devices: isMember
          ? activeSuite.devices.filter((id) => id !== device.id)
          : [...activeSuite.devices, device.id],
      })
    );
  };

  const knownIds = new Set(Object.keys(getDevicesMap()));
  const suiteCount = activeSuite.devices.filter((id) => knownIds.has(id)).length;

  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center bg-black/55"
      data-testid="device-manager-sheet"
    >
      <div className="flex h-[840px] max-h-[92%] w-[1180px] max-w-[95%] flex-col overflow-hidden rounded-[14px] border border-line bg-bg shadow-elevated">
        <div className="flex flex-shrink-0 items-center gap-3 border-b border-line-soft px-[18px] py-[14px]">
          <Icon icon="heroicons:swatch" fontSize={20} className="text-accent" />
          <div>
            <div className="text-base font-bold">Device Manager</div>
            <div className="text-xs text-muted">Assign devices to suites, or create your own</div>
          </div>
          <span className="flex-1" />
          <ManageSuitesTool setCustomDevicesState={setCustomDevices} />
          <div className="h-[22px] w-px bg-line" />
          <button
            type="button"
            title="Close"
            onClick={close}
            className="flex h-[30px] w-[30px] items-center justify-center rounded-lg text-lg text-muted transition-colors hover:bg-hover hover:text-fg focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          >
            <span className="pointer-events-none contents">
              <Icon icon="ic:round-close" />
            </span>
          </button>
        </div>

        <div className="flex min-h-0 flex-1">
          <SuitesColumn />

          <div className="box-border flex min-w-0 flex-1 flex-col gap-[10px] px-[18px] py-[14px]">
            <div className="flex items-center gap-[10px]">
              <div className="flex h-[34px] max-w-[300px] flex-1 items-center gap-2 rounded-lg border border-line-soft bg-input px-[10px]">
                <Icon icon="ic:outline-search" fontSize={16} className="text-muted" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-[13px] text-fg outline-none"
                  placeholder="Search devices…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-[2px] rounded-[9px] border border-line p-[3px]">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    aria-pressed={filter === f.id}
                    onClick={() => setFilter(f.id)}
                    className={cx(
                      'h-[26px] rounded-md px-[11px] text-xs transition-colors focus:outline-none',
                      filter === f.id ? 'bg-active text-fg' : 'text-muted hover:bg-hover'
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <span className="flex-1" />
              <button
                type="button"
                data-testid="add-custom-device"
                title="Add Custom Device"
                onClick={() => {
                  setSelectedDevice(undefined);
                  setIsFormOpen(true);
                }}
                className="flex h-8 items-center gap-[7px] rounded-lg bg-accent px-[13px] text-[12.5px] font-bold text-on-accent transition-[filter] hover:brightness-110 focus:outline-none"
              >
                <span className="pointer-events-none contents">
                  <Icon icon="lucide:plus" fontSize={14} />
                  Custom device
                </span>
              </button>
            </div>

            <div className="text-xs text-muted" data-testid="device-grid-meta">
              {visibleDevices.length} of {allDevices.length} devices · {suiteCount} in “
              {activeSuite.name}”
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="flex flex-wrap content-start gap-[10px]">
                {visibleDevices.map((device) => (
                  <DeviceCard
                    key={device.id}
                    device={device}
                    isMember={activeSuite.devices.includes(device.id)}
                    isLastMember={activeSuite.devices.length === 1}
                    onToggle={() => toggleMembership(device)}
                    onEdit={() => {
                      setSelectedDevice(device);
                      setIsFormOpen(true);
                    }}
                  />
                ))}
                {visibleDevices.length === 0 ? (
                  <div className="flex w-full flex-col items-center gap-3 py-11 text-[13px] text-muted">
                    {filter === 'custom' && customDevices.length === 0
                      ? 'No custom devices added yet!'
                      : `No devices match “${search}”`}
                    {filter === 'custom' && customDevices.length === 0 ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDevice(undefined);
                          setIsFormOpen(true);
                        }}
                        className="flex h-8 items-center gap-[7px] rounded-lg border border-line px-[13px] text-[12.5px] text-fg transition-colors hover:bg-hover focus:outline-none"
                      >
                        <span className="pointer-events-none contents">
                          <Icon icon="lucide:plus" fontSize={14} />
                          Add Custom Device
                        </span>
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {isFormOpen ? (
            <DeviceForm
              key={selectedDevice?.id ?? 'new'}
              device={selectedDevice}
              existingDevices={allDevices}
              activeSuiteName={activeSuite.name}
              onSave={onSaveDevice}
              onRemove={onRemoveDevice}
              onClose={() => {
                setSelectedDevice(undefined);
                setIsFormOpen(false);
              }}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

/** Renders nothing unless the Device Manager view is active. */
const DeviceManager = () => {
  const appView = useSelector(selectAppView);
  if (appView !== APP_VIEWS.DEVICE_MANAGER) {
    return null;
  }
  return <DeviceManagerSheet />;
};

export default DeviceManager;
