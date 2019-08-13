const {ipcRenderer} = require('electron');
console.log('Preloader');
global.responsivelyApp = {
  sendMessageToHost: (type, message) => ipcRenderer.sendToHost(type, message),
};

ipcRenderer.on('scroll', (event, args) => {
  console.log('Recieved scroll message from host', event, args);
  window.scrollTo({
    top: args.y,
    left: args.x,
    behavior: 'smooth',
  });
});
