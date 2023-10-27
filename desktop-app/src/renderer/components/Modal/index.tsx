import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title?: JSX.Element | string;
  description?: JSX.Element | string;
  children?: JSX.Element | string;
}

const Modal = ({ isOpen, onClose, title, description, children }: Props) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50" as="div">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={`flex w-fit min-w-[320px] flex-col gap-4 rounded bg-slate-200 text-light-normal dark:bg-slate-800 dark:text-dark-normal ${
                  title ? 'p-8' : 'py-4 px-8'
                }`}
              >
                <div>
                  <Dialog.Title className="text-xl font-medium leading-6">
                    {title}
                  </Dialog.Title>
                  <Dialog.Description>{description}</Dialog.Description>
                </div>

                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;
