import { useState, useEffect, FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { selectZoomFactor, zoomReset } from 'renderer/store/features/renderer';
import { Icon } from '@iconify/react';
import cx from 'classnames';

interface ZoomWidgetProps {
  className?: string;
}

let timeout = setTimeout(() => {}, 0);

export const ZoomWidget: FC<ZoomWidgetProps> = ({ className = '' }) => {
  const zoomfactor = useSelector(selectZoomFactor);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (zoomfactor === 1) {
      setIsVisible(false);
    } else {
      clearTimeout(timeout);
      setIsVisible(true);
      timeout = setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [zoomfactor]);

  const resetZoom = () => dispatch(zoomReset());

  if (isVisible)
    return (
      <button
        type="button"
        onClick={resetZoom}
        tabIndex={0}
        className={cx(
          'rounded bg-white p-2 text-sm shadow-lg ring-1 ring-slate-500 !ring-opacity-40 transition duration-700 ease-in-out dark:bg-slate-900 dark:ring-white dark:!ring-opacity-40',
          className
        )}
      >
        <span className="w-10 text-center">
          Zoom: {Math.ceil(zoomfactor * 100)}%
        </span>
        <Icon
          className="ml-3 mb-1 inline focus:outline-none"
          icon="system-uicons:reset"
          height={16}
        />
      </button>
    );

  return null;
};
