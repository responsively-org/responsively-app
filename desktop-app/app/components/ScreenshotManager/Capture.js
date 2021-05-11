// @flow

import React from 'react';
import type {Data} from './types';
import WebViewUtils from './screenShotUtils';
import FileSystemUtils from '../../utils/file-system';
import {userPreferenceSettings} from '../../settings/userPreferenceSettings';
import {toast} from 'react-toastify';
import NotificationMessage from '../NotificationMessage';
import {
  SCREENSHOT_IN_PROGRESS,
  TOGGLE_EVENT_MIRRORING_ALL_DEVICES,
} from '../../constants/pubsubEvents';
import pubsub from 'pubsub.js';
import {
  convertNativeImageToJPEG,
  convertURIImageToBuffer,
} from '../../utils/imageUtils';
import {_delay} from './functionUtils';

function sortWebViewsByDeviceIds(
  webViews: NodeList<WebviewElement>,
  devices: Array<{id: number}>,
  selectedDevices
): Array<any> {
  const hashTable = new Map<number, number>();
  const sorted = new Array(devices.length).fill(null);

  for (let i = 0; i < devices.length; i += 1) {
    hashTable.set(devices[i].id, i);
  }

  for (let i = 0; i < webViews.length; i += 1) {
    const id = webViews[i].id;
    if (hashTable.has(id)) {
      const index = hashTable.get(id);
      sorted[index] = webViews[i];
    }
  }
  const selected = [];
  for (let i = 0; i < sorted.length; i += 1) {
    if (selectedDevices[i].selected) {
      selected.push(sorted[i]);
    }
  }
  return selected;
}

export default async function Capture(data: Data) {
  const {
    now,
    devices,
    selectedDevices: {deviceChecks, isMergeImages},
  } = data;

  // get All web views
  const webViews = document.querySelectorAll('webview');

  // sort web views based on devices order
  const sortedWebViews = sortWebViewsByDeviceIds(
    webViews,
    devices,
    deviceChecks
  );

  // get user preference path
  const {
    getDefaultScreenshotpath,
    getScreenShotSavePath,
  } = userPreferenceSettings;
  const defaultPath = getDefaultScreenshotpath();
  const path = getScreenShotSavePath();
  if (!sortedWebViews.length) return;

  // remove event mirroring between web views
  pubsub.publish(TOGGLE_EVENT_MIRRORING_ALL_DEVICES, [{status: false}]);
  // set loader in each webview
  pubsub.publish(SCREENSHOT_IN_PROGRESS, [{isInProgress: true}]);
  // store image objects
  const images = [];
  // device names
  const deviceNames = [];

  // get web address of Web views
  const address = sortedWebViews[0].getURL();

  const fsUtils = new FileSystemUtils(path, defaultPath, now, address);

  for (let i = 0; i < sortedWebViews.length; i += 1) {
    const toastId = showNotification(
      'start Capturing',
      false,
      true,
      false,
      null
    );
    try {
      const currentView = sortedWebViews[i];
      currentView.scrollIntoView();
      showNotification(
        `Capturing ${devices[i].name}`,
        false,
        true,
        false,
        'info',
        toastId
      );
      const webUtils = new WebViewUtils(currentView);
      const image = await webUtils.captureWithRetry();
      images.push(image);

      const jpg = convertNativeImageToJPEG(image);
      const deviceName = deviceChecks[i].name;
      deviceNames.push(deviceName);
      await fsUtils.writeImageToFile(jpg, deviceName, 'jpg');
      showNotification(
        `captured and saved: ${devices[i].name}`,
        false,
        false,
        true,
        'success',
        toastId
      );
    } catch (error) {
      showNotification(
        `${error.message}: ${devices[i].name}`,
        false,
        false,
        false,
        'error',
        toastId
      );
    }
    toast.dismiss();
  }

  // remove event mirroring between web views
  pubsub.publish(TOGGLE_EVENT_MIRRORING_ALL_DEVICES, [{status: true}]);
  // remove loader
  pubsub.publish(SCREENSHOT_IN_PROGRESS, [{isInProgress: false}]);

  // account for browser to settle
  await _delay(100);

  if (isMergeImages) {
    const toastId = showNotification(
      'start Capturing',
      false,
      true,
      false,
      null
    );
    showNotification(`merging images`, false, true, false, 'info', toastId);
    const mergedImage = await mergeImages(images, deviceNames);
    showNotification(
      `Converting data to binary`,
      false,
      true,
      false,
      'info',
      toastId
    );
    const [img, ext] = await convertURIImageToBuffer(mergedImage);
    showNotification(`saving`, false, true, false, 'info', toastId);
    await fsUtils.writeImageToFile(img, 'all', ext);
    showNotification(
      `saved merged images`,
      2000,
      false,
      true,
      'success',
      toastId
    );
  }

  // open directory
  await fsUtils.openCurrentDir();
}

// noinspection JSUndefinedPropertyAssignment
export async function mergeImages(
  images: Array<Electron.NativeImage>,
  deviceNames: Array<string>
) {
  const canvas = document.createElement('canvas');
  const imageDim = images.map(img => img.getSize());
  const width = imageDim.reduce(
    (a, dim: {width: number, height: number}) => a + dim.width + 40,
    0
  );
  const height = imageDim.reduce((a, dim: {width: number, height: number}) => {
    if (dim.height > a) {
      return dim.height;
    }
    return a;
  }, 0);

  // noinspection JSUndefinedPropertyAssignment
  canvas.width = width;
  // noinspection JSUndefinedPropertyAssignment
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imageData = [];
  for (let i = 0; i < images.length; i += 1) {
    try {
      const image = images[i];
      const imageDatum = await loadImage(image);
      imageData.push(imageDatum);
    } catch (e) {
      console.log(e);
    }
  }

  let currentPosition = 0;
  for (let i = 0; i < imageData.length; i += 1) {
    const lastPos = currentPosition;
    currentPosition += imageDim[i].width + 30;
    // noinspection JSUndefinedPropertyAssignment
    ctx.font = '32px serif';
    // noinspection JSUndefinedPropertyAssignment
    ctx.fillStyle = '#fc2403';
    // noinspection JSUndefinedPropertyAssignment
    ctx.strokeStyle = '#fc2403';
    ctx.fillText(deviceNames[i], lastPos, 40);
    ctx.drawImage(
      imageData[i],
      lastPos,
      60,
      imageDim[i].width,
      imageDim[i].height
    );
  }

  return canvas.toDataURL('image/png', 0.6);
}

function loadImage(image: Electron.NativeImage): Promise<any> {
  return new Promise((resolve, reject) => {
    const htmlImg = new Image();
    htmlImg.onload = () => resolve(htmlImg);
    htmlImg.onerror = () => reject(new Error('Could not load image'));
    htmlImg.src = `data:image/png;base64,${image
      .toJPEG(100)
      .toString('base64')}`;
  });
}

function showNotification(
  message: string,
  autoClose: number | boolean,
  spinner: boolean,
  tick: boolean,
  type = 'info',
  toastId: any
) {
  const messageUI = (
    <NotificationMessage spinner={spinner} tick={tick} message={message} />
  );
  if (!toastId) {
    return toast.info(messageUI, {autoClose});
  }

  toast.update(toastId, {
    render: messageUI,
    type,
    autoClose,
  });
}
