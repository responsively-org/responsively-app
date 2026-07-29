import {Icon} from '@iconify/react';
import Popover from 'renderer/components/Popover';

const hostLabel = (address: string): string => {
  if (address.startsWith('file://')) {
    return 'LOCAL FILE';
  }
  try {
    return new URL(address).host.toUpperCase();
  } catch {
    return 'THIS SITE';
  }
};

interface Action {
  title: string;
  label: string;
  icon: string;
  note: string;
  isLoading: boolean;
  run: () => void;
}

interface Props {
  address: string;
  actions: Action[];
  onShowPermissions: () => void;
}

/**
 * The site-tools menu behind the address bar's globe button: per-site data
 * actions plus the permissions entry point (Hybrid Studio design).
 */
const SiteToolsPopover = ({address, actions, onShowPermissions}: Props) => {
  return (
    <Popover
      triggerTitle="Site tools"
      triggerClassName="flex h-[26px] items-center justify-center gap-[2px] rounded-full px-2 text-[15px] text-muted hover:bg-hover hover:text-fg"
      anchor="bottom start"
      className="w-[264px] p-[6px]"
      trigger={
        <span className="pointer-events-none contents">
          <Icon icon="mdi:web" />
          <Icon icon="mdi:chevron-down" fontSize={12} />
        </span>
      }
    >
      {({close}) => (
        <>
          <div className="px-[10px] pb-1 pt-2 text-[11px] font-bold tracking-[0.08em] text-muted">
            SITE DATA — {hostLabel(address)}
          </div>
          {actions.map((action) => (
            <button
              key={action.title}
              type="button"
              title={action.title}
              onClick={() => {
                action.run();
                close();
              }}
              className="flex w-full items-center gap-[10px] rounded-[7px] px-[10px] py-2 text-[13.5px] text-fg hover:bg-hover focus:outline-none focus-visible:bg-hover"
            >
              <span className="pointer-events-none contents">
                <Icon
                  icon={action.isLoading ? 'line-md:loading-twotone-loop' : action.icon}
                  className="text-muted"
                  fontSize={16}
                />
                {action.label}
                <span className="ml-auto text-xs text-muted">{action.note}</span>
              </span>
            </button>
          ))}
          <div className="mx-1 my-[6px] border-t border-line-soft" />
          <button
            type="button"
            title="Site permissions"
            onClick={() => {
              close();
              onShowPermissions();
            }}
            className="flex w-full items-center gap-[10px] rounded-[7px] px-[10px] py-2 text-[13.5px] text-fg hover:bg-hover focus:outline-none focus-visible:bg-hover"
          >
            <span className="pointer-events-none contents">
              <Icon icon="mdi:shield-key-outline" className="text-muted" fontSize={16} />
              Site permissions
            </span>
          </button>
        </>
      )}
    </Popover>
  );
};

export default SiteToolsPopover;
