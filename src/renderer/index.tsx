import { IPC_MAIN_CHANNELS } from 'common/constants';
import { createRoot } from 'react-dom/client';
import App from './AppContent';

const container = document.getElementById('root')!;
const root = createRoot(container);

window.electron.ipcRenderer
  .invoke(IPC_MAIN_CHANNELS.APP_META, [])
  .then((arg: any) => {
    window.responsively = { webviewPreloadPath: arg.webviewPreloadPath };
    return root.render(<App />);
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
  });
