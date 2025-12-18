import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  MenuSeparator,
  Transition,
} from '@headlessui/react';
import { Icon } from '@iconify-icon/react';
import cx from 'classnames';
import { Fragment } from 'react';

interface Separator {
  type: 'separator';
}

interface Option {
  type?: 'option';
  label: JSX.Element | string;
  onClick: (() => void) | null;
}

type OptionOrSeparator = Option | Separator;

interface Props {
  label: JSX.Element | string;
  options: OptionOrSeparator[];
  className?: string | null;
}

function DropDown({ label, options, className }: Props) {
  return (
    <div className="relative text-right">
      <Menu as="div" className={`inline-block text-left ${className}`}>
        <MenuButton className="inline-flex w-full justify-center gap-1 rounded-md bg-opacity-20 p-2 text-sm font-medium hover:bg-slate-300 hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 dark:hover:bg-slate-700">
          {label}
          <Icon icon="mdi:chevron-down" />
        </MenuButton>
        <MenuItems
          anchor="bottom end"
          transition
          className="mt-2 w-fit origin-top-right divide-y divide-slate-100 rounded-md bg-slate-100 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-slate-900"
        >
          <div className="px-1 py-1 ">
            {options.map((option, idx) => {
              if (option.type === 'separator') {
                return (
                  <MenuSeparator
                    className="my-1 h-px bg-slate-500"
                    // eslint-disable-next-line react/no-array-index-key
                    key={`divider-${idx}`}
                  />
                );
              }
              return (
                // eslint-disable-next-line react/no-array-index-key
                <MenuItem key={idx.toString()}>
                  {() =>
                    option.onClick !== null ? (
                      <button
                        className={cx(
                          'group flex w-full items-center rounded-md px-2 py-2 text-sm group-data-focus:bg-slate-200 group-data-focus:dark:bg-slate-800',
                        )}
                        type="button"
                        onClick={option.onClick}
                      >
                        {option.label}
                      </button>
                    ) : (
                      <div
                        className={cx(
                          'group mt-2 flex w-full items-center rounded-md px-2',
                        )}
                      >
                        {option.label}
                      </div>
                    )
                  }
                </MenuItem>
              );
            })}
          </div>
        </MenuItems>
      </Menu>
    </div>
  );
}

export default DropDown
