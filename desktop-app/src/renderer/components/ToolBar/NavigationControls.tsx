import { Icon } from '@iconify/react';
import { webViewPubSub } from 'renderer/lib/pubsub';
import Button from '../Button';
import useKeyboardShortcut, {
  SHORTCUT_CHANNEL,
  ShortcutChannel,
} from '../KeyboardShortcutsManager/useKeyboardShortcut';

export const NAVIGATION_EVENTS = {
  BACK: 'back',
  FORWARD: 'forward',
  RELOAD: 'reload',
};

interface NavigationItemProps {
  label: string;
  icon: string;
  action: () => void;
}

const NavigationButton = ({ label, icon, action }: NavigationItemProps) => {
  const shortcutName: ShortcutChannel = label.toUpperCase() as ShortcutChannel;
  useKeyboardShortcut(SHORTCUT_CHANNEL[shortcutName], action);
  return (
    <Button className="!rounded-full px-2 py-1" onClick={action} title={label}>
      <Icon icon={icon} />
    </Button>
  );
};

const ITEMS: NavigationItemProps[] = [
  {
    label: 'Back',
    icon: 'ic:round-arrow-back',
    action: () => {
      webViewPubSub.publish(NAVIGATION_EVENTS.BACK);
    },
  },
  {
    label: 'Forward',
    icon: 'ic:round-arrow-forward',
    action: () => {
      webViewPubSub.publish(NAVIGATION_EVENTS.FORWARD);
    },
  },
  {
    label: 'Refresh',
    icon: 'ic:round-refresh',
    action: () => {
      webViewPubSub.publish(NAVIGATION_EVENTS.RELOAD);
    },
  },
];

const NavigationControls = () => {
  return (
    <div className="flex">
      {ITEMS.map((item) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <NavigationButton {...item} key={item.label} />
      ))}
    </div>
  );
};

export default NavigationControls;
