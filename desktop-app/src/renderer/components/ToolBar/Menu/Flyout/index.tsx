import { useDispatch } from 'react-redux';

import Button from 'renderer/components/Button';
import { APP_VIEWS, setAppView } from 'renderer/store/features/ui';
import Devtools from './Devtools';
import UITheme from './UITheme';
import Zoom from './Zoom';
import AllowInSecureSSL from './AllowInSecureSSL';
import ClearHistory from './ClearHistory';
import PreviewLayout from './PreviewLayout';

const MenuFlyout = () => {
  const dispatch = useDispatch();

  return (
    <div className="absolute top-[26px] right-[4px] z-50 flex w-80 flex-col gap-2 rounded bg-white p-2 text-sm shadow-lg ring-1 ring-slate-500 !ring-opacity-40 focus:outline-none dark:bg-slate-900 dark:ring-white dark:!ring-opacity-40">
      <Zoom />
      <PreviewLayout />
      <UITheme />
      <Devtools />
      <AllowInSecureSSL />
      <ClearHistory />
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
