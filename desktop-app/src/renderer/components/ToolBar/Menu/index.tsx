import {Icon} from '@iconify/react';
import useClickOutside from 'renderer/hooks/useClickOutside';
import Button from 'renderer/components/Button';
import {useDispatch, useSelector} from 'react-redux';
import {closeMenuFlyout, selectMenuFlyout} from 'renderer/store/features/ui';
import MenuFlyout from './Flyout';

const Menu = () => {
  const dispatch = useDispatch();
  const isMenuFlyoutOpen = useSelector(selectMenuFlyout);

  const ref = useClickOutside(() => {
    if (!isMenuFlyoutOpen) {
      return;
    }
    dispatch(closeMenuFlyout(false));
  });

  const handleFlyout = () => {
    dispatch(closeMenuFlyout(!isMenuFlyoutOpen));
  };

  const onClose = () => {
    dispatch(closeMenuFlyout(false));
  };

  return (
    <div className="relative mr-2 flex items-center" ref={ref}>
      <Button onClick={handleFlyout} isActive={isMenuFlyoutOpen} data-testid="menu-button">
        <Icon icon="carbon:overflow-menu-vertical" />
      </Button>
      <div style={{visibility: isMenuFlyoutOpen ? 'visible' : 'hidden'}}>
        <MenuFlyout closeFlyout={onClose} />
      </div>
    </div>
  );
};

export default Menu;
