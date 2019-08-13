const {ipcRenderer} = require('electron');
console.log('Preloader');
global.responsivelyApp = {
  sendMessageToHost: (type, message) =>
    ipcRenderer.sendToHost(type, JSON.stringify(message)),
};
