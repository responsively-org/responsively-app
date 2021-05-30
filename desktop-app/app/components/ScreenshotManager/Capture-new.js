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
import {convertNativeImageToPNG} from '../../utils/imageUtils';
import {_delay} from './functionUtils';

export default async function Capture(data: Data) {
  const {
    now,
    devices,
    selectedDevices: {deviceChecks, isMergeImages},
    delay,
  } = data;

  // get user preference path
  const {
    getDefaultScreenshotpath,
    getScreenShotSavePath,
  } = userPreferenceSettings;
  const defaultPath = getDefaultScreenshotpath();
  const path = getScreenShotSavePath();

  // get all webviews
  const webViews: NodeList<HTMLElement> = document.querySelectorAll('webView');
  // sort webviews based on devices order
  const sortedWebViews: Array<any> = SortWebViewsByDeviceIds(
    webViews,
    devices,
    deviceChecks
  );

  if (!sortedWebViews || !sortedWebViews.length) {
    return;
  }

  // show UI
  const toastId: string | number = showNotification(
    'start Capturing',
    false,
    true,
    false,
    'info',
    null
  );

  // loads all the screens
  await loadSelectedWebviews(sortedWebViews, delay);

  // remove event mirroring between web views
  pubsub.publish(TOGGLE_EVENT_MIRRORING_ALL_DEVICES, [{status: false}]);
  // store image objects
  const images = [];
  // device names to name the saved files
  const deviceNames = [];
  // get web address of Web views
  const address: string = sortedWebViews[0].getURL();
  const fsUtils = new FileSystemUtils(path, defaultPath, now, address);
  for (let i = 0; i < sortedWebViews.length; i += 1) {
    const currentView = sortedWebViews[i];
    try {
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
      const image = await captureScreen(webUtils);
      const jpg = convertNativeImageToPNG(image);
      const deviceName = deviceChecks[i].name;
      deviceNames.push(deviceName);
      images.push(image);
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
      console.log(error);
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
  toast.dismiss();
  // remove event mirroring between web views
  pubsub.publish(TOGGLE_EVENT_MIRRORING_ALL_DEVICES, [{status: true}]);
  // remove loader
  pubsub.publish(SCREENSHOT_IN_PROGRESS, [{isInProgress: false}]);
  // account for browser to settle
  await _delay(100);
  // merge images
  if (isMergeImages) {
    const toastId = showNotification(
      'start Capturing',
      false,
      true,
      false,
      'info',
      null
    );
    showNotification(`merging images`, false, true, false, 'info', toastId);
    const mergedImage = await mergeImages(images, deviceNames);
    showNotification(`saving`, false, true, false, 'info', toastId);
    await fsUtils.writeBase64Data(mergedImage, 'all-URI', 'png');
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

function SortWebViewsByDeviceIds(
  webViews: NodeList<HTMLElement>,
  devices: Array<{id: number}>,
  selectedDevices: any
) {
  // [deviceId, index]
  const hashTable = new Map<string, number>();
  const sorted: any = new Array(devices.length).fill(null);

  for (let i = 0; i < devices.length; i += 1) {
    hashTable.set(`${devices[i].id}`, i);
  }

  for (let i = 0; i < webViews.length; i += 1) {
    const id = webViews[i].id;
    if (hashTable.has(`${id}`)) {
      const index = hashTable.get(`${id}`);
      sorted[index] = webViews[i];
    }
  }

  return sorted.filter((webView, i) => selectedDevices[i].selected);
}

async function captureScreen(webViewUtils: WebViewUtils) {
  const previous = await webViewUtils.getWindowSizeAndScrollDetails();
  webViewUtils.webView.setAttribute(
    'style',
    `
      outline: rgba(0, 0, 0, 0) solid 4px;
      width: ${previous.scrollWidth}px;
      height: ${previous.scrollHeight}px;
      transform: scale(0.01);
    `
  );
  await _delay(500);
  const image = await webViewUtils.takeSnapShot();
  webViewUtils.webView.setAttribute(
    'style',
    `
      outline: rgba(0, 0, 0, 0) solid 4px;
      width: ${previous.viewPortWidth}px;
      height: ${previous.viewPortHeight}px;
      transform: scale(1);
    `
  );
  return image;
}

function restorePreviousState(webViewUtils) {
  // reset viewport
  const elements = document.querySelectorAll('.webview-container');
  elements.forEach(elem => {
    elem.style.position = '';
  });
  // adjust scroll behaviour and screen
  webViewUtils.forEach(async (webViewUtil: WebViewUtils) => {
    const isTransparentBg = await webViewUtil.isTransparentBg();
    await webViewUtil.resetBg();
  });
}

/**
 * loads selected webviews using scroll strategy
 *
 * */
async function loadSelectedWebviews(
  webViews: Array<WebviewElement>,
  delay: number = 100
): Promise<boolean> {
  const webViewUtils = webViews.map(webView => new WebViewUtils(webView));
  const webViewIds = webViews.map(webView => webView.getWebContentsId());
  // disable event mirroring for all devices
  pubsub.publish(TOGGLE_EVENT_MIRRORING_ALL_DEVICES, [{status: false}]);
  // enable event mirroring for selected devices
  pubsub.publish(TOGGLE_EVENT_MIRRORING_ALL_DEVICES, [
    {status: true, idsToConsider: webViewIds},
  ]);
  // select highest width to height ratio screen among selected
  const ratio = [];
  for (let i = 0; i < webViewUtils.length; i += 1) {
    const {viewPortHeight, viewPortWidth} = await webViewUtils[
      i
    ].getWindowSizeAndScrollDetails();
    ratio.push(viewPortWidth * viewPortHeight);
  }
  const highest = Math.min(...ratio);
  const highestIndex = ratio.findIndex(value => value === highest);
  const webViewWithLowestHeightRatio = webViewUtils[highestIndex];
  // keep all screens in viewport
  const elements = document.querySelectorAll('.webview-container');
  elements.forEach(elem => {
    elem.style.position = 'absolute';
  });

  // adjust scroll behaviour and screen
  webViewUtils.forEach(async (webViewUtil: WebViewUtils) => {
    const isTransparentBg = await webViewUtil.isTransparentBg();
    if (!isTransparentBg) {
      await webViewUtil.setWhiteBackground();
    }
    await webViewUtil.setScrollBehaviourToAuto();
  });
  pubsub.publish(SCREENSHOT_IN_PROGRESS, [{isInProgress: true}]);
  // load screen with scroll strategy
  await attachScreenRecoveryMechanism(webViewWithLowestHeightRatio, delay);
  restorePreviousState(webViewUtils);
  // resolve once done
  return Promise.resolve(true);
}

function attachScreenRecoveryMechanism(
  webViewUtil: WebViewUtils,
  delay: number = 100,
  retry: number = 3
) {
  return new Promise((resolve, reject) => {
    let retryCount = 0;
    const address = webViewUtil.webView.getAttribute('src');

    const getImage = async () => {
      if (retryCount === retry) {
        webViewUtil.webContents.removeListener('dom-ready', callGetImage);
        webViewUtil.webContents.removeListener('crashed', handler);
        reject(new Error('Unable to load screen'));
      }
      retryCount += 1;
      const image = await webViewUtil.doFullPageLoad();
      webViewUtil.webContents.removeListener('dom-ready', callGetImage);
      webViewUtil.webContents.removeListener('crashed', handler);
      resolve(true);
    };

    // handler to re-render screen
    const handler = (event, killed) => {
      if (!killed) {
        webViewUtil.webView.setAttribute('src', address);
      } else {
        reject(new Error('webView killed.....: ('));
      }
    };

    const callGetImage = () => {
      getImage();
    };

    // attach crashed event handler function
    webViewUtil.webContents.on('crashed', handler);
    webViewUtil.webContents.on('dom-ready', callGetImage);

    getImage();
  });
}

// merge images
async function mergeImages(images: Array<any>, deviceNames: Array<string>) {
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

  let currentPosition = 20;
  for (let i = 0; i < imageData.length; i += 1) {
    const lastPos = currentPosition;
    currentPosition += imageDim[i].width + 30;
    ctx.font = '32px serif';
    ctx.fillStyle = 'lightgrey';
    ctx.strokeStyle = 'black';
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

function loadImage(image: any): Promise<any> {
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
  toastId: string | number | null
): string | number {
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

  return toastId;
}
