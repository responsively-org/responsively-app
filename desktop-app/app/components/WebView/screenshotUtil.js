// @flow
import React from 'react';
import {shell, remote} from 'electron';
import {toast} from 'react-toastify';
import _mergeImg from 'merge-img';
import os from 'os';
import {promisify} from 'util';
import Promise from 'bluebird';
import path from 'path';
import fs from 'fs-extra';
import PromiseWorker from 'promise-worker';
import NotificationMessage from '../NotificationMessage';
import {userPreferenceSettings} from '../../settings/userPreferenceSettings';

const mergeImg = Promise.promisifyAll(_mergeImg);

export const captureFullPage = async (
  address,
  device,
  webView,
  createSeparateDir,
  now
) => {
  const worker = new Worker('./imageWorker.js');
  const promiseWorker = new PromiseWorker(worker);
  const toastId = toast.info(
    <NotificationMessage
      spinner
      message={`Capturing ${device.name} screenshot...`}
    />,
    {autoClose: false}
  );
  // Hiding scrollbars in the screenshot
  await webView.insertCSS(`
      .responsivelyApp__ScreenshotInProgress::-webkit-scrollbar {
        display: none;
      }

      .responsivelyApp__HiddenForScreenshot {
        display: none !important;
      }
    `);

  // Get the windows's scroll details
  let scrollX = 0;
  let scrollY = 0;
  const pageX = 0;
  const pageY = 0;
  const {
    previousScrollPosition,
    scrollHeight,
    viewPortHeight,
    scrollWidth,
    viewPortWidth,
  } = await webView.executeJavaScript(`
    document.body.classList.add('responsivelyApp__ScreenshotInProgress');
    responsivelyApp.screenshotVar = {
      previousScrollPosition : {
        left: window.scrollX,
        top: window.scrollY,
      },
      scrollHeight: document.body.scrollHeight,
      scrollWidth: document.body.scrollWidth,
      viewPortHeight: document.documentElement.clientHeight,
      viewPortWidth: document.documentElement.clientWidth,
    };
    responsivelyApp.screenshotVar;
  `);

  const images = [];

  for (
    let pageY = 0;
    scrollY < scrollHeight;
    pageY++, scrollY = viewPortHeight * pageY
  ) {
    scrollX = 0;
    const columnImages = [];
    for (
      let pageX = 0;
      scrollX < scrollWidth;
      pageX++, scrollX = viewPortWidth * pageX
    ) {
      await webView.executeJavaScript(`
        window.scrollTo(${scrollX}, ${scrollY})
        responsivelyApp.hideFixedPositionElementsForScreenshot();
      `);
      await _delay(200);
      const options = {
        x: 0,
        y: 0,
        width: viewPortWidth,
        height: viewPortHeight,
      };
      if (scrollX + viewPortWidth > scrollWidth) {
        options.width = scrollWidth - scrollX;
        options.x = viewPortWidth - options.width;
      }
      if (scrollY + viewPortHeight > scrollHeight) {
        options.height = scrollHeight - scrollY;
        options.y = viewPortHeight - options.height;
      }
      const image = await _takeSnapshot(webView, options);
      columnImages.push(image);
    }
    const pngs = columnImages.map(img => img.toPNG());
    images.push(
      await promiseWorker.postMessage(
        {
          images: pngs,
          direction: 'horizontal',
        },
        [...pngs]
      )
    );
  }

  webView.executeJavaScript(`
    window.scrollTo(${JSON.stringify(previousScrollPosition)});
    document.body.classList.remove('responsivelyApp__ScreenshotInProgress');
    responsivelyApp.unHideElementsHiddenForScreenshot();
  `);

  toast.update(toastId, {
    render: (
      <NotificationMessage
        spinner
        message={`Processing ${device.name} screenshot...`}
      />
    ),
    type: toast.TYPE.INFO,
  });
  const resultFilename = _getScreenshotFileName(
    address,
    device,
    now,
    createSeparateDir
  );
  const mergedImage = await promiseWorker.postMessage({
    images,
    direction: 'vertical',
    resultFilename,
  });
  toast.update(toastId, {
    render: (
      <NotificationMessage tick message={`${device.name} screenshot taken!`} />
    ),
    type: toast.TYPE.INFO,
    autoClose: 2000,
  });
  await _delay(250);
  shell.showItemInFolder(path.join(resultFilename.dir, resultFilename.file));
};

const _delay = ms =>
  new Promise((resolve, reject) => {
    setTimeout(() => resolve(), ms);
  });

const _takeSnapshot = (webView, options) =>
  remote.webContents.fromId(webView.getWebContentsId()).capturePage(options);

function _getScreenshotFileName(
  address,
  device,
  now = new Date(),
  createSeparateDir
) {
  const dateString = `${now
    .toLocaleDateString()
    .split('/')
    .reverse()
    .join('-')} at ${now
    .toLocaleTimeString([], {hour12: true})
    .replace(/:/g, '.')
    .toUpperCase()}`;
  const directoryPath = createSeparateDir ? `${dateString}/` : '';
  const userSelectedScreenShotSavePath = userPreferenceSettings.getScreenShotSavePath();
  return {
    dir: path.join(
      userSelectedScreenShotSavePath ||
        path.join(os.homedir(), `Desktop/Responsively-Screenshots`),
      directoryPath
    ),
    file: `${getWebsiteName(address)} - ${device.name.replace(
      /\//g,
      '-'
    )} - ${dateString}.png`,
  };
}

export const getWebsiteName = address => {
  let domain = '';
  if (address.startsWith('file://')) {
    const fileNameStartingIndex = address.lastIndexOf('/') + 1;
    let htmIndex = address.indexOf('.htm');
    if (htmIndex === -1) {
      htmIndex = address.length;
    }
    domain = address.substring(fileNameStartingIndex, htmIndex);
  } else {
    domain = new URL(address).hostname;
    domain = domain.replace('www.', '');
    const dotIndex = domain.indexOf('.');
    if (dotIndex > -1) {
      domain = domain.substr(0, domain.indexOf('.'));
    }
  }
  return domain.charAt(0).toUpperCase() + domain.slice(1);
};
