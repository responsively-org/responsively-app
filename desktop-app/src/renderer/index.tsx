import {IPC_MAIN_CHANNELS} from 'common/constants';
import {createRoot} from 'react-dom/client';
import App from './AppContent';

const container = document.getElementById('root')!;
const root = createRoot(container);

window.electron.ipcRenderer
  .invoke<unknown, {webviewPreloadPath: string; isE2E?: boolean}>(IPC_MAIN_CHANNELS.APP_META, [])
  .then((arg: {webviewPreloadPath: string; isE2E?: boolean}) => {
    window.responsively = {
      webviewPreloadPath: arg.webviewPreloadPath,
      isE2E: Boolean(arg.isE2E),
    };
    return root.render(<App />);
  })
  .catch((err) => {
    console.error(err);
  });
