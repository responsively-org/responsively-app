import {IPC_MAIN_CHANNELS} from 'common/constants';
import {createRoot} from 'react-dom/client';
import App from './AppContent';

const container = document.getElementById('root')!;
const root = createRoot(container);

interface AppMeta {
  webviewPreloadPath: string;
  isE2E?: boolean;
  platform?: NodeJS.Platform;
}

window.electron.ipcRenderer
  .invoke<unknown, AppMeta>(IPC_MAIN_CHANNELS.APP_META, [])
  .then((arg: AppMeta) => {
    window.responsively = {
      webviewPreloadPath: arg.webviewPreloadPath,
      isE2E: Boolean(arg.isE2E),
      platform: arg.platform ?? 'darwin',
    };
    return root.render(<App />);
  })
  .catch((err) => {
    console.error(err);
  });
