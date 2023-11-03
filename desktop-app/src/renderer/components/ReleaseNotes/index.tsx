import { IPC_MAIN_CHANNELS } from 'common/constants';
import cx from 'classnames';
import { AppMetaResponse } from 'main/app-meta';
import { useCallback, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import Button from '../Button';
import Modal from '../Modal';

export const isReleaseNotesUnseen = async () => {
  const appMeta = await window.electron.ipcRenderer.invoke<
    object,
    AppMetaResponse
  >(IPC_MAIN_CHANNELS.APP_META, {});
  const seenVersions = window.electron.store.get('seenReleaseNotes');
  if (seenVersions && seenVersions.includes(appMeta.appVersion)) {
    return false;
  }
  if (!seenVersions || seenVersions.length === 0) {
    // First time user, so we don't show release notes
    window.electron.store.set('seenReleaseNotes', [appMeta.appVersion]);
    return false;
  }
  return true;
};

export const ReleaseNotes = () => {
  const [version, setVersion] = useState<string>('');
  const [content, setContent] = useState<string | undefined>();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      if (!isReleaseNotesUnseen()) {
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const appMeta = await window.electron.ipcRenderer.invoke<
        object,
        AppMetaResponse
      >(IPC_MAIN_CHANNELS.APP_META, {});
      setVersion(appMeta.appVersion);
      const release = await fetch(
        `https://api.github.com/repos/responsively-org/responsively-app/releases/tags/v${appMeta.appVersion}`
      ).then((res) => res.json());
      try {
        setContent(
          release.body
            .replace(`What's Changed`, ``)
            .replaceAll(/(https[^\n ]*)/g, `[$1]($1)`)
            .replaceAll(/\*\*Full.*/g, ``)
            .replaceAll(/@(\w+)/g, '[@$1](https://github.com/$1)')
            .trim()
        );
        setIsOpen(true);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error while fetching release notes', error);
      }
    })();
  }, []);

  const closeAndMarkAsRead = useCallback(() => {
    window.electron.store.set('seenReleaseNotes', [
      ...window.electron.store.get('seenReleaseNotes'),
      version,
    ]);
    setIsOpen(false);
  }, [version]);

  if (content === undefined) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeAndMarkAsRead}
      title={
        <span className="pl-2">
          What&apos;s New in <span className="font-bold">v{version}</span>{' '}
          &nbsp;&nbsp;🎉
        </span>
      }
    >
      <>
        <div className="prose dark:prose-invert lg:prose-xl">
          <ReactMarkdown
            components={{
              a: ({ node, className, children, ...props }) => {
                return (
                  // eslint-disable-next-line jsx-a11y/interactive-supports-focus, jsx-a11y/click-events-have-key-events
                  <a
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                    onClick={(e) => {
                      if (!(e.target instanceof HTMLAnchorElement)) {
                        return;
                      }
                      e.preventDefault();
                      window.electron.ipcRenderer.sendMessage(
                        IPC_MAIN_CHANNELS.OPEN_EXTERNAL,
                        {
                          url: e.target.href,
                        }
                      );
                    }}
                    role="link"
                    className={cx('outline-none')}
                  >
                    {children}
                  </a>
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
        <div className="mt-10 flex justify-between gap-12">
          <div className="flex gap-1">
            <Button
              onClick={() => {
                window.electron.ipcRenderer.sendMessage(
                  IPC_MAIN_CHANNELS.OPEN_EXTERNAL,
                  {
                    url: `https://github.com/responsively-org/responsively-app/releases/tag/v${version}`,
                  }
                );
                closeAndMarkAsRead();
              }}
              tabIndex={0}
              isActionButton
              isTextButton
            >
              Release Notes
            </Button>
            <Button onClick={closeAndMarkAsRead} isActionButton isTextButton>
              Close
            </Button>
          </div>

          <Button
            onClick={() => {
              window.electron.ipcRenderer.sendMessage(
                IPC_MAIN_CHANNELS.OPEN_EXTERNAL,
                {
                  url: 'https://responsively.app/sponsor?utm_source=app&utm_medium=release_notes&utm_campaign=sponsor',
                }
              );
            }}
            isPrimary
            isTextButton
          >
            Support Responsively App
          </Button>
        </div>
      </>
    </Modal>
  );
};
