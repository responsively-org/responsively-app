import { useDispatch, useSelector } from 'react-redux';
import {
  selectIsInspecting,
  selectRotate,
  setIsInspecting,
  setRotate,
} from 'renderer/store/features/renderer';
import { Icon } from '@iconify/react';
import NavigationControls from './NavigationControls';
import Menu from './Menu';
import Button from '../Button';
import AddressBar from './AddressBar';
import ColorSchemeToggle from './ColorSchemeToggle';
import { PreviewSuiteSelector } from './PreviewSuiteSelector';
import { useState } from 'react';

const Divider = () => <div className="h-6 w-px bg-gray-300 dark:bg-gray-700" />;

const ToolBar = () => {
  const rotatedDevices = useSelector(selectRotate);
  const [ allDevicesRotated, setAllDevicesRotated ] = useState<boolean>(false);
  const isInspecting = useSelector(selectIsInspecting);
  const dispatch = useDispatch();

  return (
    <div className="flex items-center justify-between gap-2">
      <NavigationControls />
      <AddressBar />
      <Button
        onClick={async () => {
          const obj = {...rotatedDevices};
          
          for (const deviceID of Object.keys(obj)) {
            if (!(obj[deviceID].inSingle)) {
              obj[deviceID] = {
                ...obj[deviceID],
                rotate: allDevicesRotated
              };
            }
          }

          dispatch(setRotate({...obj}));
          setAllDevicesRotated(!allDevicesRotated);
        }}
        isActive={allDevicesRotated}
        title="Rotate Devices"
      >
        <Icon
          icon={
            allDevicesRotated
              ? 'mdi:phone-rotate-portrait'
              : 'mdi:phone-rotate-landscape'
          }
        />
      </Button>
      <Button
        onClick={() => dispatch(setIsInspecting(!isInspecting))}
        isActive={isInspecting}
        title="Inspect Elements"
      >
        <Icon icon="lucide:inspect" />
      </Button>
      <ColorSchemeToggle />
      <Divider />
      <PreviewSuiteSelector />
      <Menu />
    </div>
  );
};

export default ToolBar;
