// @flow
import React from 'react';
import {shell} from 'electron';
import {toast} from 'react-toastify';
import NotificationMessage from '../NotificationMessage';
import _mergeImg from 'merge-img';
import os from 'os';
import {promisify} from 'util';
import Promise from 'bluebird';
import path from 'path';
import fs from 'fs-extra';

const mergeImg = Promise.promisifyAll(_mergeImg);

export const captureFullPage = async (
  address,
  device,
  webView,
  createSeparateDir,
  now
) => {
  const toastId = toast.info(
    <NotificationMessage
      spinner={true}
      message={`Capturing ${device.name} screenshot...`}
    />,
    {autoClose: false}
  );
  //Hiding scrollbars in the screenshot
  await webView.insertCSS(`
      .responsivelyApp__ScreenshotInProgress::-webkit-scrollbar {
        display: none;
      }

      .responsivelyApp__HiddenForScreenshot {
        display: none !important;
      }
    `);

  //Get the windows's scroll details
  let scrollX = 0;
  let scrollY = 0;
  let pageX = 0;
  let pageY = 0;
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

  let images = [];

  for (
    let pageY = 0;
    scrollY < scrollHeight;
    pageY++, scrollY = viewPortHeight * pageY
  ) {
    if (!images[pageY]) {
      images[pageY] = [];
    }
    scrollX = 0;
    for (
      let pageX = 0;
      scrollX < scrollWidth;
      pageX++, scrollX = viewPortWidth * pageX
    ) {
      console.log(`scrolling to ${scrollX}, ${scrollY}`);
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
      console.log('Capture options', options);
      const image = await _takeSnapshot(webView, options);
      images[pageY].push(image);
    }
  }

  webView.executeJavaScript(`
    window.scrollTo(${JSON.stringify(previousScrollPosition)});
    document.body.classList.remove('responsivelyApp__ScreenshotInProgress');
    responsivelyApp.unHideElementsHiddenForScreenshot();
  `);

  toast.update(toastId, {
    render: (
      <NotificationMessage
        spinner={true}
        message={`Processing ${device.name} screenshot...`}
      />
    ),
    type: toast.TYPE.INFO,
  });

  images = await Promise.map(images, columnImages => {
    return mergeImg(
      columnImages.map(img => ({src: img.toPNG()})),
      {direction: false} //horizontal stitching
    );
  });

  const mergedImage = await (await mergeImg(
    await Promise.map(images, async img => {
      const getBufferAsync = promisify(img.getBuffer.bind(img));
      return {
        src: await getBufferAsync('image/png'),
      };
    }),
    {
      direction: true,
    }
  ))
    .rgba(false)
    .background(0xffffffff);
  const getBufferAsync = promisify(mergedImage.getBuffer.bind(mergedImage));
  await _writeScreenshotFile(
    await getBufferAsync('image/png'),
    _getScreenshotFileName(address, device, now, createSeparateDir)
  );
  toast.update(toastId, {
    render: (
      <NotificationMessage
        tick={true}
        message={`${device.name} screenshot taken!`}
      />
    ),
    type: toast.TYPE.INFO,
    autoClose: 2000,
  });
};

const _delay = ms =>
  new Promise((resolve, reject) => {
    setTimeout(() => resolve(), ms);
  });

const _takeSnapshot = (webView, options) => {
  return webView.getWebContents().capturePage(options);
};

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
    .replace(/\:/g, '.')
    .toUpperCase()}`;
  const directoryPath = createSeparateDir ? `${dateString}/` : '';
  return {
    dir: directoryPath,
    file: `${_getWebsiteName(address)} - ${device.name.replace(
      '/',
      '-'
    )} - ${dateString}.png`,
  };
}

const _writeScreenshotFile = async (content, {dir, file}) => {
  try {
    const folder = path.join(
      os.homedir(),
      `Desktop/Responsively-Screenshots`,
      dir
    );
    await fs.ensureDir(folder);
    const filePath = path.join(folder, file);
    await fs.writeFile(filePath, content);
    shell.showItemInFolder(filePath);
  } catch (e) {
    console.log('err', e);
    alert('Failed to save the file !', e);
  }
};

const _getWebsiteName = address => {
  let domain = new URL(address).hostname;
  domain = domain.replace('www.', '');
  const dotIndex = domain.indexOf('.');
  if (dotIndex > -1) {
    domain = domain.substr(0, domain.indexOf('.'));
  }
  return domain.charAt(0).toUpperCase() + domain.slice(1);
};
