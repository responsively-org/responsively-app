import { useDispatch, useSelector } from 'react-redux';
import {
  selectZoomFactor,
  zoomIn,
  zoomOut,
} from 'renderer/store/features/renderer';

interface ZoomButtonProps {
  children: React.ReactNode;
  onClick: () => void;
}

const ZoomButton = ({ children, onClick }: ZoomButtonProps) => {
  return (
    <button className="px-2" onClick={onClick} type="button">
      {children}
    </button>
  );
};

const Zoom = () => {
  const zoomfactor = useSelector(selectZoomFactor);
  const dispatch = useDispatch();

  return (
    <div className="flex flex-row justify-between">
      <span>Zoom</span>
      <div className="flex gap-2 border-l pl-1 dark:border-slate-400">
        <ZoomButton onClick={() => dispatch(zoomOut())}>-</ZoomButton>
        <span className="w-10 text-center">{Math.ceil(zoomfactor * 100)}%</span>
        <ZoomButton onClick={() => dispatch(zoomIn())}>+</ZoomButton>
      </div>
    </div>
  );
};

export default Zoom;
