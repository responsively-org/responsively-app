import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import {Fragment} from 'react';
import useOverlayRegistry from 'renderer/hooks/useOverlayRegistry';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title?: React.JSX.Element | string;
  description?: React.JSX.Element | string;
  children?: React.JSX.Element | string;
}

const Modal = ({isOpen, onClose, title, description, children}: Props) => {
  useOverlayRegistry(isOpen);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50" as="div">
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        </TransitionChild>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel
                className={`flex w-fit min-w-[320px] flex-col gap-4 rounded bg-slate-200 text-light-normal dark:bg-slate-800 dark:text-dark-normal ${
                  title ? 'p-8' : 'px-8 py-4'
                }`}
              >
                <div>
                  <DialogTitle className="text-xl leading-6 font-medium">{title}</DialogTitle>
                  <Description>{description}</Description>
                </div>

                {children}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;
