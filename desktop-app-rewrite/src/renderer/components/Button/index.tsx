import React, { useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import { Icon } from '@iconify/react';

interface CustomProps {
  className?: string;
  isActive?: boolean;
  isLoading?: boolean;
  disableHoverEffects?: boolean;
  isActionButton?: boolean;
  subtle?: boolean;
}

const Button = ({
  className = '',
  isActive = false,
  isLoading = false,
  isActionButton = false,
  subtle = false,
  disableHoverEffects = false,
  children,
  ...props
}: CustomProps &
  React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >) => {
  const [isLoadingDone, setIsLoadingDone] = useState<boolean>(false);
  const prevLoadingState = useRef(false);

  useEffect(() => {
    if (!isLoading && prevLoadingState.current === true) {
      setIsLoadingDone(true);
      setTimeout(() => {
        setIsLoadingDone(false);
      }, 800);
    }
    prevLoadingState.current = isLoading;
  }, [isLoading]);

  const hoverBg = subtle ? 'hover:bg-slate-200' : 'hover:bg-slate-400';
  const hoverBgDark = subtle
    ? 'dark:hover:bg-slate-700'
    : 'dark:hover:bg-slate-600';

  return (
    <button
      className={cx(
        `flex items-center justify-center rounded-sm p-1 ${
          disableHoverEffects === false ? `${hoverBg} ${hoverBgDark}` : ''
        } focus:outline-none`,
        {
          'bg-slate-400/60': isActive,
          'dark:bg-slate-600/60': isActive,
          'bg-slate-200': isActionButton,
          'dark:bg-slate-700': isActionButton,
          'px-2': isActionButton,
          [className]: className?.length,
        }
      )}
      type="button"
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    >
      {isLoading ? <Icon icon="line-md:loading-twotone-loop" /> : null}
      {isLoadingDone ? (
        <Icon icon="line-md:circle-to-confirm-circle-transition" />
      ) : null}
      {!isLoading && !isLoadingDone ? children : null}
    </button>
  );
};

export default Button;
