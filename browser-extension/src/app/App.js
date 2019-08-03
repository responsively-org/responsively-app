import "core-js/stable";
import "regenerator-runtime/runtime";

import React from 'react';
import './App.css';
import DevicesPreviewer from './components/DevicesPreviewer';
import Header from './components/Header';
import {setURL} from './commons/postMan';
import {DEVICES} from './commons/constants';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      initialized: false,
    }
  }

  async componentDidMount() {
    const urlParam = Array.from(new URLSearchParams(window.location.search.slice(1)).entries()).filter(([key]) => key === 'url')[0];
    if (!urlParam) {
      return;
    }
    await setURL(urlParam[1]);
    this.setState({initialized: true, url: urlParam[1]});
  }

  render() {
    if (!this.state.initialized) {
      return 'Loading';
    }
    return (
      <div className="App">
        <Header />
        <DevicesPreviewer devices={DEVICES} url={this.state.url} />
      </div>
    );
  }
}

export default App;
