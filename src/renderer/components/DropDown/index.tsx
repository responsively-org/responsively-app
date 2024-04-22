import { Menu, Transition } from '@headlessui/react';
import { Float } from '@headlessui-float/react';
import { Icon } from '@iconify/react';
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

export function DropDown({ label, options, className }: Props) {
  return (
    <div className="relative text-right">
      <Menu as="div" className={`inline-block text-left ${className}`}>
        <Float placement="bottom-end" flip portal>
          <Menu.Button className="inline-flex w-full justify-center gap-1 rounded-md bg-opacity-20 p-2 text-sm font-medium hover:bg-slate-300 hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 dark:hover:bg-slate-700">
            {label}
            <Icon icon="mdi:chevron-down" />
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="z-50 mt-2 w-fit origin-top-right divide-y divide-slate-100 rounded-md bg-slate-100 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-slate-900">
              <div className="px-1 py-1 ">
                {options.map((option, idx) => {
                  if (option.type === 'separator') {
                    return (
                      <div
                        className="m-1 border-t-[1px] border-t-slate-500"
                        // eslint-disable-next-line react/no-array-index-key
                        key={`divider-${idx}`}
                      />
                    );
                  }
                  return (
                    // eslint-disable-next-line react/no-array-index-key
                    <Menu.Item key={idx.toString()}>
                      {({ active }) =>
                        option.onClick !== null ? (
                          <button
                            className={cx(
                              'group flex w-full items-center rounded-md px-2 py-2 text-sm',
                              { 'bg-slate-200 dark:bg-slate-800': active }
                            )}
                            type="button"
                            onClick={option.onClick}
                          >
                            {option.label}
                          </button>
                        ) : (
                          <div
                            className={cx(
                              'group mt-2 flex w-full items-center rounded-md px-2'
                            )}
                          >
                            {option.label}
                          </div>
                        )
                      }
                    </Menu.Item>
                  );
                })}
              </div>
            </Menu.Items>
          </Transition>
        </Float>
      </Menu>
    </div>
  );
}
