import {Popover as HuiPopover, PopoverButton, PopoverPanel} from '@headlessui/react';
import cx from 'classnames';
import {ComponentProps, ReactNode} from 'react';

interface Props {
  trigger: ReactNode;
  triggerClassName?: string;
  triggerTitle?: string;
  anchor?: ComponentProps<typeof PopoverPanel>['anchor'];
  className?: string;
  children: ComponentProps<typeof PopoverPanel>['children'];
}

/**
 * Anchored popover with the Hybrid Studio panel chrome. Keyboard handling,
 * Escape, outside-click and focus management come from Headless UI; children
 * may be a render prop receiving {close}.
 */
const Popover = ({
  trigger,
  triggerClassName,
  triggerTitle,
  anchor = 'bottom end',
  className,
  children,
}: Props) => {
  return (
    <HuiPopover className="relative">
      <PopoverButton
        title={triggerTitle}
        className={cx(
          'focus:outline-none focus-visible:ring-1 focus-visible:ring-accent',
          triggerClassName
        )}
      >
        {trigger}
      </PopoverButton>
      <PopoverPanel
        anchor={anchor}
        transition
        className={cx(
          'z-50 rounded-lg border border-line bg-panel text-fg shadow-elevated transition duration-100 ease-out focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0',
          className
        )}
      >
        {children}
      </PopoverPanel>
    </HuiPopover>
  );
};

export default Popover;
