import { useEffect, useState } from 'react';
import Button from '../Button';
import Modal from '../Modal';

export const ConfirmDialog = ({
  onClose,
  onConfirm,
  open,
  confirmText,
}: {
  onClose?: () => void;
  onConfirm?: () => void;
  open: boolean;
  confirmText?: string;
}) => {
  const [isOpen, setIsOpen] = useState(open);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    setIsOpen(false);
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    setIsOpen(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div
        data-testid="confirm-dialog"
        className="mb-6 flex h-full w-full flex-col flex-wrap items-center justify-center bg-opacity-95"
      >
        <h2 className="m-4 text-center text-2xl font-bold text-white">
          <p>{confirmText || 'Are you sure?'}</p>
        </h2>
        <div className="m-4 flex justify-center">
          <Button
            onClick={handleConfirm}
            className="me-2 mr-4 mb-2 rounded-lg bg-gray-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
          >
            Confirm
          </Button>
          <Button
            onClick={handleClose}
            className="me-2 mb-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700 "
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};
