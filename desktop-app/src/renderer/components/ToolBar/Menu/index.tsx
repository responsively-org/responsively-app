import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';
import { useDetectClickOutside } from 'react-detect-click-outside';
import Button from 'renderer/components/Button';
import { useDispatch, useSelector } from 'react-redux';
import { closeMenuFlyout, selectMenuFlyout } from 'renderer/store/features/ui';
import MenuFlyout from './Flyout';

const Menu = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dispatch = useDispatch();
  const menuFlyout = useSelector(selectMenuFlyout);

  const ref = useDetectClickOutside({
    onTriggered: () => {
      if (!isOpen) {
        return;
      }
      setIsOpen(false);
      dispatch(closeMenuFlyout(false));
    },
  });

  const handleFlyout = () => {
    setIsOpen(!isOpen);
    dispatch(closeMenuFlyout(!isOpen));
  };

  useEffect(() => {
    setIsOpen(menuFlyout);
  }, [menuFlyout]);

  return (
    <div className="relative flex items-center" ref={ref}>
      <Button onClick={handleFlyout} isActive={isOpen}>
        <Icon icon="carbon:overflow-menu-vertical" />
      </Button>
      <div style={{ visibility: isOpen ? 'visible' : 'hidden' }}>
        <MenuFlyout />
      </div>
    </div>
  );
};

export default Menu;
