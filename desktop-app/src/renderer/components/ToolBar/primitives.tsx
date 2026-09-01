import cx from 'classnames';
import React from 'react';

type NativeButtonProps = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

interface ToggleableProps {
  /** Pass on toggle buttons only — drives styling and `aria-pressed`. */
  isActive?: boolean;
  // Declared explicitly (rather than relying on the intersected native props)
  // so eslint-plugin-react can see it.
  className?: string;
}

/*
 * Toolbar primitives from the Hybrid Studio design. `pointer-events-none` on
 * the children is load-bearing: icon SVGs can be replaced mid-click (e.g. by
 * an input blur re-render), and the browser then drops the click entirely.
 */

/** 30x30 icon-only button — the nav cluster and other bare icon affordances. */
export const IconButton = ({
  className,
  isActive,
  children,
  ...props
}: ToggleableProps & NativeButtonProps) => (
  <button
    type="button"
    aria-pressed={isActive}
    className={cx(
      'flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-lg text-[17px] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent',
      isActive === true ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-hover hover:text-fg',
      className
    )}
    {...props}
  >
    <span className="pointer-events-none contents">{children}</span>
  </button>
);

/** Icon + label action inside a ToolbarGroup. */
export const ToolbarAction = ({
  className,
  isActive,
  children,
  ...props
}: ToggleableProps & NativeButtonProps) => (
  <button
    type="button"
    aria-pressed={isActive}
    className={cx(
      'flex h-[30px] items-center gap-[7px] rounded-[7px] px-[11px] text-[12.5px] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent',
      isActive === true ? 'bg-accent-soft text-accent' : 'text-fg hover:bg-hover',
      className
    )}
    {...props}
  >
    <span className="pointer-events-none contents">{children}</span>
  </button>
);

/** The bordered cluster that groups related toolbar actions. */
export const ToolbarGroup = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <div
    className={cx(
      'flex items-center gap-[2px] rounded-[10px] border border-line bg-card p-[3px]',
      className
    )}
  >
    {children}
  </div>
);

export const ToolbarDivider = () => <div className="h-[26px] w-px flex-shrink-0 bg-line" />;
