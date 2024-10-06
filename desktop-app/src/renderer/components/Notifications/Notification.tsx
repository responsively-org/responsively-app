import {
  IPC_MAIN_CHANNELS,
  Notification as NotificationType,
} from 'common/constants';
import Button from '../Button';

const Notification = ({ notification }: { notification: NotificationType }) => {
  const handleLinkClick = (url: string) => {
    window.electron.ipcRenderer.sendMessage(IPC_MAIN_CHANNELS.OPEN_EXTERNAL, {
      url,
    });
  };

  return (
    <div className="mb-2 text-sm text-white">
      <p> {notification.text} </p>
      {notification.link && notification.linkText && (
        <Button
          isPrimary
          title={notification.linkText}
          onClick={() =>
            notification.link && handleLinkClick(notification.link)
          }
          className="mt-2"
        >
          {notification.linkText}
        </Button>
      )}
    </div>
  );
};

export default Notification;
