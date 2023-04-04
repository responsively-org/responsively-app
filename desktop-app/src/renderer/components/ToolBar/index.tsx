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

const ToolBar = () => {
  const rotateDevice = useSelector(selectRotate);
  const isInspecting = useSelector(selectIsInspecting);
  const dispatch = useDispatch();

  return (
    <div className="flex items-center justify-between gap-2">
      <NavigationControls />
      <AddressBar />
      <Button
        onClick={() => dispatch(setRotate(!rotateDevice))}
        isActive={rotateDevice}
        title="Rotate Devices"
      >
        <Icon
          icon={
            rotateDevice
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
      <Menu />
    </div>
  );
};

export default ToolBar;
