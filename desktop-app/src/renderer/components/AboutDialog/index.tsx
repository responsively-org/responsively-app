import { useEffect, useRef, useState } from 'react';
import { IPC_MAIN_CHANNELS } from 'common/constants';
import { AboutDialogArgs } from 'main/menu/help';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import Icon from '../../assets/img/logo.png';
import Modal from '../Modal';
import Button from '../Button';

TimeAgo.addLocale(en);

const timeAgo = new TimeAgo('en-US');

export const AboutDialog = () => {
  const [show, setShow] = useState(false);
  const [args, setArgs] = useState<AboutDialogArgs | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const clearIntervalIfAvailable = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    const onOpenAboutDialog = (arg: AboutDialogArgs) => {
      setShow(true);
      setArgs(arg);
    };
    window.electron.ipcRenderer.on<AboutDialogArgs>(
      IPC_MAIN_CHANNELS.OPEN_ABOUT_DIALOG,
      onOpenAboutDialog
    );
    return () => {
      window.electron.ipcRenderer.removeListener(
        IPC_MAIN_CHANNELS.OPEN_ABOUT_DIALOG,
        onOpenAboutDialog
      );
    };
  }, []);

  useEffect(() => {
    if (show) {
      intervalRef.current = setInterval(() => {
        window.electron.ipcRenderer
          .invoke<null, AboutDialogArgs>('get-about-info')
          .then((arg: AboutDialogArgs) => {
            setArgs(arg);

            return arg;
          })
          .catch((err) => {
            // eslint-disable-next-line no-console
            console.error('Error while refreshing about info', err);
          });
      }, 1000);
    } else {
      clearIntervalIfAvailable();
    }
  }, [show]);

  return (
    <Modal
      isOpen={show}
      onClose={() => setShow(false)}
      title={
        <div className="flex flex-col items-center justify-center">
          <img src={Icon} alt="Logo" width={48} className="pb-2" />
          <div className="text-2xl">Responsively App</div>
          <div className="text-base text-gray-500">
            A dev-tool that aids faster and precise responsive web development.
          </div>
        </div>
      }
    >
      <div className="flex flex-col items-center gap-6 pt-6 text-gray-700 dark:text-gray-300">
        <div className="flex w-3/4 flex-col gap-2 rounded border border-slate-300 p-4 dark:border-slate-700">
          <div className="flex justify-center text-lg">Versions</div>
          <div className="flex flex-col gap-[2px]">
            <div className="flex  justify-between">
              <span>App</span>
              <span className="text-sm">
                v{args?.environmentInfo.appVersion}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Electron</span>
              <span className="text-sm">
                v{args?.environmentInfo.electronVersion}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Chrome</span>
              <span className="text-sm">
                v{args?.environmentInfo.chromeVersion}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Node.js</span>
              <span className="text-sm">
                v{args?.environmentInfo.nodeVersion}
              </span>
            </div>
            <div className="flex justify-between">
              <span>V8</span>
              <span className="text-sm">
                v{args?.environmentInfo.v8Version}
              </span>
            </div>
            <div className="flex justify-between">
              <span>OS</span>
              <span className="text-sm">{args?.environmentInfo.osInfo}</span>
            </div>
          </div>
          <div className="mt-2 flex justify-center">
            <Button
              isActive
              isTextButton
              className="w-fit"
              onClick={async () => {
                window.electron.ipcRenderer.invoke<string, void>(
                  'copy-to-clipboard',
                  `App Version: ${args?.environmentInfo.appVersion}\nElectron Version: ${args?.environmentInfo.electronVersion}\nChrome Version: ${args?.environmentInfo.chromeVersion}\nNode.js Version: ${args?.environmentInfo.nodeVersion}\nV8 Version: ${args?.environmentInfo.v8Version}\nOS: ${args?.environmentInfo.osInfo}`
                );
              }}
            >
              Copy
            </Button>
          </div>
        </div>
        <div className="flex w-3/4 flex-col gap-4 rounded border border-slate-300 p-4 dark:border-slate-700">
          <div className="flex justify-center text-lg">Update Status</div>
          <div className="flex flex-col gap-[2px]">
            <div className="flex  justify-between">
              <span>Status</span>
              <span className="text-sm capitalize">
                {args?.updaterStatus.status.toLocaleLowerCase()}
              </span>
            </div>
            {args?.updaterStatus.version != null ? (
              <div className="flex justify-between">
                <span>New Version</span>
                <span className="text-sm">{args?.updaterStatus.version}</span>
              </div>
            ) : null}
            {args?.updaterStatus.error != null ? (
              <div className="flex justify-between">
                <span>Error</span>
                <span className="w-1/2 overflow-auto text-sm">
                  {args?.updaterStatus.error.message}
                </span>
              </div>
            ) : null}
            <div className="flex justify-between">
              <span>Last Checked</span>
              <span className="text-sm">
                {args?.updaterStatus.lastChecked != null
                  ? timeAgo.format(args?.updaterStatus.lastChecked)
                  : 'NA'}
              </span>
            </div>
          </div>
        </div>
        <Button isPrimary isTextButton onClick={() => setShow(false)}>
          Close
        </Button>
      </div>
    </Modal>
  );
};
