import { Icon } from '@iconify/react';
import { useState } from 'react';
import Button from 'renderer/components/Button';
import ShortcutsModal from './ShortcutsModal';

const Shortcuts = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const handleClose = () => setIsOpen(!isOpen);

  return (
    <>
      <Button onClick={handleClose} isActive={isOpen} title="View Shortcuts">
        <span className="relative">
          <Icon icon="iconoir:apple-shortcuts" />
        </span>
      </Button>
      <ShortcutsModal isOpen={isOpen} onClose={handleClose} />
    </>
  );
};

export default Shortcuts;
