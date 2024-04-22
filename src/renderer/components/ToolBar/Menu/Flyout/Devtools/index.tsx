import { DOCK_POSITION } from 'common/constants';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectDockPosition,
  setDockPosition,
} from 'renderer/store/features/devtools';
import Toggle from 'renderer/components/Toggle';

const Devtools = () => {
  const dockPosition = useSelector(selectDockPosition);
  const dispatch = useDispatch();

  return (
    <div className="flex flex-row items-center justify-start px-4">
      <span className="w-1/2">Dock Devtools</span>
      <div className="flex items-center gap-2 border-l px-4 dark:border-slate-400">
        <Toggle
          isOn={dockPosition !== DOCK_POSITION.UNDOCKED}
          onChange={(value) => {
            if (value.target.checked) {
              dispatch(setDockPosition(DOCK_POSITION.BOTTOM));
            } else {
              dispatch(setDockPosition(DOCK_POSITION.UNDOCKED));
            }
          }}
        />
      </div>
    </div>
  );
};

export default Devtools;
