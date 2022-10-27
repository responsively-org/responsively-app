import { Icon } from '@iconify/react';
import { KeyboardEventHandler, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button from 'renderer/components/Button';
import PubSub, { webViewPubSub } from 'renderer/lib/pubsub';
import { selectAddress, setAddress } from 'renderer/store/features/renderer';

export const ADDRESS_BAR_EVENTS = {
  DELETE_COOKIES: 'DELETE_COOKIES',
  DELETE_STORAGE: 'DELETE_STORAGE',
  DELETE_CACHE: 'DELETE_CACHE',
};

const AddressBar = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [typedAddress, setTypedAddress] = useState<string>('');
  const [deleteStorageLoading, setDeleteStorageLoading] =
    useState<boolean>(false);
  const [deleteCookiesLoading, setDeleteCookiesLoading] =
    useState<boolean>(false);
  const [deleteCacheLoading, setDeleteCacheLoading] = useState<boolean>(false);
  const address = useSelector(selectAddress);
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

  const deleteCookies = async () => {
    setDeleteCookiesLoading(true);
    await webViewPubSub.publish(ADDRESS_BAR_EVENTS.DELETE_COOKIES);
    setDeleteCookiesLoading(false);
  };

  const deleteStorage = async () => {
    setDeleteStorageLoading(true);
    await webViewPubSub.publish(ADDRESS_BAR_EVENTS.DELETE_STORAGE);
    setDeleteStorageLoading(false);
  };

  const deleteCache = async () => {
    setDeleteCacheLoading(true);
    await webViewPubSub.publish(ADDRESS_BAR_EVENTS.DELETE_CACHE);
    setDeleteCacheLoading(false);
  };

  return (
    <div className="relative w-full flex-grow">
      <div className="absolute inset-y-0 left-2 mr-2 flex items-center">
        <Icon icon="mdi:web" className="text-gray-500" />
      </div>
      <input
        type="text"
        className="w-full text-ellipsis rounded-full px-2 py-1 pl-8 pr-20 dark:bg-slate-900"
        value={typedAddress}
        onChange={(e) => setTypedAddress(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className="absolute inset-y-0 right-0 mr-2 flex items-center">
        <Button
          className="rounded-full"
          onClick={deleteStorage}
          isLoading={deleteStorageLoading}
          title="Delete Storage"
        >
          <Icon icon="mdi:database-remove-outline" />
        </Button>
        <Button
          className="rounded-full"
          onClick={deleteCookies}
          isLoading={deleteCookiesLoading}
          title="Delete Cookies"
        >
          <Icon icon="mdi:cookie-remove-outline" />
        </Button>
        <Button
          className="rounded-full"
          onClick={deleteCache}
          isLoading={deleteCacheLoading}
          title="Clear Cache"
        >
          <Icon icon="mdi:wifi-remove" />
        </Button>
      </div>
    </div>
  );
};

export default AddressBar;
