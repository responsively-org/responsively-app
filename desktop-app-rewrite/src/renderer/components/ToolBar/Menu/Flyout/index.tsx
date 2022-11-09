import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useClickOutside } from 'react-click-outside-hook';

import Button from 'renderer/components/Button';
import { APP_VIEWS, setAppView } from 'renderer/store/features/ui';
import Devtools from './Devtools';
import UITheme from './UITheme';
import Zoom from './Zoom';
import AllowInSecureSSL from './AllowInSecureSSL';

interface Props {
  onClose: () => void;
}

const MenuFlyout = ({ onClose }: Props) => {
  const dispatch = useDispatch();

  const [ref, hasClickedOutside] = useClickOutside();

  useEffect(() => {
    if (!hasClickedOutside) {
      return;
    }
    onClose();
  }, [hasClickedOutside, onClose]);

  return (
    <div
      className="absolute top-[26px] right-[4px] z-50 flex w-80 flex-col gap-2 rounded bg-white p-2 text-sm shadow-lg ring-1 ring-slate-500 !ring-opacity-40 focus:outline-none dark:bg-slate-900 dark:ring-white dark:!ring-opacity-40"
      ref={ref}
    >
      <Zoom />
      <UITheme />
      <Devtools />
      <AllowInSecureSSL />
      <Button
        onClick={() => {
          dispatch(setAppView(APP_VIEWS.DEVICE_MANAGER));
        }}
        className="w-full !justify-start p-[1px] px-4 "
        subtle
      >
        Device Manager
      </Button>
    </div>
  );
};

export default MenuFlyout;
