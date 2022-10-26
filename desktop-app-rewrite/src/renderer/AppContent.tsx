import { Provider, useSelector } from 'react-redux';

import ToolBar from './components/ToolBar';
import Previewer from './components/Previewer';
import { store } from './store';

import './App.css';
import ThemeProvider from './context/ThemeProvider';
import { APP_VIEWS, selectAppView } from './store/features/ui';
import type { AppView } from './store/features/ui';
import DeviceManager from './components/DeviceManager';

const Browser = () => {
  return (
    <div className="h-full gap-2 overflow-hidden pt-2">
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
        <ViewComponent />
      </ThemeProvider>
    </Provider>
  );
};
export default AppContent;
