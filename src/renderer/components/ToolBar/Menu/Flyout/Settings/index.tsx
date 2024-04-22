import { useState } from 'react';
import Button from 'renderer/components/Button';
import Modal from 'renderer/components/Modal';
import { SettingsContent } from './SettingsContent';

interface Props {
  closeFlyout: () => void;
}

export const Settings = ({ closeFlyout }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const onClose = () => setIsOpen(false);

  return (
    <div className="relative right-2 w-80">
      <Button
        className="right-2 m-0 flex w-80 !justify-start pl-6"
        onClick={() => {
          setIsOpen(true);
          closeFlyout();
        }}
      >
        Settings
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} title="Settings">
        <SettingsContent onClose={onClose} />
      </Modal>
    </div>
  );
};
