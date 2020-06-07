// based on https://github.com/beakerbrowser/electron-localshortcut/blob/master/index.js
// modified by @jjavierdguezas
// added numpad support

import {app, BrowserWindow, webContents} from 'electron';
import {toKeyEvent} from './keyboardevent-from-electron-accelerator';
import {isAccelerator} from './electron-is-accelerator';
const equals = require('keyboardevents-areequal');

// globals
// =

let isWatchingWCCreation = false;
const registeredWindowWCs = new Map(); // map of webContents -> shortcuts

// exported api
// =

module.exports = {
  register,
  unregister,
  unregisterAll,
  enableAll,
  disableAll
};

function register (win, accelerator, callback) {
  // sanity checks
  if (win.isDestroyed()) return;
  checkAccelerator(accelerator);

  // listen to web-contents creations if needed
  watchWCCreation();

  // create shortcuts for the window
  const windowWC = win.webContents;
  let shortcuts = registeredWindowWCs.get(windowWC);
  if (!shortcuts) shortcuts = startTracking(windowWC);

  // add the shortcut
  shortcuts.push({
    eventStamp: toKeyEvent(accelerator),
    callback,
    enabled: true
  });
}

function unregister (win, accelerator) {
  // sanity checks
  if (win.isDestroyed()) return;
  checkAccelerator(accelerator);

  const windowWC = win.webContents;
  if (!registeredWindowWCs.has(windowWC)) {
    return; // no shortcuts registered, abort
  }

  // remove the shortcut
  const keyEvent = toKeyEvent(accelerator);
  const shortcuts = registeredWindowWCs.get(windowWC);
  const shortcutIdx = shortcuts.findIndex(shortcut => equals(shortcut.eventStamp, keyEvent));
  if (shortcutIdx !== -1) shortcuts.splice(shortcutIdx, 1);

  // stop tracking the window if done
  if (shortcuts.length === 0) {
    stopTracking(windowWC);
  }
}

function unregisterAll (win) {
  // sanity checks
  if (win.isDestroyed()) return;

  const windowWC = win.webContents;
  if (!registeredWindowWCs.has(windowWC)) {
    return; // no shortcuts registered, abort
  }

  // stop tracking the window
  stopTracking(windowWC);
}

function enableAll (win) {
  const windowWC = win.webContents;
  const shortcuts = registeredWindowWCs.get(windowWC);
  for (let shortcut of shortcuts) {
    shortcut.enabled = true;
  }
}

function disableAll (win) {
  const windowWC = win.webContents;
  const shortcuts = registeredWindowWCs.get(windowWC);
  for (let shortcut of shortcuts) {
    shortcut.enabled = false;
  }
}

// internal methods
// =

function checkAccelerator (accelerator) {
  if (!isAccelerator(accelerator)) {
    throw new Error(`${accelerator} is not a valid accelerator`);
  }
  return true;
}

function normalizeEvent (input) {
  const normalizedEvent = {
    code: input.code,
    key: input.key
  };

  for (let prop of ['alt', 'shift', 'meta']) {
    if (typeof input[prop] !== 'undefined') {
      normalizedEvent[`${prop}Key`] = input[prop];
    }
  }

  if (typeof input.control !== 'undefined') {
    normalizedEvent.ctrlKey = input.control;
  }

  return normalizedEvent;
}

function watchWCCreation () {
  if (isWatchingWCCreation) return;
  isWatchingWCCreation = true;

  // when a new web-contents is created, register before-input-event as needed
  app.on('web-contents-created', (e, wc) => {
    for (let [windowWC, shortcuts] of registeredWindowWCs) {
      if (isWindowWC(windowWC, wc)) {
        wc.on('before-input-event', shortcuts.onBeforeInputEvent);
      }
    }
  });
}

function isWindowWC (windowWC, wc) {
  if (windowWC === wc) return true;
  if (windowWC === wc.hostWebContents) return true;
  return false;
}

function startTracking (windowWC) {
  const shortcuts = [];
  registeredWindowWCs.set(windowWC, shortcuts);

  // create event handler
  shortcuts.onBeforeInputEvent = (e, input) => {
    if (input.type === 'keyUp') return;
    const event = normalizeEvent(input);
    for (let {eventStamp, callback} of shortcuts) {
      if (equals(eventStamp, event)) {
        callback();
        return;
      }
    }
  }

  // register on all of the window's webContents
  for (let wc of webContents.getAllWebContents()) {
    if (isWindowWC(windowWC, wc)) {
      wc.on('before-input-event', shortcuts.onBeforeInputEvent);
    }
  }

  return shortcuts;
}

function stopTracking (windowWC) {
  const shortcuts = registeredWindowWCs.get(windowWC);
  for (let wc of webContents.getAllWebContents()) {
    if (isWindowWC(windowWC, wc)) {
      wc.removeListener('before-input-event', shortcuts.onBeforeInputEvent);
    }
  }
  registeredWindowWCs.delete(windowWC);
}