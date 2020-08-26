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
import Jimp from 'jimp';
import PromiseWorker from 'promise-worker';
import NotificationMessage from '../NotificationMessage';
import {userPreferenceSettings} from '../../settings/userPreferenceSettings';
import {type Device} from '../../constants/devices';
import {captureOnSentry} from '../../utils/logUtils';
import {SCREENSHOT_MECHANISM} from '../../constants/values';
import mutexify from 'mutexify/promise';

const mergeImg = Promise.promisifyAll(_mergeImg);
const snapshotLock = mutexify();

const captureScreenshot = async ({
  address,
  device,
  webView,
  createSeparateDir,
  now,
  fullScreen = false,
  removeFixedPositionedElements,
  screenshotMechanism,
  setFullDocumentDimensions,
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
  const resultFilename = _getScreenshotFileName(
    address,
    device,
    now,
    createSeparateDir,
    fullScreen
  );
  const webViewUtils = new WebViewUtils(webView, setFullDocumentDimensions);
  const insertedCSSKey = await webViewUtils.hideScrollbarAndFixedPositionedElements(
    removeFixedPositionedElements
  );

  let images = null;

  if (!fullScreen) {
    await webViewUtils.getViewportImage(resultFilename);
  } else if (screenshotMechanism === SCREENSHOT_MECHANISM.V2) {
    await webViewUtils.captureFullPageV2(resultFilename);
  } else {
    images = await webViewUtils.getFullScreenImages(promiseWorker);
  }

  await webViewUtils.unHideScrollbarAndFixedPositionedElements(
    insertedCSSKey,
    removeFixedPositionedElements
  );

  if (images != null) {
    toast.update(toastId, {
      render: (
        <NotificationMessage
          spinner
          message={`Processing ${device.name} screenshot...`}
        />
      ),
      type: toast.TYPE.INFO,
    });

    const mergedImage = await promiseWorker.postMessage({
      images,
      direction: 'vertical',
      resultFilename,
    });
  }

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
  webContents;
  setFullDocumentDimensions;

  constructor(webView, setFullDocumentDimensions) {
    this.webView = webView;
    this.webContents = remote.webContents.fromId(
      this.webView.getWebContentsId()
    );
    this.setFullDocumentDimensions = setFullDocumentDimensions;
  }

  getWindowSizeAndScrollDetails(): Promise {
    return this.webView
      .executeJavaScript(
        `
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
        `
      )
      .catch(captureOnSentry);
  }

  async scrollTo(scrollX: number, scrollY: number): Promise {
    await this.webView
      .executeJavaScript(
        `
          window.scrollTo(${scrollX}, ${scrollY})
        `
      )
      .catch(captureOnSentry);
    // wait a little for the scroll to take effect.
    await _delay(500);
  }

  async hideScrollbarAndFixedPositionedElements(
    removeFixedPositionedElements: boolean
  ): Promise<string> {
    const key = await this.webView.insertCSS(`
      body::-webkit-scrollbar {
        display: none;
      }

      .responsivelyApp__HiddenForScreenshot {
        display: none !important;
      }
    `);

    if (removeFixedPositionedElements) {
      await this.webView
        .executeJavaScript(
          `
        responsivelyApp.hideFixedPositionElementsForScreenshot();
      `
        )
        .catch(captureOnSentry);
    }

    // wait a little for the 'hide' effect to take place.
    await _delay(200);

    return key;
  }

  async unHideScrollbarAndFixedPositionedElements(
    insertedCSSKey,
    removeFixedPositionedElements: boolean
  ): Promise {
    await this.webView.removeInsertedCSS(insertedCSSKey);
    if (removeFixedPositionedElements) {
      return this.webView
        .executeJavaScript(
          `
        document.body.classList.remove('responsivelyApp__ScreenshotInProgress');
        responsivelyApp.unHideElementsHiddenForScreenshot();
      `
        )
        .catch(captureOnSentry);
    }
    return Promise.resolve(true);
  }

  async getScrollPercent(): Promise<Number> {
    return this.webContents.executeJavaScriptInIsolatedWorld(
      Math.round(Math.random() * 1000),
      [
        {
          code: `
          var h = document.documentElement,
          b = document.body,
          st = 'scrollTop',
          sh = 'scrollHeight';
          ((h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight)) * 100;
        `,
        },
      ]
    );
  }

  async scrollViewPort(): Promise {
    return this.webContents.executeJavaScriptInIsolatedWorld(
      Math.round(Math.random() * 1000),
      [
        {
          code: `
            scrollBy(0, window.innerHeight);
            true
          `,
        },
      ]
    );
  }

  async setWhiteBG() {
    const isTransparentBG = this.webContents.executeJavaScriptInIsolatedWorld(
      Math.round(Math.random() * 1000),
      [
        {
          code: `
          const transparentBGStyle = 'rgba(0, 0, 0, 0)';
          const styles = window.getComputedStyle(document.getElementsByTagName('body')[0])
          styles.background.indexOf(transparentBGStyle) !== -1 || styles.backgroundColor.indexOf(transparentBGStyle) !== -1
        `,
        },
      ]
    );
    if (!isTransparentBG) {
      return;
    }
    this.bgModKey = await this.webView.insertCSS(`
      body {
        background-color: white;
      }
    `);
  }

  async resetBG() {
    if (!this.bgModKey) {
      return;
    }
    await this.webView.removeInsertedCSS(this.bgModKey);
    this.bgModKey = null;
  }

  async doFullPageScrollToLoadLazyLoadedSections(): Promise {
    const {scrollHeight: before} = await this.getWindowSizeAndScrollDetails();
    let scrollPercent = await this.getScrollPercent();
    while (scrollPercent !== 100 && !Number.isNaN(scrollPercent)) {
      await this.scrollViewPort();
      await _delay(100);
      scrollPercent = await this.getScrollPercent();
    }
    const {scrollHeight: after} = await this.getWindowSizeAndScrollDetails();
  }

  async captureFullPageV2({dir, file}) {
    this.setWhiteBG();
    await this.doFullPageScrollToLoadLazyLoadedSections();
    const {
      previousScrollPosition,
      scrollHeight,
      viewPortHeight,
      scrollWidth,
      viewPortWidth,
    } = await this.getWindowSizeAndScrollDetails();

    this.setFullDocumentDimensions(scrollHeight, scrollWidth, 0.01);

    await _delay(500);

    const image = await this.takeSnapshot();
    this.resetBG();
    this.scrollTo(previousScrollPosition.left, previousScrollPosition.top);
    this.setFullDocumentDimensions(null, null, null);
    await this.writeNativeImageToFile(image, dir, file);
  }

  async getViewportImage({dir, file}): Promise {
    await this.setWhiteBG();
    const image = await this.takeSnapshot();
    this.resetBG();
    await this.writeNativeImageToFile(image, dir, file);
  }

  async writeNativeImageToFile(image, dir, file) {
    const ensureDirPromise = fs.ensureDir(dir);
    const jpg = image.toJPEG(100);
    await ensureDirPromise;
    await fs.writeFile(path.join(dir, file), jpg);
  }

  async getFullScreenImages(promiseWorker: PromiseWorker): Promise {
    this.setWhiteBG();
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
      const jpgs = columnImages.map(img => img.toJPEG(100));
      images.push(
        await promiseWorker.postMessage(
          {
            images: jpgs,
            direction: 'horizontal',
          },
          [...jpgs]
        )
      );
    }

    this.scrollTo(previousScrollPosition.left, previousScrollPosition.top);
    this.resetBG();
    return images;
  }

  async takeSnapshot(options): Promise {
    const release = await snapshotLock();
    const image = await remote.webContents
      .fromId(this.webView.getWebContentsId())
      .capturePage(options);
    release();
    return image;
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
  fullScreen,
  format = 'jpg'
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
    }- ${device.name.replace(/\//g, '-')} - ${dateString}.${format}`,
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
