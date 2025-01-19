import { useSelector } from 'react-redux';
import { selectNotifications } from 'renderer/store/features/renderer';
import { v4 as uuidv4 } from 'uuid';
import { Notification as NotificationType } from 'common/constants';
import Notification from './Notification';
import NotificationEmptyStatus from './NotificationEmptyStatus';

const Notifications = () => {
  const notificationsState = useSelector(selectNotifications);

  return (
    <div className="mb-4 max-h-[200px] overflow-y-auto rounded-lg p-1 px-4 shadow-lg dark:bg-slate-900">
      <span className="text-md">Notifications</span>
      <div className="mt-2">
        {(!notificationsState ||
          (notificationsState && notificationsState?.length === 0)) && (
          <NotificationEmptyStatus />
        )}
        {notificationsState &&
          notificationsState?.length > 0 &&
          notificationsState?.map((notification: NotificationType) => (
            <Notification key={uuidv4()} notification={notification} />
          ))}
      </div>
    </div>
  );
};

export default Notifications;
