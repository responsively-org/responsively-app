import {Popover as HuiPopover, PopoverButton, PopoverPanel} from '@headlessui/react';
import cx from 'classnames';
import {ComponentProps, ReactNode, useEffect, useRef} from 'react';
import useOverlayRegistry from 'renderer/hooks/useOverlayRegistry';

interface Props {
  trigger: ReactNode;
  triggerClassName?: string;
  triggerTitle?: string;
  anchor?: ComponentProps<typeof PopoverPanel>['anchor'];
  className?: string;
  /** Observes Headless UI's internal open state (e.g. to clear unread dots). */
  onOpenChange?: (open: boolean) => void;
  children: ComponentProps<typeof PopoverPanel>['children'];
}

/**
 * Headless UI owns the open state, so registering the overlay has to happen
 * inside the render prop — a child component is the only place a hook can
 * observe it.
 */
const OverlayRegistration = ({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange?: (open: boolean) => void;
}) => {
  useOverlayRegistry(isOpen);
  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;
  useEffect(() => {
    onOpenChangeRef.current?.(isOpen);
  }, [isOpen]);
  return null;
};

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
  onOpenChange,
  children,
}: Props) => {
  return (
    <HuiPopover className="relative">
      {({open}) => (
        <>
          <OverlayRegistration isOpen={open} onOpenChange={onOpenChange} />
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
        </>
      )}
    </HuiPopover>
  );
};

export default Popover;
