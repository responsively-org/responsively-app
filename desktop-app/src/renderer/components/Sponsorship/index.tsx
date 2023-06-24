import { useEffect, useState } from 'react';

import { IPC_MAIN_CHANNELS } from 'common/constants';

import Modal from '../Modal';
import Icon from '../../assets/img/logo.png';
import Button from '../Button';

export const Sponsorship = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const lastShownMs = window.electron.store.get('sponsorship.lastShown');
    const now = Date.now();
    if (
      lastShownMs === undefined ||
      now - lastShownMs > 1000 * 60 * 60 * 24 * 7
    ) {
      setIsOpen(true);
    }
  }, []);

  const onClose = () => {
    window.electron.store.set('sponsorship.lastShown', Date.now());
    setIsOpen(false);
  };
  return (
    <Modal
      title={
        <div className="flex flex-col items-center gap-2 border-b border-slate-500 pb-2">
          <div className="flex w-full justify-center">
            <img src={Icon} alt="Logo" width={64} />
          </div>
          <div>Level Up: Support Us as a Sponsor!</div>
        </div>
      }
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="max-w-lg">
        <p className="pb-4 text-center">
          {`Join us on an incredible journey! By becoming a sponsor, you'll fuel
          Responsively App's progress, ensuring a smooth and amazing experience for all users.`}
          <br />
          <br />
          {`Support us today and let's embark on this exciting adventure together!`}
        </p>
        <div className="mt-4 flex justify-center">
          <Button
            onClick={() => {
              window.electron.ipcRenderer.sendMessage(
                IPC_MAIN_CHANNELS.OPEN_EXTERNAL,
                {
                  url: 'https://responsively.app/sponsor?ref=app-sponsor-banner',
                }
              );
              onClose();
            }}
            isTextButton
            isPrimary
          >
            Become a Sponsor
          </Button>
        </div>
      </div>
    </Modal>
  );
};
