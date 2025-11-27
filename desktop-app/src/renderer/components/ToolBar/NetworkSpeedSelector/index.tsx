import { Icon } from '@iconify/react';
import { useDispatch, useSelector } from 'react-redux';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Float } from '@headlessui-float/react';
import cx from 'classnames';
import {
  selectNetworkProfile,
  setNetworkProfile,
} from 'renderer/store/features/renderer';
import { networkProfiles, type NetworkProfile } from 'common/networkProfiles';
import { IPC_MAIN_CHANNELS } from 'common/constants';
import { selectActiveSuite } from 'renderer/store/features/device-manager';
import { getDevicesMap } from 'common/deviceList';

const getNetworkIcon = (profile: NetworkProfile): string => {
  if (profile === 'offline') return 'mdi:wifi-off';
  if (profile === 'online') return 'mdi:wifi';
  return 'mdi:network';
};

const NetworkSpeedSelector = () => {
  const networkProfile = useSelector(selectNetworkProfile);
  const activeSuite = useSelector(selectActiveSuite);
  const dispatch = useDispatch();

  const handleNetworkProfileChange = async (profile: NetworkProfile) => {
    dispatch(setNetworkProfile(profile));

    // Apply network profile to all active webviews
    const devices = activeSuite.devices.map((id) => getDevicesMap()[id]);

    const applyProfileToDevice = async (
      device: ReturnType<typeof getDevicesMap>[string]
    ) => {
      // Get webview element by device name
      const webview = document.getElementById(
        device.name
      ) as Electron.WebviewTag | null;
      if (webview) {
        const webContentsId = webview.getWebContentsId();

        await window.electron.ipcRenderer.invoke<
          { webContentsId: number; profile: NetworkProfile },
          { success: boolean }
        >(IPC_MAIN_CHANNELS.SET_NETWORK_PROFILE, {
          webContentsId,
          profile,
        });

        // Reload the page when switching network profiles to apply changes
        // Always reload ignoring cache to see the throttling effect
        setTimeout(() => {
          // For all modes, reload ignoring cache to ensure network throttling is visible
          webview.reloadIgnoringCache();
        }, 300);
      }
    };

    await Promise.all(
      devices.map((device) =>
        applyProfileToDevice(device).catch((err) => {
          // eslint-disable-next-line no-console
          console.error(
            `Failed to set network profile for device ${device.name}:`,
            err
          );
        })
      )
    );
  };

  const currentProfile = networkProfiles[networkProfile];

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Float placement="bottom-end" flip portal>
        <Menu.Button className="inline-flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-300 hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 dark:hover:bg-slate-700">
          <Icon icon="mdi:network" />
          <span className="hidden sm:inline">{currentProfile.label}</span>
          <Icon icon="mdi:chevron-down" className="hidden sm:inline" />
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="z-50 mt-2 w-40 origin-top-right divide-y divide-slate-100 rounded-md bg-slate-100 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:divide-slate-700 dark:bg-slate-900">
            <div className="px-1 py-1">
              {(Object.keys(networkProfiles) as NetworkProfile[]).map(
                (profile) => (
                  <Menu.Item key={profile}>
                    {({ active }) => (
                      <button
                        type="button"
                        className={cx(
                          'group flex w-full items-center rounded-md px-2 py-2 text-sm',
                          {
                            'bg-slate-200 dark:bg-slate-800': active,
                            'bg-slate-300 dark:bg-slate-700':
                              profile === networkProfile,
                          }
                        )}
                        onClick={() => handleNetworkProfileChange(profile)}
                      >
                        <Icon icon={getNetworkIcon(profile)} className="mr-2" />
                        {networkProfiles[profile].label}
                      </button>
                    )}
                  </Menu.Item>
                )
              )}
            </div>
          </Menu.Items>
        </Transition>
      </Float>
    </Menu>
  );
};

export default NetworkSpeedSelector;
