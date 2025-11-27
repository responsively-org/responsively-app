import { useCallback, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button from 'renderer/components/Button';
import useKeyboardShortcut, {
  SHORTCUT_CHANNEL,
} from 'renderer/components/KeyboardShortcutsManager/useKeyboardShortcut';
import {
  selectZoomFactor,
  zoomIn,
  zoomOut,
  setZoomFactor,
  zoomSteps,
} from 'renderer/store/features/renderer';

interface ZoomButtonProps {
  children: React.ReactNode;
  onClick: () => void;
}

const ZoomButton = ({ children, onClick }: ZoomButtonProps) => {
  return (
    <Button className="p-0 px-2" onClick={onClick} subtle>
      {children}
    </Button>
  );
};

const Zoom = () => {
  const zoomfactor = useSelector(selectZoomFactor);
  const dispatch = useDispatch();
  const [sliderValue, setSliderValue] = useState(zoomfactor);
  const [isDragging, setIsDragging] = useState(false);

  // 줌 팩터가 외부에서 변경되면 슬라이더 값도 동기화 (드래그 중이 아닐 때만)
  useEffect(() => {
    if (!isDragging) {
      setSliderValue(zoomfactor);
    }
  }, [zoomfactor, isDragging]);

  const onZoomIn = useCallback(() => {
    dispatch(zoomIn());
  }, [dispatch]);

  const onZoomOut = useCallback(() => {
    dispatch(zoomOut());
  }, [dispatch]);

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value);
      setSliderValue(value);
    },
    []
  );

  const handleSliderMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleSliderMouseUp = useCallback(() => {
    setIsDragging(false);
    // 마우스를 놓을 때 최종 값으로 업데이트
    dispatch(setZoomFactor(sliderValue));
  }, [dispatch, sliderValue]);

  // 슬라이더를 드래그하는 동안에는 실시간으로 업데이트
  useEffect(() => {
    if (isDragging) {
      const timeoutId = setTimeout(() => {
        dispatch(setZoomFactor(sliderValue));
      }, 50); // 50ms 디바운스로 성능 최적화
      return () => clearTimeout(timeoutId);
    }
    // [FIX] ESLint consistent-return 해결을 위해 명시적 반환 추가
    return undefined;
  }, [sliderValue, isDragging, dispatch]);

  useKeyboardShortcut(SHORTCUT_CHANNEL.ZOOM_IN, onZoomIn);
  useKeyboardShortcut(SHORTCUT_CHANNEL.ZOOM_OUT, onZoomOut);

  const minZoom = zoomSteps[0];
  const maxZoom = zoomSteps[zoomSteps.length - 1];

  return (
    <div className="flex flex-col gap-2 px-4 py-2">
      <div className="flex flex-row items-center justify-start">
        <span className="w-1/2">Zoom</span>
        <div className="flex w-fit items-center gap-2 border-l px-4 dark:border-slate-400">
          <ZoomButton onClick={onZoomOut}>-</ZoomButton>
          <span className="w-16 text-center text-sm font-medium">
            {Math.round(zoomfactor * 100)}%
          </span>
          <ZoomButton onClick={onZoomIn}>+</ZoomButton>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <input
          type="range"
          min={minZoom}
          max={maxZoom}
          step={0.05}
          value={sliderValue}
          onChange={handleSliderChange}
          onMouseDown={handleSliderMouseDown}
          onMouseUp={handleSliderMouseUp}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 dark:bg-slate-700"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
              ((sliderValue - minZoom) / (maxZoom - minZoom)) * 100
            }%, #e2e8f0 ${
              ((sliderValue - minZoom) / (maxZoom - minZoom)) * 100
            }%, #e2e8f0 100%)`,
          }}
        />
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{Math.round(minZoom * 100)}%</span>
          <span>{Math.round(maxZoom * 100)}%</span>
        </div>
      </div>
    </div>
  );
};

export default Zoom;
