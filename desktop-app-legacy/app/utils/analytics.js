import {app} from 'electron';
import path from 'path';
import ua from 'universal-analytics';
import {v4 as uuidv4} from 'uuid';
import fs from 'fs-extra';

const isDev = process.env.NODE_ENV !== 'production';
let uid = null;
let appActive = false;

try {
  const filePath = path.join(app.getPath('userData'), 'uid');
  try {
    uid = fs.readFileSync(filePath, 'utf-8');
  } catch (err) {}
  if (!uid) {
    uid = uuidv4();
    fs.writeFileSync(filePath, uid);
  }
} catch (err) {
  console.log('Error initializing analytics', err);
}

const visitor = ua('UA-150751006-1', uid);

export const startSession = () => {
  appActive = true;
  if (isDev) {
    return;
  }
  visitor.event({ec: 'App', ea: 'Open', sessionControl: 'start'}).send();
};

export const endSession = () => {
  appActive = false;
  if (isDev) {
    return;
  }
  visitor.event({ec: 'App', ea: 'Close', sessionControl: 'end'}).send();
};

export const sendEvent = (ec, ea) => !isDev && visitor.event({ec, ea}).send();

setInterval(() => {
  if (!appActive) {
    return;
  }
  sendEvent('App', 'Ping');
}, 20000);
