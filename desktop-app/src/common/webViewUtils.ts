export function updateWebViewHeightAndScale(
  webView: HTMLElement | Electron.WebviewTag,
  pageHeight: number
) {
  webView.style.height = `${pageHeight}px`;
  webView.style.transform = `scale(0.1)`;
}
