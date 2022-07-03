import { createRoot } from 'react-dom/client';
import App from './AppContent';

const container = document.getElementById('root')!;
const root = createRoot(container);

// calling IPC exposed from preload script
window.electron.ipcRenderer.once('ipc-example', (arg) => {
  // eslint-disable-next-line no-console
  console.log(arg);
});
window.electron.ipcRenderer.sendMessage('ipc-example', ['ping']);
window.electron.ipcRenderer.invoke('app-meta', []).then((arg: any) => {
  window.responsively = { webviewPreloadPath: arg.webviewPreloadPath };
  root.render(<App />);
});
