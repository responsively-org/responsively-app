class WebPage {
  webview: Electron.WebContents;

  constructor(webview: Electron.WebContents) {
    this.webview = webview;
  }

  async getPageHeight() {
    return this.webview.executeJavaScript('document.body.scrollHeight');
  }

  async getViewportHeight() {
    return this.webview.executeJavaScript('window.innerHeight');
  }

  async scrollTo(x: number, y: number) {
    return this.webview.executeJavaScript(`window.scrollTo(${x}, ${y})`);
  }
}

export default WebPage;
