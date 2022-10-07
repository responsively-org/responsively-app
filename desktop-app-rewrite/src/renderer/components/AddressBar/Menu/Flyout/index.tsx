import { useDispatch } from 'react-redux';
import Button from 'renderer/components/Button';
import { APP_VIEWS, setAppView } from 'renderer/store/features/ui';
import Devtools from './Devtools';
import Zoom from './Zoom';

const MenuFlyout = () => {
  const dispatch = useDispatch();

  return (
    <div className="absolute top-[26px] right-[4px] w-80 rounded bg-white text-sm shadow-lg ring-1 ring-slate-500 !ring-opacity-40 focus:outline-none dark:bg-slate-900 dark:ring-white dark:!ring-opacity-40 ">
      <Zoom />
      <Devtools />
      <Button
        onClick={() => {
          dispatch(setAppView(APP_VIEWS.DEVICE_MANAGER));
        }}
        className="w-full !justify-start px-4"
        subtle
      >
        Device Manager
      </Button>
    </div>
  );
};

export default MenuFlyout;
