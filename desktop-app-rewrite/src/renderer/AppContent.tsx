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
        <div className="">
          <div className="p-8">
            <AddressBar />
          </div>
          <Previewer />
        </div>
      </ThemeProvider>
    </Provider>
  );
};
export default AppContent;
