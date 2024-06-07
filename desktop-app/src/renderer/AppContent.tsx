import { Provider, useSelector } from 'react-redux';

import ToolBar from './components/ToolBar';
import Previewer from './components/Previewer';
import { store } from './store';

import './App.css';
import ThemeProvider from './context/ThemeProvider';
import type { AppView } from './store/features/ui';
import { APP_VIEWS, selectAppView } from './store/features/ui';
import DeviceManager from './components/DeviceManager';
import KeyboardShortcutsManager from './components/KeyboardShortcutsManager';
import { ReleaseNotes } from './components/ReleaseNotes';
import { Sponsorship } from './components/Sponsorship';
import { AboutDialog } from './components/AboutDialog';

if ((navigator as any).userAgentData.platform === 'Windows') {
  import('./titlebar-styles.css');
}

const Browser = () => {
  return (
    <div className="h-screen gap-2 overflow-hidden pt-2">
      <ToolBar />
      <Previewer />
    </div>
  );
};

const getView = (appView: AppView) => {
  switch (appView) {
    case APP_VIEWS.BROWSER:
      return <Browser />;
    case APP_VIEWS.DEVICE_MANAGER:
      return <DeviceManager />;
    default:
      return <Browser />;
  }
};

const ViewComponent = () => {
  const appView = useSelector(selectAppView);

  return <>{getView(appView)}</>;
};

const AppContent = () => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <KeyboardShortcutsManager />
        <ViewComponent />
        <ReleaseNotes />
        <Sponsorship />
        <AboutDialog />
      </ThemeProvider>
    </Provider>
  );
};
export default AppContent;
