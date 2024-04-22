import { Icon } from '@iconify/react';
import { useDetectClickOutside } from 'react-detect-click-outside';
import Button from 'renderer/components/Button';
import { useDispatch, useSelector } from 'react-redux';
import { closeMenuFlyout, selectMenuFlyout } from 'renderer/store/features/ui';
import MenuFlyout from './Flyout';

const Menu = () => {
  const dispatch = useDispatch();
  const isMenuFlyoutOpen = useSelector(selectMenuFlyout);

  const ref = useDetectClickOutside({
    onTriggered: () => {
      if (!isMenuFlyoutOpen) {
        return;
      }
      dispatch(closeMenuFlyout(false));
    },
  });

  const handleFlyout = () => {
    dispatch(closeMenuFlyout(!isMenuFlyoutOpen));
  };

  const onClose = () => {
    dispatch(closeMenuFlyout(false));
  };

  return (
    <div className="relative flex items-center" ref={ref}>
      <Button onClick={handleFlyout} isActive={isMenuFlyoutOpen}>
        <Icon icon="carbon:overflow-menu-vertical" />
      </Button>
      <div style={{ visibility: isMenuFlyoutOpen ? 'visible' : 'hidden' }}>
        <MenuFlyout closeFlyout={onClose} />
      </div>
    </div>
  );
};

export default Menu;
