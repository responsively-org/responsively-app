import { Icon } from '@iconify/react';
import { useDetectClickOutside } from 'react-detect-click-outside';
import Button from 'renderer/components/Button';
import { useDispatch, useSelector } from 'react-redux';
import { closeMenuFlyout, selectMenuFlyout } from 'renderer/store/features/ui';
import { selectNotifications } from 'renderer/store/features/renderer';
import useLocalStorage from 'renderer/components/useLocalStorage/useLocalStorage';
import NotificationsBubble from 'renderer/components/Notifications/NotificationsBubble';
import MenuFlyout from './Flyout';

const Menu = () => {
  const dispatch = useDispatch();
  const isMenuFlyoutOpen = useSelector(selectMenuFlyout);
  const notifications = useSelector(selectNotifications);

  const [hasNewNotifications, setHasNewNotifications] = useLocalStorage(
    'hasNewNotifications',
    true
  );

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
    setHasNewNotifications(false);
  };

  const onClose = () => {
    dispatch(closeMenuFlyout(false));
  };

  return (
    <div className="relative mr-2 flex items-center" ref={ref}>
      <Button onClick={handleFlyout} isActive={isMenuFlyoutOpen}>
        <Icon icon="carbon:overflow-menu-vertical" />
        {notifications &&
          notifications?.length > 0 &&
          Boolean(hasNewNotifications) && <NotificationsBubble />}
      </Button>
      <div style={{ visibility: isMenuFlyoutOpen ? 'visible' : 'hidden' }}>
        <MenuFlyout closeFlyout={onClose} />
      </div>
    </div>
  );
};

export default Menu;
