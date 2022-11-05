import { Icon } from '@iconify/react';
import { useState } from 'react';
import Button from 'renderer/components/Button';
import MenuFlyout from './Flyout';

const Menu = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <div className="relative flex items-center">
      <Button
        onClick={() => (!isOpen ? setIsOpen(true) : null)}
        isActive={isOpen}
      >
        <Icon icon="carbon:overflow-menu-vertical" />
      </Button>
      {isOpen ? <MenuFlyout onClose={() => setIsOpen(false)} /> : null}
    </div>
  );
};

export default Menu;
