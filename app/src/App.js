import React from 'react';
import logo from './logo.svg';
import './App.css';
import DevicesPreviewer from './components/DevicesPreviewer';
import BrowserZoom from './components/BrowserZoom';
import {DEVICES} from './commons/constants';

function App() {
  const urlParam = Array.from(new URLSearchParams(window.location.search.slice(1)).entries()).filter(([key]) => key === 'url')[0];
  return (
    <div className="App">
      <header className="App-header">
       <div>Vicous <BrowserZoom /></div>
       <DevicesPreviewer devices={DEVICES} url={urlParam ? urlParam[1] : null} />
      </header>
      
    </div>
  );
}

export default App;
