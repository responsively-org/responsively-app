import {useEffect, useRef, useState, useCallback} from 'react';
import {useSelector} from 'react-redux';
import type {RootState} from 'renderer/store';
import {DesignOverlayPosition, selectDesignOverlay} from 'renderer/store/features/design-overlay';
import {Coordinates, selectRulerEnabled} from 'renderer/store/features/ruler';
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
  const dividerRef = useRef<HTMLDivElement>(null);
  const overlay = useSelector((state: RootState) => selectDesignOverlay(state)(resolution));
  const rulerEnabled = useSelector(selectRulerEnabled);

  const isOverlayMode = position === 'overlay';
  const [dividerPosition, setDividerPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Handler to drag the divider line
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!isOverlayMode) return;
      e.preventDefault();
      setIsDragging(true);
    },
    [isOverlayMode]
  );

  // Handler to move the mouse over the entire overlay when dragging
  const handleOverlayMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !isOverlayMode || !overlayRef.current) return;

      e.preventDefault();
      e.stopPropagation();

      const rect = overlayRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setDividerPosition(percentage);
    },
    [isDragging, isOverlayMode]
  );

  const handleOverlayMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global listeners to capture events when the mouse leaves the overlay
  useEffect(() => {
    if (!isDragging) return undefined;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging || !isOverlayMode || !overlayRef.current) return;

      e.preventDefault();
      e.stopPropagation();

      const rect = overlayRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;

      // Calculate percentage, limiting when outside the area
      let percentage: number;
      if (x < 0) {
        percentage = 0;
      } else if (x > rect.width) {
        percentage = 100;
      } else {
        percentage = (x / rect.width) * 100;
        percentage = Math.max(0, Math.min(100, percentage));
      }

      setDividerPosition(percentage);
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    // Add global listeners for when the mouse leaves the overlay
    window.addEventListener('mousemove', handleGlobalMouseMove, {
      capture: true,
      passive: false,
    });
    window.addEventListener('mouseup', handleGlobalMouseUp, {capture: true});

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove, {
        capture: true,
      });
      window.removeEventListener('mouseup', handleGlobalMouseUp, {
        capture: true,
      });
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, isOverlayMode]);

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

    // Scale scroll positions by zoomFactor to match the scaled image dimensions
    // The webview has (width x height) dimensions, but the image is scaled (scaledWidth x scaledHeight)
    if (imageRef.current) {
      imageRef.current.style.transform = `translate(${-clampedScrollX * zoomFactor}px, ${
        -clampedScrollY * zoomFactor
      }px)`;

      // Apply clip-path to hide the right part of the image based on the divider position
      // Only apply clip-path when dragging or when divider has been moved from initial position
      if (isOverlayMode) {
        if (dividerPosition === 0 && !isDragging) {
          imageRef.current.style.clipPath = 'none';
        } else {
          imageRef.current.style.clipPath = `inset(0 ${100 - dividerPosition}% 0 0)`;
        }
      } else {
        imageRef.current.style.clipPath = 'none';
      }
    }
  }, [
    coordinates,
    scaledHeight,
    scaledWidth,
    zoomFactor,
    overlay?.enabled,
    overlay?.image,
    isOverlayMode,
    dividerPosition,
    isDragging,
  ]);

  if (!overlay?.enabled || !overlay.image) {
    return null;
  }

  const isSideMode = position === 'side';

  const opacity = isSideMode ? 1 : overlay.opacity / 100;
  const hasRuler = rulerEnabled(resolution);

  const marginLeft = isOverlayMode ? rulerMargin : scaledWidth + rulerMargin + 30;
  const marginTop = rulerMargin;

  const containerStyle: React.CSSProperties = isOverlayMode
    ? {
        position: 'absolute',
        top: marginTop,
        left: marginLeft,
        height: scaledHeight,
        width: scaledWidth,
        // When dragging, allow events on the entire overlay
        pointerEvents: isDragging ? 'auto' : 'none',
        zIndex: 10,
        overflow: 'hidden',
        cursor: isDragging ? 'col-resize' : 'default',
      }
    : {
        height: hasRuler ? scaledHeight + 30 : scaledHeight,
        width: hasRuler ? scaledWidth + 30 : scaledWidth,
      };

  const containerClassName = isOverlayMode
    ? ''
    : 'relative origin-top-left overflow-hidden bg-white';

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      ref={overlayRef}
      style={containerStyle}
      className={containerClassName}
      onMouseMove={isDragging ? handleOverlayMouseMove : undefined}
      onMouseUp={isDragging ? handleOverlayMouseUp : undefined}
      onMouseLeave={isDragging ? handleOverlayMouseUp : undefined}
      role={isDragging ? 'slider' : undefined}
      aria-label={isDragging ? 'Design overlay divider' : undefined}
    >
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

      {/* Draggable divider line only in overlay mode */}
      {isOverlayMode && (
        <div
          ref={dividerRef}
          onMouseDown={handleMouseDown}
          role="slider"
          aria-label="Design overlay divider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={dividerPosition}
          tabIndex={0}
          style={{
            position: 'absolute',
            left: `${dividerPosition}%`,
            top: 0,
            bottom: 0,
            width: '8px', // Larger area for easier click (invisible)
            cursor: 'col-resize',
            pointerEvents: 'auto',
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'translateX(-50%)',
          }}
        >
          {/* Visual line - always visible with 60% opacity */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              bottom: 0,
              width: '1px',
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              transform: 'translateX(-50%)',
              pointerEvents: 'none',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default DesignOverlay;
