import Zoom from './Zoom';

const MenuFlyout = () => {
  return (
    <div className="absolute top-[20px] right-[-4px] w-48 rounded-md bg-white p-2 shadow-lg ring-1 ring-slate-500 !ring-opacity-40 focus:outline-none dark:bg-slate-900 dark:ring-white dark:!ring-opacity-40">
      <Zoom />
    </div>
  );
};

export default MenuFlyout;
