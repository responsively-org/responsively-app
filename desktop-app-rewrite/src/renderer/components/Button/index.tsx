import React from 'react';
import cx from 'classnames';

interface CustomProps {
  className?: string;
  isActive?: boolean;
}

const Button = ({
  className = '',
  isActive = false,
  children,
  ...props
}: CustomProps &
  React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >) => {
  return (
    <button
      className={cx(
        'flex items-center justify-center rounded-sm p-1 hover:bg-slate-400 dark:hover:bg-slate-600',
        {
          'bg-slate-400': isActive,
          'dark:bg-slate-600': isActive,
          [className]: className?.length,
        }
      )}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
