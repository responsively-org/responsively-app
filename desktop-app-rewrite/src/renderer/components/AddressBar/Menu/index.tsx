import { Icon } from '@iconify/react';
import { useState } from 'react';
import MenuFlyout from './Flyout';

const Menu = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <div className="relative flex items-center">
      <button onClick={() => setIsOpen(!isOpen)} type="button">
        <Icon icon="carbon:overflow-menu-vertical" />
      </button>
      {isOpen ? <MenuFlyout /> : null}
    </div>
  );
};

export default Menu;
