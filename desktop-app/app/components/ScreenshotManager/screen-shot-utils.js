import {remote} from 'electron';
import {captureOnSentry} from '../../utils/logUtils';
import {_delay} from './function-utils';
import type {WindowSizeAndScrollPosition} from './types';
import mutexify from 'mutexify/promise';
import Promise from 'bluebird';

const snapshotLock = mutexify();

export default class WebViewUtils {
  webView: WebviewElement;
  webContents: any;

  // keep track of webview background modification
  bgModKey: string | null = null;

  // keep track of webview scroll modification
  scrollModKey: string | null = null;

  constructor(element: WebviewElement) {
    this.webView = element;
    this.webContents = remote.webContents.fromId(
      this.webView.getWebContentsId()
    );
  }

  /**
   * find weather given webContent has transparent background
   * @returns {Promise<boolean>}
   */
  isTransparentBg(): Promise<boolean> {
    return this.webContents.executeJavaScriptInIsolatedWorld(
      Math.round(Math.random() * 1000),
      [
        {
          code: `
          const transparentBGStyle = 'rgba(0, 0, 0, 0)';
          const styles = window.getComputedStyle(document.getElementByTagName('body')[0]);
          styles.background.indexOf(transparentBGStyle) !== -1 ||
          styles.backgroundColor.indexOf(transparentBGStyle) !== -1
          `,
        },
      ]
    );
  }

  async setWhiteBackground() {
    this.bgModKey = await this.webView.insertCSS(`
      body {
        background-color: white;
      }
    `);
  }

  async setScrollBehaviourToAuto() {
    this.scrollModKey = await this.webView.insertCSS(`
      html, body {
        scroll-behaviour: auto !important;
      }
    `);
  }

  async resetBg() {
    if (!this.bgModKey) {
      return;
    }

    await this.webView.removeInsertedCSS(this.bgModKey);
    this.bgModKey = null;
  }

  async scrollTo(scrollX: number, scrollY: number, doDelay = false) {
    await this.webView
      .executeJavaScript(
        `
          window.scrollTo(${scrollX}, ${scrollY})
        `
      )
      .catch(captureOnSentry);
    if (!doDelay) {
      return;
    }
    // wait a little for the scroll to take effect.
    await _delay(500);
  }

  scrollViewPort(): Promise<any> {
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

  getScrollPercent(): Promise<Number> {
    return this.webContents.executeJavaScriptInIsolatedWorld(
      Math.round(Math.random() * 100),
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

  async doFullPageLageLoad() {
    try {
      let scrollPercent: number = await this.getScrollPercent();
      while (scrollPercent !== 100 && !Number.isNaN(scrollPercent)) {
        await this.scrollViewPort();
        await _delay(2000);
        scrollPercent = Math.ceil(await this.getScrollPercent());
      }
    } catch (err) {
      console.log('error in full page load', err);
    }
  }

  async getWindowSizeAndScrollDetails(): Promise<WindowSizeAndScrollPosition> {
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

  /**
   * we use thread locking mechanism make sure webContents are
   * not touched until screenshot is captured.
   *
   * */
  async takeSnapShot(): Promise<Electron.NativeImage> {
    const release = await snapshotLock();
    const image: Electron.NativeImage = await remote.webContents
      .fromId(this.webView.getWebContentsId())
      .capturePage();
    release();
    return image;
  }

  async captureFullHeightScreenShot() {
    const isTransparentBg = await this.isTransparentBg();
    if (!isTransparentBg) {
      await this.setWhiteBackground();
    }
    await this.setScrollBehaviourToAuto();
    const previous = await this.getWindowSizeAndScrollDetails();
    await this.doFullPageLageLoad();
    const {
      scrollHeight,
      scrollWidth,
    } = await this.getWindowSizeAndScrollDetails();
    this.webView.setAttribute(
      'style',
      `
        outline: rgba(0, 0, 0, 0) solid 4px;
        width: ${scrollWidth}px;
        height: ${scrollHeight}px;
        transform: scale(0.01);
      `
    );
    await _delay(500);
    const image = await this.takeSnapShot();
    await this.resetBg();
    this.webView.setAttribute(
      'style',
      `
        outline: rgba(0, 0, 0, 0) solid 4px;
        width: ${previous.scrollWidth}px;
        height: ${previous.scrollHeight}px;
        transform: scale(1);
      `
    );
    await this.scrollTo(
      previous.previousScrollPosition.left,
      previous.previousScrollPosition.top
    );
    return image;
  }
}
