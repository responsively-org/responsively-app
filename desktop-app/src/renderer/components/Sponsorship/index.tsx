import { useEffect, useMemo, useState } from 'react';

import { IPC_MAIN_CHANNELS } from 'common/constants';

import Modal from '../Modal';
import Icon from '../../assets/img/logo.png';
import Button from '../Button';

const CONTENT_COPY = [
  {
    id: 'level-up',
    title: 'Level Up: Support Us as a Sponsor!',
    content1: `Join us on an incredible journey! By becoming a sponsor, you'll fuel Responsively App's progress, ensuring a smooth and amazing experience for all users.`,
    content2: `Support us today and let's embark on this exciting adventure together!`,
  },
  {
    id: 'elevate-your-impact',
    title: 'Elevate Your Impact: Sponsor Responsively App!',
    content1: `Take part in an extraordinary mission! By sponsoring Responsively App, you'll empower our growth and enhance the user experience for everyone.`,
    content2: `Make a difference today and let's forge ahead on this thrilling journey!`,
  },
  {
    id: 'unlock-the-future',
    title: 'Unlock the Future: Sponsor Responsively App!',
    content1: `Join us in unlocking limitless possibilities! By sponsoring Responsively App, you'll drive our progress and unlock an exceptional user experience.`,
    content2: `Support our vision now and let's embark on an exhilarating ride together!`,
  },
  {
    id: 'ignite-innovation',
    title: 'Ignite Innovation: Become a Sponsor of Responsively App!',
    content1: `Be a catalyst for innovation! By sponsoring Responsively App, you'll ignite our growth and fuel an extraordinary user experience.`,
    content2: `Support our pursuit of excellence today and let's embark on an inspiring journey together!`,
  },
  {
    id: 'power-the-revolution',
    title: 'Power the Revolution: Sponsor Responsively App!',
    content1: `Join the revolution and power our mission! By becoming a sponsor, you'll drive our progress and revolutionize the user experience.`,
    content2: `Support us today and let's embark on a groundbreaking adventure together!`,
  },
  {
    id: 'supercharge-success',
    title: 'Supercharge Success: Sponsor Responsively App!',
    content1: `Supercharge your impact! By sponsoring Responsively App, you'll fuel our success and empower an exceptional user experience.`,
    content2: `Support our mission now and let's embark on an exhilarating journey together!`,
  },
];

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

  // Choose a random content copy
  const contentCopy = useMemo(
    () => CONTENT_COPY[Math.floor(Math.random() * CONTENT_COPY.length)],
    []
  );

  return (
    <Modal
      title={
        <div className="flex flex-col items-center gap-2 border-b border-slate-500 pb-2">
          <div className="flex w-full justify-center">
            <img src={Icon} alt="Logo" width={64} />
          </div>
          <div>{contentCopy.title}</div>
        </div>
      }
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="max-w-lg">
        <p className="pb-4 text-center">
          {contentCopy.content1}
          <br />
          <br />
          {contentCopy.content2}
        </p>
        <div className="mt-4 flex justify-center">
          <Button
            onClick={() => {
              window.electron.ipcRenderer.sendMessage(
                IPC_MAIN_CHANNELS.OPEN_EXTERNAL,
                {
                  url: `https://responsively.app/sponsor?utm_source=app&utm_medium=app-banner&utm_campaign=sponsor&utm_term=${contentCopy.id}`,
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
