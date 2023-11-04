import * as React from 'react';
import Guides from '@scena/react-guides';
import { useEffect, useRef } from 'react';
import { Coordinates } from '../../../store/features/ruler';
import './guide.css';

interface Props {
  children: JSX.Element;
  height: number;
  width: number;
  coordinates: Coordinates;
}

const GuideGrid = ({ children, height, width, coordinates }: Props) => {
  const horizonalGuidesRef: unknown = useRef();
  const verticalGuidesRef: unknown = useRef();

  // let scrollX = useRef(0);
  // let scrollY = useRef(0);

  useEffect(() => {
    if (horizonalGuidesRef !== undefined && verticalGuidesRef !== undefined) {
      const scrollX =
        horizonalGuidesRef?.current?.getRulerScrollPos() + coordinates.deltaX;
      const scrollY =
        verticalGuidesRef?.current?.getRulerScrollPos() + coordinates.deltaY;
      let scrollPosY: any;
      if (Number(scrollY) > 0) {
        scrollPosY =
          Number(scrollY) > coordinates.innerHeight
            ? coordinates.innerHeight
            : scrollY;
      } else {
        scrollPosY = 0;
      }
      let scrollPosX: any;
      if (Number(scrollX) > 0) {
        scrollPosX =
          Number(scrollX) > coordinates.innerWidth
            ? coordinates.innerWidth
            : scrollX;
      } else {
        scrollPosX = 0;
      }
      horizonalGuidesRef?.current?.scrollGuides(scrollY);
      verticalGuidesRef?.current?.scrollGuides(scrollX);

      horizonalGuidesRef?.current?.scroll(scrollPosX);
      verticalGuidesRef?.current?.scroll(scrollPosY);
      console.log('scrollY', scrollPosY);
    }
  });

  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          width: `${width + 30}px`,
          height: `${height + 30}px`,
          zIndex: 1,
          overflow: 'hidden',
        }}
      >
        <div className="box bg-slate-200 dark:bg-slate-800" />
        <Guides
          ref={horizonalGuidesRef}
          type="horizontal"
          backgroundColor="rgb(30, 41, 59)"
          style={{
            height: '30px',
            left: '30px',
            width: width * 2,
            pointerEvents: 'auto',
          }}
          displayDragPos
          displayGuidePos
          useResizeObserver
        />
        <Guides
          ref={verticalGuidesRef}
          type="vertical"
          backgroundColor="rgb(30, 41, 59)"
          style={{
            width: '30px',
            top: '0px',
            height: '10000px',
            pointerEvents: 'auto',
          }}
          displayDragPos
          displayGuidePos
          useResizeObserver
        />
      </div>
      <div style={{ paddingLeft: '30px', paddingRight: '30px' }}>
        {children}
      </div>
    </>
  );
};

export default GuideGrid;
