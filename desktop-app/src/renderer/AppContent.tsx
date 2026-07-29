import {Provider, useSelector} from 'react-redux';

import ToolBar from './components/ToolBar';
import Previewer from './components/Previewer';
import {store} from './store';

import './App.css';
import ThemeProvider from './context/ThemeProvider';
import type {AppView} from './store/features/ui';
import {APP_VIEWS, selectAppView} from './store/features/ui';
import DeviceManager from './components/DeviceManager';
import TitleBar from './components/TitleBar';
import KeyboardShortcutsManager from './components/KeyboardShortcutsManager';
import McpBridge from './components/McpBridge';
import {ReleaseNotes} from './components/ReleaseNotes';
import {Sponsorship} from './components/Sponsorship';
import {AboutDialog} from './components/AboutDialog';

const Browser = () => {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ToolBar />
      <div className="min-h-0 flex-1">
        <Previewer />
      </div>
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
        <McpBridge />
        {/* The window is frameless: the title bar is ours, and the rest of
            the shell fills what's left of the viewport. */}
        <div className="flex h-screen flex-col overflow-hidden">
          <TitleBar />
          {/* The shell itself never scrolls — a scroll container wrapping the
              previews would add a compositing layer around every webview.
              Long views (Device Manager) own their scrolling instead. */}
          <div className="min-h-0 flex-1 overflow-hidden">
            <ViewComponent />
          </div>
        </div>
        <ReleaseNotes />
        <Sponsorship />
        <AboutDialog />
      </ThemeProvider>
    </Provider>
  );
};
export default AppContent;
