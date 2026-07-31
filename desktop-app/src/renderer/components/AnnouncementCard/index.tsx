import {Icon} from '@iconify/react';
import {PREVIEW_LAYOUTS} from 'common/constants';
import {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {openSponsorPage} from 'renderer/components/Notifications/Notifications';
import {selectLayout} from 'renderer/store/features/renderer';
import {
  hideSupportForever,
  selectAnnouncements,
  selectIsPresenting,
  setSupportShownAt,
  setWhatsNewSeen,
} from 'renderer/store/features/ui';

const SUPPORT_INTERVAL_MS = 30 * 24 * 60 * 60 * 1000;

/** "2.0.0" → "2.0" for the card title. */
const shortVersion = (version: string) => version.split('.').slice(0, 2).join('.');

const WHATS_NEW_ROWS: Array<{icon: string; label: string}> = [
  {icon: 'lucide:plug-zap', label: 'MCP server — connect Claude, Codex & more'},
  {icon: 'lucide:presentation', label: 'Canvas mode for presentations & recordings'},
  {icon: 'lucide:smartphone', label: 'Custom devices with live preview'},
];

/**
 * Launch card (Hybrid Studio design): floats above the status bar, bottom
 * right. Shows "What's new" once per release; otherwise the support-us pitch
 * at most once a month. Never during Present mode.
 */
const AnnouncementCard = () => {
  const dispatch = useDispatch();
  const announcements = useSelector(selectAnnouncements);
  const layout = useSelector(selectLayout);
  const isPresenting = useSelector(selectIsPresenting);
  const {appVersion} = window.responsively;

  // Decided once at mount so dismissals elsewhere (e.g. opening the bell)
  // don't yank a card the user is looking at.
  const [variant] = useState<'whats-new' | 'support' | null>(() => {
    if (announcements.seenVersion !== appVersion) {
      return 'whats-new';
    }
    if (
      !announcements.supportHidden &&
      (announcements.supportShownAt === null ||
        Date.now() - announcements.supportShownAt > SUPPORT_INTERVAL_MS)
    ) {
      return 'support';
    }
    return null;
  });
  const [open, setOpen] = useState<boolean>(true);

  // "Shown at most once a month" counts from when it appears.
  useEffect(() => {
    if (variant === 'support') {
      dispatch(setSupportShownAt(Date.now()));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (variant === null || !open || (isPresenting && layout === PREVIEW_LAYOUTS.CANVAS)) {
    return null;
  }

  const isWhatsNew = variant === 'whats-new';

  const dismiss = () => {
    if (isWhatsNew) {
      dispatch(setWhatsNewSeen(appVersion));
    }
    setOpen(false);
  };

  const seeUpdates = () => {
    dismiss();
    // The bell popover's open state lives inside Headless UI; its trigger
    // button is the one supported way in.
    document.querySelector<HTMLButtonElement>('button[title="Notifications"]')?.click();
  };

  const sponsor = () => {
    openSponsorPage('support-card');
    dispatch(hideSupportForever());
    setOpen(false);
  };

  return (
    <div
      data-testid="announcement-card"
      className="fixed bottom-[52px] right-[14px] z-40 w-[308px] rounded-xl border border-line bg-panel p-[14px] text-fg shadow-elevated"
    >
      <div className="flex items-center gap-[9px]">
        <span
          className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${
            isWhatsNew ? 'bg-accent-soft text-accent' : 'bg-heart-soft text-heart'
          }`}
        >
          <Icon icon={isWhatsNew ? 'lucide:megaphone' : 'lucide:heart'} fontSize={15} />
        </span>
        <span className="text-[13.5px] font-bold">
          {isWhatsNew ? `What's new in ${shortVersion(appVersion)}` : 'Support Responsively'}
        </span>
        <span className="flex-1" />
        <button
          type="button"
          title="Dismiss"
          onClick={dismiss}
          className="flex h-6 w-6 items-center justify-center rounded-md text-[14px] text-muted transition-colors hover:bg-hover hover:text-fg focus:outline-none"
        >
          <span className="pointer-events-none contents">
            <Icon icon="ic:round-close" />
          </span>
        </button>
      </div>
      {isWhatsNew ? (
        <>
          <div className="mb-3 mt-[10px] flex flex-col gap-[5px]">
            {WHATS_NEW_ROWS.map((row) => (
              <div key={row.label} className="flex gap-[7px] text-[12px] text-fg">
                <Icon
                  icon={row.icon}
                  fontSize={13}
                  className="mt-[1px] flex-shrink-0 text-accent"
                />
                {row.label}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={seeUpdates}
              className="h-7 rounded-[7px] bg-accent px-3 text-[11.5px] font-bold text-on-accent transition-[filter] hover:brightness-110 focus:outline-none"
            >
              <span className="pointer-events-none contents">See all updates</span>
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="h-7 rounded-[7px] px-[10px] text-[11.5px] text-muted transition-colors hover:bg-hover hover:text-fg focus:outline-none"
            >
              <span className="pointer-events-none contents">Later</span>
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="mb-1 mt-[10px] text-[12px] leading-[1.55] text-fg">
            Responsively is free, open source, and built by volunteers. If it saves you time,
            consider chipping in to keep it going.
          </div>
          <div className="mb-3 text-[10.5px] text-muted">
            Shown at most once a month. Sponsors hide this forever.
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={sponsor}
              className="flex h-7 items-center gap-[6px] rounded-[7px] bg-heart px-3 text-[11.5px] font-bold text-on-heart transition-[filter] hover:brightness-105 focus:outline-none"
            >
              <span className="pointer-events-none contents">
                <Icon icon="lucide:heart" fontSize={12} />
                Sponsor
              </span>
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="h-7 rounded-[7px] px-[10px] text-[11.5px] text-muted transition-colors hover:bg-hover hover:text-fg focus:outline-none"
            >
              <span className="pointer-events-none contents">Maybe later</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AnnouncementCard;
