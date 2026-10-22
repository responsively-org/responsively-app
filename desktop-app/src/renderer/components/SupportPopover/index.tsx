import {Icon} from '@iconify/react';
import {IPC_MAIN_CHANNELS} from 'common/constants';
import {useRef, useState} from 'react';
import {openSponsorPage} from 'renderer/components/Notifications/Notifications';
import Popover from 'renderer/components/Popover';

const PROJECT_URL = 'https://github.com/responsively-org/responsively-app';
const SHARE_URL = 'https://responsively.app';

const SupportPopover = () => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'copied' | 'error'>('idle');
  const copyRequest = useRef(0);

  const copyLink = async () => {
    const request = ++copyRequest.current;
    setCopyStatus('copying');
    try {
      await window.electron.ipcRenderer.invoke(IPC_MAIN_CHANNELS.COPY_TO_CLIPBOARD, SHARE_URL);
      if (request === copyRequest.current) {
        setCopyStatus('copied');
      }
    } catch {
      if (request === copyRequest.current) {
        setCopyStatus('error');
      }
    }
  };

  const shareDescription = {
    idle: 'Copy a link to Responsively',
    copying: 'Copying link…',
    copied: 'Link copied!',
    error: 'Could not copy. Try again.',
  }[copyStatus];

  return (
    <Popover
      triggerTitle="Support Responsively"
      anchor="top end"
      triggerClassName="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-md text-[15px] text-muted transition-colors hover:bg-hover hover:text-fg"
      className="w-[260px] max-w-[calc(100vw-24px)] p-[14px]"
      onOpenChange={() => {
        // A previous panel session must not overwrite feedback after reopening.
        copyRequest.current += 1;
        setCopyStatus('idle');
      }}
      trigger={
        <span className="pointer-events-none inline-flex">
          <Icon icon="lucide:heart" />
          <span className="sr-only">Support Responsively</span>
        </span>
      }
    >
      <div className="mb-2 flex items-center gap-2 rounded-lg bg-heart-soft px-[10px] py-2">
        <Icon icon="lucide:heart" fontSize={13} className="shrink-0 text-heart" />
        <span className="text-[12.5px] font-bold text-fg">Enjoying Responsively?</span>
      </div>
      <div className="flex flex-col">
        <button
          type="button"
          aria-label="Sponsor"
          onClick={() => openSponsorPage('support-popover')}
          className="flex items-center gap-[10px] rounded-md px-2 py-2 text-left transition-colors hover:bg-heart-soft focus:outline-none focus-visible:ring-1 focus-visible:ring-heart"
        >
          <Icon icon="lucide:heart" fontSize={15} className="shrink-0 text-heart" />
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-bold text-heart">Sponsor</span>
            <span className="block text-[11.5px] leading-[1.45] text-muted">
              Support development
            </span>
          </span>
          <Icon icon="lucide:arrow-up-right" fontSize={13} className="text-muted" />
        </button>
        <div className="my-1 border-t border-line-soft" />
        <button
          type="button"
          aria-label="Star on GitHub"
          onClick={() =>
            window.electron.ipcRenderer.sendMessage(IPC_MAIN_CHANNELS.OPEN_EXTERNAL, {
              url: PROJECT_URL,
            })
          }
          className="flex items-center gap-[10px] rounded-md px-2 py-2 text-left transition-colors hover:bg-hover focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
        >
          <Icon icon="lucide:star" fontSize={15} className="shrink-0 text-muted" />
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-bold text-fg">Star</span>
            <span className="block text-[11.5px] leading-[1.45] text-muted">Star us on GitHub</span>
          </span>
          <Icon icon="lucide:arrow-up-right" fontSize={13} className="text-muted" />
        </button>
        <button
          type="button"
          aria-label="Share Responsively"
          disabled={copyStatus === 'copying'}
          onClick={() => void copyLink()}
          className="flex items-center gap-[10px] rounded-md px-2 py-2 text-left transition-colors hover:bg-hover focus:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:cursor-wait"
        >
          <Icon
            icon={copyStatus === 'copied' ? 'lucide:check' : 'lucide:share-2'}
            fontSize={15}
            className="shrink-0 text-muted"
          />
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-bold text-fg">Share</span>
            <span role="status" className="block text-[11.5px] leading-[1.45] text-muted">
              {shareDescription}
            </span>
          </span>
          <Icon icon="lucide:copy" fontSize={13} className="text-muted" />
        </button>
      </div>
    </Popover>
  );
};

export default SupportPopover;
