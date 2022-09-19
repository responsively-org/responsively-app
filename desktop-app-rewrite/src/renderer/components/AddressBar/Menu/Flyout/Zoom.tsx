import { useDispatch, useSelector } from 'react-redux';
import Button from 'renderer/components/Button';
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
    <Button className="px-2" onClick={onClick} subtle>
      {children}
    </Button>
  );
};

const Zoom = () => {
  const zoomfactor = useSelector(selectZoomFactor);
  const dispatch = useDispatch();

  return (
    <div className="flex flex-row items-center justify-between p-1">
      <span>Zoom</span>
      <div className="flex items-center gap-2 border-l pl-1 dark:border-slate-400">
        <ZoomButton onClick={() => dispatch(zoomOut())}>-</ZoomButton>
        <span className="w-10 text-center">{Math.ceil(zoomfactor * 100)}%</span>
        <ZoomButton onClick={() => dispatch(zoomIn())}>+</ZoomButton>
      </div>
    </div>
  );
};

export default Zoom;
