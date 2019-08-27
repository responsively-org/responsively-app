const {ipcRenderer} = require('electron');
const DomInspector = require('../lib/dom-inspector');

global.responsivelyApp = {
  sendMessageToHost: (type, message) => {
    if (!message) {
      message = {};
    }
    message.sourceDeviceId = window.responsivelyApp.deviceId;
    ipcRenderer.sendToHost(type, message);
  },
  cssPath: el => {
    if (!(el instanceof Element)) return;
    var path = [];
    while (el.nodeType === Node.ELEMENT_NODE) {
      var selector = el.nodeName.toLowerCase();
      var sib = el,
        nth = 1;
      while (
        sib.nodeType === Node.ELEMENT_NODE &&
        (sib = sib.previousElementSibling) &&
        nth++
      );
      selector += ':nth-child(' + nth + ')';
      path.unshift(selector);
      el = el.parentNode;
    }
    return path.join(' > ');
  },
  eventFire: (el, etype) => {
    if (el.fireEvent) {
      el.fireEvent('on' + etype);
    } else {
      var evObj = document.createEvent('Events');
      evObj.initEvent(etype, true, false);
      evObj.responsivelyAppProcessed = true;
      el.dispatchEvent(evObj);
    }
  },
  DomInspector: DomInspector,
};

ipcRenderer.on('scrollMessage', (event, args) => {
  console.log('Recieved scroll message from host', event, args);
  window.scrollTo({
    top: args.y,
    left: args.x,
  });
});

ipcRenderer.on('clickMessage', (event, args) => {
  console.log('Recieved click message from host', event, args);
  const elem = document.querySelector(args.cssPath);
  if (!elem) {
    console.log('Element to click is not found', args);
    return;
  }
  window.responsivelyApp.lastClickElement = elem;
  if (elem.click) {
    elem.click();
    return;
  }
  window.responsivelyApp.eventFire(elem, 'click');
});

ipcRenderer.on('scrollDownMessage', (event, args) => {
  console.log('Recieved click message from host', event, args);
  window.scrollTo({
    top: window.scrollY + 250,
    left: window.scrollX + 250,
    behavior: 'smooth',
  });
});

ipcRenderer.on('scrollUpMessage', (event, args) => {
  console.log('Recieved click message from host', event, args);
  window.scrollTo({
    top: window.scrollY - 250,
    left: window.scrollX - 250,
    behavior: 'smooth',
  });
});

ipcRenderer.on('enableInspectorMessage', (event, args) => {
  console.log('Recieved enableInpector message from host', event, args);
  window.responsivelyApp.domInspector.enable();
  window.responsivelyApp.domInspectorEnabled = true;
});

ipcRenderer.on('disableInspectorMessage', (event, args) => {
  console.log('Recieved disableInspector message from host', event, args);
  window.responsivelyApp.domInspector.disable();
  window.responsivelyApp.domInspectorEnabled = false;
});
