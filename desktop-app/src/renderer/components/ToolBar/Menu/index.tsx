import { Icon } from '@iconify/react';
import { useState } from 'react';
import { useDetectClickOutside } from 'react-detect-click-outside';
import Button from 'renderer/components/Button';
import MenuFlyout from './Flyout';

const Menu = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const ref = useDetectClickOutside({
    onTriggered: () => {
      if (!isOpen) {
        return;
      }
      setIsOpen(false);
    },
  });

  return (
    <div className="relative flex items-center" ref={ref}>
      <Button
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        isActive={isOpen}
      >
        <Icon icon="carbon:overflow-menu-vertical" />
      </Button>
      <div style={{ visibility: isOpen ? 'visible' : 'hidden' }}>
        <MenuFlyout />
      </div>
    </div>
  );
};

export default Menu;
