import { KeyboardEventHandler, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'renderer/store';
import { setAddress } from 'renderer/store/features/renderer';

const AddressBar = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [typedAddress, setTypedAddress] = useState<string>('');
  const address = useSelector((state: RootState) => state.renderer?.address);
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

  console.log('typedAddress', typedAddress, address);

  return (
    <input
      type="text"
      className="rounded-full w-[60%] px-2 py-1"
      value={typedAddress}
      onChange={(e) => setTypedAddress(e.target.value)}
      onKeyDown={handleKeyDown}
    />
  );
};

export default AddressBar;
