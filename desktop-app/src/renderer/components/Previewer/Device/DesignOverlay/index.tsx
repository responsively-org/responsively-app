import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from 'renderer/store';
import {
  DesignOverlayPosition,
  selectDesignOverlay,
} from 'renderer/store/features/design-overlay';
import { Coordinates, selectRulerEnabled } from 'renderer/store/features/ruler';
import GuideGrid from '../../Guides';

interface Props {
  resolution: string;
  scaledWidth: number;
  scaledHeight: number;
  zoomFactor: number;
  coordinates: Coordinates;
  position: DesignOverlayPosition;
  rulerMargin: number;
  width: number;
  height: number;
}

const DesignOverlay = ({
  resolution,
  scaledWidth,
  scaledHeight,
  zoomFactor,
  coordinates,
  position,
  rulerMargin,
  width,
  height,
}: Props) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const overlay = useSelector((state: RootState) =>
    selectDesignOverlay(state)(resolution)
  );
  const rulerEnabled = useSelector(selectRulerEnabled);

  useEffect(() => {
    if (!overlay?.enabled || !overlay.image || !imageRef.current) {
      if (imageRef.current) {
        imageRef.current.style.transform = 'translate(0px, 0px)';
      }
      return;
    }

    const scrollY = coordinates.scrollY || 0;
    const scrollX = coordinates.scrollX || 0;

    const viewportHeight = scaledHeight / zoomFactor;
    const viewportWidth = scaledWidth / zoomFactor;

    const maxScrollY = Math.max(0, coordinates.innerHeight - viewportHeight);
    const maxScrollX = Math.max(0, coordinates.innerWidth - viewportWidth);

    // Clamp scroll position to prevent scrolling beyond content
    const clampedScrollY = Math.max(0, Math.min(scrollY, maxScrollY));
    const clampedScrollX = Math.max(0, Math.min(scrollX, maxScrollX));

    if (imageRef.current) {
      imageRef.current.style.transform = `translate(${-clampedScrollX}px, ${-clampedScrollY}px)`;
    }
  }, [
    coordinates,
    scaledHeight,
    scaledWidth,
    zoomFactor,
    overlay?.enabled,
    overlay?.image,
  ]);

  if (!overlay?.enabled || !overlay.image) {
    return null;
  }

  const isSideMode = position === 'side';
  const isOverlayMode = position === 'overlay';

  const opacity = isSideMode ? 1 : overlay.opacity / 100;
  const hasRuler = rulerEnabled(resolution);

  const marginLeft = isOverlayMode
    ? rulerMargin
    : scaledWidth + rulerMargin + 30;
  const marginTop = rulerMargin;

  const containerStyle: React.CSSProperties = isOverlayMode
    ? {
        position: 'absolute',
        top: marginTop,
        left: marginLeft,
        height: scaledHeight,
        width: scaledWidth,
        pointerEvents: 'none',
        zIndex: 10,
        overflow: 'hidden',
      }
    : {
        height: hasRuler ? scaledHeight + 30 : scaledHeight,
        width: hasRuler ? scaledWidth + 30 : scaledWidth,
      };

  const containerClassName = isOverlayMode
    ? ''
    : 'relative origin-top-left overflow-hidden bg-white';

  return (
    <div ref={overlayRef} style={containerStyle} className={containerClassName}>
      {isSideMode && (
        <GuideGrid
          scaledHeight={scaledHeight}
          scaledWidth={scaledWidth}
          height={height}
          width={width}
          coordinates={coordinates}
          zoomFactor={zoomFactor}
          night={false}
          enabled={hasRuler}
          defaultGuides={[]}
        />
      )}
      <div
        className="relative"
        style={{
          backgroundColor: isOverlayMode ? 'transparent' : 'white',
        }}
      >
        <img
          ref={imageRef}
          src={overlay.image}
          alt="Design overlay"
          style={{
            width: `${scaledWidth}px`,
            height: 'auto',
            minHeight: `${scaledHeight}px`,
            objectFit: 'cover',
            objectPosition: 'top left',
            display: 'block',
            opacity,
            marginLeft: isSideMode && hasRuler ? '30px' : 0,
            marginTop: isSideMode && hasRuler ? '30px' : 0,
          }}
        />
      </div>
    </div>
  );
};

export default DesignOverlay;
