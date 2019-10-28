const {ipcRenderer, remote} = require('electron');
const DomInspector = require('../lib/dom-inspector');

const Menu = remote.Menu;
const MenuItem = remote.MenuItem;

var menu = new Menu();
var rightClickPosition = null;

menu.append(
  new MenuItem({
    label: 'Take Screenshot',
    click: function(menuItem, browserWindow, event) {
      window.responsivelyApp.sendMessageToHost('takeScreenshot');
    },
  })
);
menu.append(
  new MenuItem({
    label: 'Tilt Device',
    click: function(menuItem, browserWindow, event) {
      window.responsivelyApp.sendMessageToHost('tiltDevice');
    },
  })
);
menu.append(
  new MenuItem({
    id: 'mirror-events',
    label: 'Mirror Events',
    type: 'checkbox',
    checked: true,
    click: function(menuItem, browserWindow, event) {
      window.responsivelyApp.sendMessageToHost('toggleEventMirroring');
    },
  })
);

menu.append(new MenuItem({type: 'separator'}));

menu.append(
  new MenuItem({
    label: 'Inspect',
    click: function(menuItem, browserWindow, event) {
      window.responsivelyApp.sendMessageToHost(
        'openDevToolsInspector',
        rightClickPosition
      );
    },
  })
);
menu.append(
  new MenuItem({
    label: 'Open console',
    click: function(menuItem, browserWindow, event) {
      window.responsivelyApp.sendMessageToHost('openConsole');
    },
  })
);

window.addEventListener(
  'contextmenu',
  function(e) {
    e.preventDefault();
    rightClickPosition = {x: e.x, y: e.y};
    menu.popup(remote.getCurrentWindow());
  },
  false
);

global.responsivelyApp = {
  DomInspector: DomInspector,
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
  hideFixedPositionElementsForScreenshot: () => {
    const elems = document.body.getElementsByTagName('*');
    for (const elem of elems) {
      const computedStyle = window.getComputedStyle(elem, null);
      if (computedStyle.getPropertyValue('position') == 'fixed') {
        elem.classList.add('responsivelyApp__HiddenForScreenshot');
      }
    }
  },
  unHideElementsHiddenForScreenshot: () => {
    const elems = document.body.querySelectorAll(
      '.responsivelyApp__HiddenForScreenshot'
    );
    for (const elem of elems) {
      elem.classList.remove('responsivelyApp__HiddenForScreenshot');
    }
  },
};

ipcRenderer.on('scrollMessage', (event, args) => {
  window.scrollTo({
    top: args.y,
    left: args.x,
  });
});

ipcRenderer.on('clickMessage', (event, args) => {
  const elem = document.querySelector(args.cssPath);
  if (!elem) {
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
  window.scrollTo({
    top: window.scrollY + 250,
    left: window.scrollX + 250,
    behavior: 'smooth',
  });
});

ipcRenderer.on('scrollUpMessage', (event, args) => {
  window.scrollTo({
    top: window.scrollY - 250,
    left: window.scrollX - 250,
    behavior: 'smooth',
  });
});

ipcRenderer.on('enableInspectorMessage', (event, args) => {
  responsivelyApp.domInspector = new responsivelyApp.DomInspector();
  window.responsivelyApp.domInspector.enable();
  window.responsivelyApp.domInspectorEnabled = true;
});

ipcRenderer.on('disableInspectorMessage', (event, args) => {
  window.responsivelyApp.domInspector.destroy();
  window.responsivelyApp.domInspector = null;
  window.responsivelyApp.domInspectorEnabled = false;
});

ipcRenderer.on('eventsMirroringState', (event, args) => {
  menu.getMenuItemById('mirror-events').checked = args;
});
