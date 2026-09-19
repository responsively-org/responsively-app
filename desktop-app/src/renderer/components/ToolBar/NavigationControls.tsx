import {Icon} from '@iconify/react';
import {webViewPubSub} from 'renderer/lib/pubsub';
import useKeyboardShortcut, {
  SHORTCUT_CHANNEL,
  ShortcutChannel,
} from '../KeyboardShortcutsManager/useKeyboardShortcut';
import {IconButton} from './primitives';

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

const TEST_ID_MAP: Record<string, string> = {
  Back: 'nav-back',
  Forward: 'nav-forward',
  Refresh: 'nav-refresh',
};

const NavigationButton = ({label, icon, action}: NavigationItemProps) => {
  const shortcutName: ShortcutChannel = label.toUpperCase() as ShortcutChannel;
  useKeyboardShortcut(SHORTCUT_CHANNEL[shortcutName], action);
  return (
    <IconButton onClick={action} title={label} data-testid={TEST_ID_MAP[label]}>
      <Icon icon={icon} />
    </IconButton>
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
    <div className="flex shrink-0 gap-[2px]">
      {ITEMS.map((item) => (
        <NavigationButton {...item} key={item.label} />
      ))}
    </div>
  );
};

export default NavigationControls;
