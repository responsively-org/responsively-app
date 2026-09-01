import cx from 'classnames';
import {ReactNode} from 'react';

interface Props {
  width: number;
  height: number;
  scale: number;
  /** Extra room for chrome around the frame (e.g. the 30px ruler gutter). */
  offset?: number;
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
}

/**
 * Sizes a container to frame×scale so a transform-scaled webview never
 * overflows or clips its layout box (the #1022/#1515 class of bugs). Used by
 * the grid layouts and, later, the canvas.
 */
const ScaledFrame = ({width, height, scale, offset = 0, className, style, children}: Props) => {
  return (
    <div
      data-scaled-frame
      style={{
        width: width * scale + offset,
        height: height * scale + offset,
        ...style,
      }}
      className={cx('relative origin-top-left overflow-hidden', className)}
    >
      {children}
    </div>
  );
};

export default ScaledFrame;
