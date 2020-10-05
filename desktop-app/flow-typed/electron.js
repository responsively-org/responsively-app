declare class WebviewElement extends HTMLElement {
  insertCSS: string => Promise<string>,
  executeJavaScript: string => Promise<any>,
  getWebContentsId: () => number,
  removeInsertedCSS: number => Promise<void>,
}
