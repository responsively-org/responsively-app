import * as React from 'react';
import Guides from '@scena/react-guides';
import { LegacyRef, useEffect, useRef, useMemo } from 'react';
import { Coordinates } from '../../../store/features/ruler';
import './guide.css';

interface Props {
  scaledHeight: number;
  height: number;
  scaledWidth: number;
  coordinates: Coordinates;
  zoomFactor: number;
  night: boolean;
  enabled: boolean;
}

const GuideGrid = ({
  scaledHeight,
  scaledWidth,
  height,
  coordinates,
  zoomFactor,
  night,
  enabled,
}: Props) => {
  const horizonalGuidesRef = useRef<Guides>();
  const verticalGuidesRef = useRef<Guides>();
  const defaultGuides = useMemo(() => [0, 100, 200], []);

  useEffect(() => {
    const addjustedInnerHeight = coordinates.innerHeight;
    const scrollX =
      horizonalGuidesRef &&
      horizonalGuidesRef?.current &&
      horizonalGuidesRef?.current?.getRulerScrollPos() + coordinates.deltaX;

    const scrollY =
      verticalGuidesRef &&
      verticalGuidesRef?.current &&
      verticalGuidesRef?.current?.getRulerScrollPos() + coordinates.deltaY;

    let scrollPosY: any;
    if (Number(scrollY) > 0) {
      scrollPosY =
        addjustedInnerHeight - Number(scrollY) <= 0
          ? addjustedInnerHeight
          : scrollY;
    } else {
      scrollPosY = 0;
    }

    let scrollPosX: any;
    if (Number(scrollX) > 0) {
      scrollPosX =
        Number(scrollX) > coordinates.innerWidth - Number(scrollX)
          ? coordinates.innerWidth
          : scrollX;
    } else {
      scrollPosX = 0;
    }
    if (
      coordinates.innerHeight >= scaledHeight * zoomFactor &&
      coordinates.innerHeight - height > scrollPosY
    ) {
      verticalGuidesRef.current?.scroll(scrollPosY);
      horizonalGuidesRef.current?.scroll(scrollPosX);
      verticalGuidesRef.current?.scrollGuides(scrollPosX);
      horizonalGuidesRef.current?.scrollGuides(scrollPosY);
    }
  });

  return (
    <>
      {enabled ? (
        <>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              pointerEvents: 'none',
              width: `${scaledWidth + 30}px`,
              height: `${scaledHeight + 30}px`,
              zIndex: 1,
              overflow: 'hidden',
            }}
          >
            <div className="box bg-slate-200 dark:bg-slate-800" />
            <Guides
              ref={horizonalGuidesRef as LegacyRef<Guides>}
              type="horizontal"
              backgroundColor="transparent"
              textColor={night ? 'rgb(209, 213, 219)' : 'rgb(55, 65, 81)'}
              mainLineSize="40%"
              longLineSize="5"
              shortLineSize="1"
              lineColor={night ? '#fefefe' : '#777777'}
              zoom={zoomFactor}
              style={{
                height: '30px',
                left: '30px',
                width: scaledWidth * 2,
                pointerEvents: 'auto',
              }}
              displayDragPos
              displayGuidePos
              useResizeObserver
              defaultGuides={defaultGuides}
            />
            <Guides
              ref={verticalGuidesRef as LegacyRef<Guides>}
              type="vertical"
              backgroundColor="transparent"
              textColor={night ? 'rgb(209, 213, 219)' : 'rgb(55, 65, 81)'}
              mainLineSize="40%"
              longLineSize="5"
              shortLineSize="1"
              lineColor={night ? '#fefefe' : '#777777'}
              zoom={zoomFactor}
              style={{
                width: '30px',
                top: '0px',
                pointerEvents: 'auto',
              }}
              displayDragPos
              displayGuidePos
              useResizeObserver
              defaultGuides={defaultGuides}
            />
          </div>
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default GuideGrid;
