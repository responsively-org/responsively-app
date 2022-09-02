import { Provider } from 'react-redux';

import AddressBar from './components/AddressBar';
import Previewer from './components/Previewer';
import { store } from './store';

import './App.css';
import ThemeProvider from './context/ThemeProvider';

const AppContent = () => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <div className="gap-2 p-2">
          <AddressBar />
          <Previewer />
        </div>
      </ThemeProvider>
    </Provider>
  );
};
export default AppContent;
