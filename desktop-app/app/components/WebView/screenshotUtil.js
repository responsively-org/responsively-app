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
import {type Device} from '../../constants/devices';

const mergeImg = Promise.promisifyAll(_mergeImg);

const captureScreenshot = async ({
  address,
  device,
  webView,
  createSeparateDir,
  now,
  fullScreen = false,
  removeFixedPositionedElements,
}: {
  address: string,
  device: Device,
  webView: WebviewElement,
  createSeparateDir: boolean,
  now?: Date,
  fullScreen: boolean,
  removeFixedPositionedElements: boolean,
}) => {
  const worker = new Worker('./imageWorker.js');
  const promiseWorker = new PromiseWorker(worker);
  const toastId = toast.info(
    <NotificationMessage
      spinner
      message={`Capturing ${device.name} screenshot...`}
    />,
    {autoClose: false}
  );
  const webViewUtils = new WebViewUtils(webView);
  const insertedCSSKey = await webViewUtils.hideScrollbarAndFixedPositionedElements();

  const images = fullScreen
    ? await webViewUtils.getFullScreenImages(promiseWorker)
    : [await webViewUtils.getViewportImage(promiseWorker)];

  await webViewUtils.unHideScrollbarAndFixedPositionedElements(insertedCSSKey);

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
    createSeparateDir,
    fullScreen
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

class WebViewUtils {
  webView: WebviewElement;

  constructor(webView) {
    this.webView = webView;
  }

  getWindowSizeAndScrollDetails(): Promise {
    return this.webView.executeJavaScript(`
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
  }

  async scrollTo(scrollX: number, scrollY: number): Promise {
    await this.webView.executeJavaScript(`
      window.scrollTo(${scrollX}, ${scrollY})
    `);
    // wait a little for the scroll to take effect.
    await _delay(200);
  }

  async hideScrollbarAndFixedPositionedElements(): Promise<string> {
    const key = await this.webView.insertCSS(`
      .responsivelyApp__ScreenshotInProgress::-webkit-scrollbar {
        display: none;
      }

      .responsivelyApp__HiddenForScreenshot {
        display: none !important;
      }
    `);

    // await this.webView.executeJavaScript(`

    // `);

    if (removeFixedPositionedElements) {
      await this.webView.executeJavaScript(`
        document.body.classList.add('responsivelyApp__ScreenshotInProgress');
        responsivelyApp.hideFixedPositionElementsForScreenshot();
      `);
    }

    // wait a little for the 'hide' effect to take place.
    await _delay(200);

    return key;
  }

  async unHideScrollbarAndFixedPositionedElements(insertedCSSKey): Promise {
    await this.webView.removeInsertedCSS(insertedCSSKey);
    return this.webView.executeJavaScript(`
      document.body.classList.remove('responsivelyApp__ScreenshotInProgress');
      responsivelyApp.unHideElementsHiddenForScreenshot();
    `);
  }

  async getFullScreenImages(promiseWorker: PromiseWorker): Promise {
    const {
      previousScrollPosition,
      scrollHeight,
      viewPortHeight,
      scrollWidth,
      viewPortWidth,
    } = await this.getWindowSizeAndScrollDetails();

    const images = [];
    let scrollX = 0;
    let scrollY = 0;
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
        await this.scrollTo(scrollX, scrollY);

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
        const image = await this.takeSnapshot(options);
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

    this.scrollTo(previousScrollPosition.left, previousScrollPosition.top);

    return images;
  }

  async getViewportImage(promiseWorker: PromiseWorker): Promise {
    const image = await this.takeSnapshot();
    const png = image.toPNG();

    return promiseWorker.postMessage(
      {
        images: [png],
        direction: 'horizontal',
      },
      [png]
    );
  }

  takeSnapshot(options): Promise {
    return remote.webContents
      .fromId(this.webView.getWebContentsId())
      .capturePage(options);
  }
}

const _delay = ms =>
  new Promise((resolve, reject) => {
    setTimeout(() => resolve(), ms);
  });

function _getScreenshotFileName(
  address,
  device,
  now = new Date(),
  createSeparateDir,
  fullScreen
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
    file: `${getWebsiteName(address)} ${
      fullScreen ? '- Full ' : ''
    }- ${device.name.replace(/\//g, '-')} - ${dateString}.png`,
  };
}

const getWebsiteName = (address: string) => {
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

export {getWebsiteName, captureScreenshot};
