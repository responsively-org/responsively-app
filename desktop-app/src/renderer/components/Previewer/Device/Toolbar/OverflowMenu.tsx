import {Popover, Transition} from '@headlessui/react';
import {Float} from '@headlessui-float/react';
import {Icon} from '@iconify/react';
import {Fragment, ReactNode} from 'react';

interface Props {
  children: ReactNode;
}

const OverflowMenu = ({children}: Props) => {
  return (
    <Popover>
      <Float placement="bottom-end" flip portal>
        <Popover.Button
          title="More Options"
          className="flex items-center justify-center rounded-sm p-1 hover:bg-slate-400 focus:outline-none dark:hover:bg-slate-600"
        >
          <Icon icon="mdi:dots-vertical" />
        </Popover.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Popover.Panel className="z-50 mt-2 flex w-fit flex-wrap gap-1 rounded-md bg-slate-100 p-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-slate-900">
            {children}
          </Popover.Panel>
        </Transition>
      </Float>
    </Popover>
  );
};

export default OverflowMenu;
