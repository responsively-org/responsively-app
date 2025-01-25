import { ReactElement } from 'react';
import cx from 'classnames';

interface Props {
  buttons: {
    content: ReactElement;
    srContent: string;
    onClick: () => void;
    isActive: boolean;
  }[];
}

export const ButtonGroup = ({ buttons }: Props) => {
  return (
    <span className="isolate inline-flex rounded-md shadow-sm">
      {buttons.map(({ content, srContent, onClick, isActive }, index) => (
        <button
          type="button"
          className={cx(
            'relative inline-flex items-center px-2 py-2 text-slate-500 ring-1 ring-inset ring-slate-300 hover:bg-slate-300 focus:z-10 dark:text-slate-200 hover:dark:bg-slate-600',
            {
              'rounded-l-md': index === 0,
              'rounded-r-md': index === buttons.length - 1,
              'bg-slate-200 dark:bg-slate-600': isActive,
            }
          )}
          onClick={onClick}
        >
          <span className="sr-only">{srContent}</span>
          {content}
        </button>
      ))}
    </span>
  );
};
