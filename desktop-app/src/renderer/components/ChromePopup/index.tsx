import { useEffect, useMemo, useState } from 'react';

import { IPC_MAIN_CHANNELS } from 'common/constants';

import Modal from '../Modal';
import Icon from '../../assets/img/logo.png';
import Button from '../Button';

export const ChromePopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const usesChromeMs = window.electron.store.get('chromePopup.usesChrome');
    if (usesChromeMs === undefined || usesChromeMs === true) {
      setIsOpen(true);
    }
  }, []);

  const onClose = () => {
    setIsOpen(false);
  };

  return (
    <Modal
      title={
        <div className="flex flex-col items-center gap-2 border-b border-slate-500 pb-2">
          <div className="flex w-full justify-center">
            <img src={Icon} alt="Logo" width={64} />
          </div>
          <div>Do you have our Chrome Extension?</div>
        </div>
      }
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="max-w-lg">
        <p className="pb-4 text-center">
          Responsively Helper on the Chrome Web Store
          <br />
          <br />
          Open your current Chrome browser page in the Responsively App
          seamlessly!
        </p>
        <div className="mt-4 flex justify-center">
          <div className="flex gap-1">
            <Button
              onClick={() => {
                window.electron.ipcRenderer.sendMessage(
                  IPC_MAIN_CHANNELS.OPEN_EXTERNAL,
                  {
                    url: `https://chromewebstore.google.com/detail/responsively-helper/jhphiidjkooiaollfiknkokgodbaddcj`,
                  }
                );
                window.electron.store.set('chromePopup.usesChrome', true);
                onClose();
              }}
              isTextButton
              isPrimary
            >
              Download Extension
            </Button>
            <Button
              onClick={() => {
                window.electron.store.set('chromePopup.usesChrome', false);
                onClose();
              }}
              isTextButton
              isPrimary
            >
              I do not use Chrome
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
