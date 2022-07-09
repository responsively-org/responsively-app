import { KeyboardEventHandler, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'renderer/store';
import { setAddress } from 'renderer/store/features/renderer';
import { Icon } from '@iconify/react';
import { setDarkMode } from 'renderer/store/features/ui';

const AddressBar = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [typedAddress, setTypedAddress] = useState<string>('');
  const address = useSelector((state: RootState) => state.renderer.address);
  const darkMode = useSelector((state: RootState) => state.ui.darkMode);
  const dispatch = useDispatch();
  useEffect(() => {
    if (address === typedAddress) {
      return;
    }
    setTypedAddress(address);
  }, [address]);

  const dispatchAddress = () => {
    dispatch(setAddress(typedAddress));
  };
  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
      dispatchAddress();
    }
  };

  return (
    <div className="flex justify-between">
      <input
        type="text"
        className="w-[60%] rounded-full px-2 py-1 dark:bg-slate-900"
        value={typedAddress}
        onChange={(e) => setTypedAddress(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        onClick={() => {
          dispatch(setDarkMode(!darkMode));
        }}
        type="button"
      >
        {darkMode ? <Icon icon="carbon:moon" /> : <Icon icon="carbon:sun" />}
      </button>
    </div>
  );
};

export default AddressBar;
