import React from 'react';
import './App.css';
import DevicesPreviewer from './components/DevicesPreviewer';
import Header from './components/Header';
import {DEVICES} from './commons/constants';

function App() {
  const urlParam = Array.from(new URLSearchParams(window.location.search.slice(1)).entries()).filter(([key]) => key === 'url')[0];
  return (
    <div className="App">
      <Header />
      <DevicesPreviewer devices={DEVICES} url={urlParam ? urlParam[1] : null} />
    </div>
  );
}

export default App;
