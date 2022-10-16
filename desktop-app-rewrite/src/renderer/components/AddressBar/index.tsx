import { KeyboardEventHandler, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectAddress,
  selectIsInspecting,
  selectRotate,
  setAddress,
  setIsInspecting,
  setRotate,
} from 'renderer/store/features/renderer';
import { Icon } from '@iconify/react';
import NavigationControls from './NavigationControls';
import Menu from './Menu';
import Button from '../Button';

const AddressBar = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [typedAddress, setTypedAddress] = useState<string>('');
  const address = useSelector(selectAddress);

  const rotateDevice = useSelector(selectRotate);
  const isInspecting = useSelector(selectIsInspecting);
  const dispatch = useDispatch();

  useEffect(() => {
    if (address === typedAddress) {
      return;
    }
    setTypedAddress(address);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  const dispatchAddress = () => {
    let newAddress = typedAddress;
    if (newAddress.indexOf('://') === -1) {
      let protocol = 'https://';
      if (
        typedAddress.indexOf('localhost') !== -1 ||
        typedAddress.indexOf('127.0.0.1') !== -1
      ) {
        protocol = 'http://';
      }
      newAddress = protocol + typedAddress;
    }

    dispatch(setAddress(newAddress));
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
      dispatchAddress();
    }
  };

  return (
    <div className="flex items-center justify-between gap-2">
      <NavigationControls />
      <input
        type="text"
        className="flex-grow rounded-full px-2 py-1 dark:bg-slate-900"
        value={typedAddress}
        onChange={(e) => setTypedAddress(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <Button
        onClick={() => dispatch(setRotate(!rotateDevice))}
        isActive={rotateDevice}
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
      >
        <Icon icon="lucide:inspect" />
      </Button>
      <Menu />
    </div>
  );
};

export default AddressBar;
