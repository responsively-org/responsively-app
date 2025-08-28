import Notifications from 'renderer/components/Notifications/Notifications';
import { Divider } from 'renderer/components/Divider';
import Devtools from './Devtools';
import UITheme from './UITheme';
import Zoom from './Zoom';
import AllowInSecureSSL from './AllowInSecureSSL';
import ClearHistory from './ClearHistory';
import PreviewLayout from './PreviewLayout';
import Bookmark from './Bookmark';
import { Settings } from './Settings';

interface Props {
  closeFlyout: () => void;
}

const MenuFlyout = ({ closeFlyout }: Props) => {
  return (
    <div className="absolute top-[26px] right-[4px] z-50 flex w-80 flex-col gap-2 rounded bg-slate-100 p-2 pb-0 text-sm shadow-lg ring-1 ring-slate-500 !ring-opacity-40 focus:outline-none dark:bg-slate-900 dark:ring-white dark:!ring-opacity-40">
      <Zoom />
      <UITheme />
      <Devtools />
      <AllowInSecureSSL />
      <ClearHistory />
      <Divider />

      <PreviewLayout />

      <Divider />

      <div>
        <Bookmark />
        <Settings closeFlyout={closeFlyout} />
      </div>
      <Divider />
      <Notifications />
    </div>
  );
};

export default MenuFlyout;
