import {Provider, useSelector} from 'react-redux';

import ToolBar from './components/ToolBar';
import Previewer from './components/Previewer';
import {store} from './store';

import './App.css';
import ThemeProvider from './context/ThemeProvider';
import DeviceManager from './components/DeviceManager';
import TitleBar from './components/TitleBar';
import StatusBar from './components/StatusBar';
import KeyboardShortcutsManager from './components/KeyboardShortcutsManager';
import {PREVIEW_LAYOUTS} from '../common/constants';
import {selectLayout} from './store/features/renderer';
import {selectIsPresenting} from './store/features/ui';
import McpBridge from './components/McpBridge';
import {ReleaseNotes} from './components/ReleaseNotes';
import {Sponsorship} from './components/Sponsorship';
import {AboutDialog} from './components/AboutDialog';

/** Present mode only applies while the canvas layout is active. */
const usePresenting = (): boolean => {
  const isPresenting = useSelector(selectIsPresenting);
  const layout = useSelector(selectLayout);
  return isPresenting && layout === PREVIEW_LAYOUTS.CANVAS;
};

const Browser = () => {
  const presenting = usePresenting();
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {presenting ? null : <ToolBar />}
      <div className="min-h-0 flex-1">
        <Previewer />
      </div>
      {presenting ? null : <StatusBar />}
    </div>
  );
};

/**
 * The Device Manager is a sheet over the stage, not a replacement view: the
 * previews stay mounted behind it (so closing it doesn't reload every
 * webview) and stay visible, as the design intends.
 */
const ViewComponent = () => (
  <div className="relative h-full">
    <Browser />
    <DeviceManager />
  </div>
);

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
