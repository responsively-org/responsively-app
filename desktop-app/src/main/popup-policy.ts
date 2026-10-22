export type PopupBehavior = 'in-preview' | 'external';

export type PopupAction =
  {kind: 'in-preview'; url: string} | {kind: 'external'; url: string} | {kind: 'deny'};

// Schemes the OS should always handle, regardless of the popup setting.
const EXTERNAL_ONLY_PROTOCOLS = ['mailto:', 'tel:'];

/**
 * Decides what to do with a window.open / target=_blank request coming out of
 * a preview webview. Web URLs follow the user's popup setting; mail/tel links
 * go to the OS; everything else (javascript:, file:, custom schemes) is
 * denied — an untrusted page must not reach arbitrary protocol handlers.
 */
export const decidePopupAction = (rawUrl: string, behavior: PopupBehavior): PopupAction => {
  let protocol: string;
  try {
    protocol = new URL(rawUrl).protocol;
  } catch {
    return {kind: 'deny'};
  }
  if (protocol === 'http:' || protocol === 'https:') {
    return behavior === 'external'
      ? {kind: 'external', url: rawUrl}
      : {kind: 'in-preview', url: rawUrl};
  }
  if (EXTERNAL_ONLY_PROTOCOLS.includes(protocol)) {
    return {kind: 'external', url: rawUrl};
  }
  return {kind: 'deny'};
};
