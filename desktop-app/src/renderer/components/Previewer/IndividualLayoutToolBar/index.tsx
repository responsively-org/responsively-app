import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Tab, Tabs, TabList } from 'react-tabs';
import { Icon } from '@iconify/react';
import cx from 'classnames';
import { setLayout } from 'renderer/store/features/renderer';
import { PREVIEW_LAYOUTS } from 'common/constants';
import { Device as IDevice } from 'common/deviceList';
import './styles.css';

interface Props {
  individualDevice: IDevice;
  setIndividualDevice: (device: IDevice) => void;
  devices: IDevice[];
}

const IndividualLayoutToolbar = ({
  individualDevice,
  setIndividualDevice,
  devices,
}: Props) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(0);

  const onTabClick = (newTabIndex: number) => {
    setActiveTab(newTabIndex);
    setIndividualDevice(devices[newTabIndex]);
  };

  const isActive = (idx: number) => activeTab === idx;
  const handleCloseBtn = () => dispatch(setLayout(PREVIEW_LAYOUTS.COLUMN));

  useEffect(() => {
    const activeTabIndex = devices.findIndex(
      (device) => device.id === individualDevice.id
    );
    setActiveTab(activeTabIndex);
  }, [individualDevice, devices]);

  return (
    <div className="my-4 ml-12 mr-4 flex justify-between">
      <Tabs
        onSelect={onTabClick}
        selectedIndex={activeTab}
        className={cx('react-tabs flex flex-1')}
      >
        <TabList
          className={cx(
            'custom-scrollbar flex flex-1  justify-center gap-1 overflow-x-auto border-b border-slate-400/60 dark:border-white'
          )}
        >
          {devices.map((device, idx) => (
            <Tab
              className={cx(
                'border-1 bottom-auto flex flex-shrink-0 cursor-pointer items-center rounded-t-md border-gray-300 px-4',
                {
                  'bg-slate-400/60': isActive(idx),
                  'dark:bg-slate-100/90': isActive(idx),
                  'text-light-normal': isActive(idx),
                }
              )}
              key={device.id}
            >
              {device.name}
            </Tab>
          ))}
        </TabList>
      </Tabs>
      <div className="relative top-1 ml-6">
        <Icon
          icon="carbon:close-outline"
          className="cursor-pointer"
          height={20}
          onClick={handleCloseBtn}
        />
      </div>
    </div>
  );
};

export default IndividualLayoutToolbar;
