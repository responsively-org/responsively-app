import {Provider, useDispatch, useSelector} from 'react-redux';
import {useCallback, useEffect} from 'react';

import ToolBar from './components/ToolBar';
import Previewer from './components/Previewer';
import FindBar from './components/FindBar';
import {store} from './store';

import './App.css';
import ThemeProvider from './context/ThemeProvider';
import type {AppView} from './store/features/ui';
import {APP_VIEWS, selectAppView} from './store/features/ui';
import DeviceManager from './components/DeviceManager';
import KeyboardShortcutsManager from './components/KeyboardShortcutsManager';
import {ReleaseNotes} from './components/ReleaseNotes';
import {Sponsorship} from './components/Sponsorship';
import {AboutDialog} from './components/AboutDialog';
import useKeyboardShortcut, {
  SHORTCUT_CHANNEL,
} from './components/KeyboardShortcutsManager/useKeyboardShortcut';
import {openFindBar, selectFindTextIsOpen} from './store/features/find-text';

const Browser = () => {
  const dispatch = useDispatch();
  const findBarOpen = useSelector(selectFindTextIsOpen);

  const handleFindShortcut = useCallback(() => {
    if (!findBarOpen) {
      dispatch(openFindBar());
    }
  }, [dispatch, findBarOpen]);

  useKeyboardShortcut(SHORTCUT_CHANNEL.FIND_TEXT, handleFindShortcut);

  // Listen for toggle-find-bar from main process menu
  useEffect(() => {
    const removeListener = window.electron.ipcRenderer.on('toggle-find-bar', () => {
      dispatch(openFindBar());
    });
    return () => {
      removeListener?.();
    };
  }, [dispatch]);

  return (
    <div className="h-screen gap-2 overflow-hidden pt-2">
      <ToolBar />
      <div className="relative h-full">
        <FindBar />
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
        <ViewComponent />
        <ReleaseNotes />
        <Sponsorship />
        <AboutDialog />
      </ThemeProvider>
    </Provider>
  );
};
export default AppContent;
