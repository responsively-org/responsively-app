// @flow
import React from 'react';
import type {Data} from './types';
import WebViewUtils from './screen-shot-utils';
import FileSystemUtils from './fs-utils';
import {userPreferenceSettings} from '../../settings/userPreferenceSettings';
import {toast} from 'react-toastify';
import NotificationMessage from '../NotificationMessage';
import {TOGGLE_EVENT_MIRRORING} from '../../constants/pubsubEvents';
import pubsub from 'pubsub.js';

function sortWebViewsByDeviceIds(
  webViews: NodeList<WebviewElement>,
  devices: Array<{id: number}>
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
  return sorted;
}

export default async function Capture(data: Data) {
  const {now, devices} = data;
  const toastId = showNotification('start Capturing', false, true, false, null);

  // get All web views
  const webViews = document.querySelectorAll('webview');

  // sort web views based on devices order
  const sortedWebViews = sortWebViewsByDeviceIds(webViews, devices);

  // get user preference path
  // TODO: update fs utils where it should consider both default and preferred path
  const {
    getDefaultScreenshotpath,
    getScreenShotSavePath,
  } = userPreferenceSettings;
  const defaultPath = getDefaultScreenshotpath();
  const path = getScreenShotSavePath();

  // remove event mirroring between webviews
  // TODO: bug prone, change logic webview component based on status we sending here
  pubsub.publish(TOGGLE_EVENT_MIRRORING, [{status: false}]);

  // store image objects
  const images = [];
  for (let i = 0; i < sortedWebViews.length; i += 1) {
    try {
      const currentView = sortedWebViews[i];
      showNotification(
        `Capturing ${devices[i].name}`,
        false,
        true,
        false,
        'info',
        toastId
      );

      const address = currentView.getURL();
      const webUtils = new WebViewUtils(currentView);
      const image = await webUtils.captureWithRetry();
      const fsUtils = new FileSystemUtils(
        path || defaultPath,
        now,
        address,
        devices[i].name || 'device'
      );
      images.push(image);

      const jpg = fsUtils.convertNativeImageToJPEG(image);
      await fsUtils.writeImageToFile(jpg, true, 'jpg');
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
  }

  // remove event mirroring between webviews
  // TODO: bug prone, change logic webview component based on status we sending here
  pubsub.publish(TOGGLE_EVENT_MIRRORING, [{status: true}]);

  // get web address of Webviews
  const address = sortedWebViews[0].getURL();

  // create fs Utils to save file
  const fsUtils = new FileSystemUtils(
    path || defaultPath,
    now,
    address,
    'merged-image'
  );

  showNotification(`merging images`, false, true, false, 'info', toastId);
  const mergedImage = await mergeImages(images);
  showNotification(
    `Converting data to binary`,
    false,
    true,
    false,
    'info',
    toastId
  );
  const [img, ext] = await fsUtils.createCombinedImage(mergedImage);
  showNotification(`saving`, false, true, false, 'info', toastId);
  await fsUtils.writeImageToFile(img, true, ext);
  showNotification(
    `saved merged images`,
    2000,
    false,
    true,
    'success',
    toastId
  );
  // open directory
  // TODO: openCurrentDir with true as argument does not make sense
  fsUtils.openCurrentDir(true);
}

export async function mergeImages(images: Array<Electron.NativeImage>) {
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
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imageData = [];
  for (let i = 0; i < images.length; i += 1) {
    const image = images[i];
    const imageDatum = await loadImage(image);
    imageData.push(imageDatum);
  }

  let currentPosition = 0;
  for (let i = 0; i < imageData.length; i += 1) {
    const lastPos = currentPosition;
    currentPosition += imageDim[i].width + 30;
    ctx.drawImage(
      imageData[i],
      lastPos,
      0,
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
