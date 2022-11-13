import { Icon } from '@iconify/react';
import cx from 'classnames';
import { PermissionRequestArg } from 'main/web-permissions/PermissionsManager';
import { KeyboardEventHandler, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button from 'renderer/components/Button';
import { webViewPubSub } from 'renderer/lib/pubsub';
import { selectAddress, setAddress } from 'renderer/store/features/renderer';

export const ADDRESS_BAR_EVENTS = {
  DELETE_COOKIES: 'DELETE_COOKIES',
  DELETE_STORAGE: 'DELETE_STORAGE',
  DELETE_CACHE: 'DELETE_CACHE',
};

const AddressBar = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [typedAddress, setTypedAddress] = useState<string>('');
  const [homepage, setHomepage] = useState<string>(
    window.electron.store.get('homepage')
  );
  const [deleteStorageLoading, setDeleteStorageLoading] =
    useState<boolean>(false);
  const [deleteCookiesLoading, setDeleteCookiesLoading] =
    useState<boolean>(false);
  const [deleteCacheLoading, setDeleteCacheLoading] = useState<boolean>(false);
  const [permissionRequest, setPermissionRequest] =
    useState<PermissionRequestArg | null>(null);
  const address = useSelector(selectAddress);
  const dispatch = useDispatch();

  useEffect(() => {
    if (address === typedAddress) {
      return;
    }
    setTypedAddress(address);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  useEffect(() => {
    window.electron.ipcRenderer.on<PermissionRequestArg>(
      'permission-request',
      (args) => {
        setPermissionRequest(args);
      }
    );
    return () => {
      window.electron.ipcRenderer.removeAllListeners('permission-request');
    };
  }, []);

  useEffect(() => {
    if (homepage !== window.electron.store.get('homepage')) {
      window.electron.store.set('homepage', homepage);
    }
  }, [homepage]);

  const permissionReqClickHandler = (allow: boolean) => {
    if (!permissionRequest) {
      return;
    }
    window.electron.ipcRenderer.invoke('permission-response', {
      permissionRequest,
      allow,
    });
    setPermissionRequest(null);
  };

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

  console.log('homepage', homepage);

  const isHomepage = address === homepage;

  return (
    <div className="relative w-full flex-grow">
      <div className="absolute top-2 left-2 mr-2 flex flex-col items-start">
        <Icon icon="mdi:web" className="text-gray-500" />
        {permissionRequest != null ? (
          <div className="z-40 mt-4 flex w-96 flex-col gap-8 rounded bg-white p-6 shadow-lg ring-1 ring-slate-500 !ring-opacity-40 focus:outline-none dark:bg-slate-900 dark:ring-white dark:!ring-opacity-40">
            <span>
              {permissionRequest.requestingOrigin} requests permission for:{' '}
              <br />
              <span className="flex justify-center font-bold capitalize">
                {permissionRequest.permission}
              </span>
            </span>
            <div className="flex justify-end">
              <div className="flex w-1/2 justify-around">
                <Button
                  onClick={() => {
                    permissionReqClickHandler(false);
                  }}
                  isActionButton
                >
                  Block
                </Button>
                <Button
                  onClick={() => {
                    permissionReqClickHandler(true);
                  }}
                  isActionButton
                >
                  Allow
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
      <input
        ref={inputRef}
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
        <Button
          className={cx('rounded-full', { 'text-amber-500': isHomepage })}
          onClick={() => setHomepage(address)}
          title="Homepage"
        >
          <Icon icon={isHomepage ? 'mdi:home' : 'mdi:home-outline'} />
        </Button>
      </div>
    </div>
  );
};

export default AddressBar;
