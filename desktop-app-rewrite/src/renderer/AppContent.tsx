import { Provider } from 'react-redux';

import AddressBar from './components/AddressBar';
import Previewer from './components/Previewer';
import { store } from './store';

import './App.css';

const AppContent = () => {
  return (
    <Provider store={store}>
      <div className="bg-gray-400">
        <div className="p-8">
          <AddressBar />
        </div>
        <Previewer />
      </div>
    </Provider>
  );
};
export default AppContent;
