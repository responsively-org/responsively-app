import * as React from 'react';
import Guides from '@scena/react-guides';
import { LegacyRef, useEffect, useRef, useMemo } from 'react';
import { Coordinates } from '../../../store/features/ruler';
import './guide.css';

export type DefaultGuide = {
  resolution: string;
  positions: number[];
  is_vertical: boolean;
};

interface Props {
  scaledHeight: number;
  height: number;
  width: number;
  scaledWidth: number;
  coordinates: Coordinates;
  zoomFactor: number;
  night: boolean;
  enabled: boolean;
  defaultGuides: DefaultGuide[];
}

const GuideGrid = ({
  scaledHeight,
  scaledWidth,
  height,
  width,
  coordinates,
  zoomFactor,
  night,
  enabled,
  defaultGuides,
}: Props) => {
  const horizontalGuidesRef = useRef<Guides>();
  const verticalGuidesRef = useRef<Guides>();
  const defaultsHor = useMemo(() => {
    return defaultGuides
      .filter((x: DefaultGuide) => !x.is_vertical)
      .flatMap((x: DefaultGuide) => x.positions);
  }, [defaultGuides]);
  const defaultsVer = useMemo(
    () =>
      defaultGuides
        .filter((x: DefaultGuide) => x.is_vertical)
        .flatMap((x) => x.positions),
    [defaultGuides]
  );

  useEffect(() => {
    const addjustedInnerHeight = coordinates.innerHeight;
    const scrollX =
      horizontalGuidesRef &&
      horizontalGuidesRef?.current &&
      horizontalGuidesRef?.current?.getRulerScrollPos() + coordinates.deltaX;

    const scrollY =
      verticalGuidesRef &&
      verticalGuidesRef?.current &&
      verticalGuidesRef?.current?.getRulerScrollPos() + coordinates.deltaY;

    let scrollPosY: number;
    if (Number(scrollY) > 0) {
      scrollPosY =
        addjustedInnerHeight - Number(scrollY) <= 0
          ? addjustedInnerHeight
          : scrollY || addjustedInnerHeight;
    } else {
      scrollPosY = 0;
    }

    let scrollPosX: number;
    if (Number(scrollX) > 0) {
      scrollPosX =
        Number(scrollX) > coordinates.innerWidth - Number(scrollX)
          ? coordinates.innerWidth
          : scrollX || coordinates.innerWidth;
    } else {
      scrollPosX = 0;
    }
    if (
      coordinates.innerHeight >= scaledHeight * zoomFactor &&
      coordinates.innerHeight - height > scrollPosY
    ) {
      verticalGuidesRef.current?.scroll(scrollPosY);
      horizontalGuidesRef.current?.scroll(scrollPosX);
      verticalGuidesRef.current?.scrollGuides(scrollPosX);
      horizontalGuidesRef.current?.scrollGuides(scrollPosY);
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
              ref={horizontalGuidesRef as LegacyRef<Guides>}
              type="horizontal"
              backgroundColor="transparent"
              className="bg-slate-200 dark:bg-slate-800"
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
              defaultGuides={defaultsHor.length > 0 ? defaultsHor : undefined}
              onChangeGuides={({ guides }) => {
                window.electron.store.set('userPreferences.guides', [
                  ...window.electron.store
                    .get('userPreferences.guides')
                    .filter((x: DefaultGuide) => {
                      if (x.resolution !== `${width}x${height}`) {
                        return true;
                      }
                      return x.is_vertical;
                    }),
                  {
                    resolution: `${width}x${height}`,
                    is_vertical: false,
                    positions: guides.filter((x) => x > 0),
                  },
                ]);
              }}
            />
            <Guides
              ref={verticalGuidesRef as LegacyRef<Guides>}
              type="vertical"
              backgroundColor="transparent"
              className="bg-slate-200 dark:bg-slate-800"
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
              defaultGuides={defaultsVer.length > 0 ? defaultsVer : undefined}
              onChangeGuides={({ guides }) => {
                window.electron.store.set('userPreferences.guides', [
                  ...window.electron.store
                    .get('userPreferences.guides')
                    .filter((x: DefaultGuide) => {
                      if (x.resolution !== `${width}x${height}`) {
                        return true;
                      }
                      return !x.is_vertical;
                    }),
                  {
                    resolution: `${width}x${height}`,
                    is_vertical: true,
                    positions: guides.filter((x) => x > 0),
                  },
                ]);
              }}
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
