import {webContents} from 'electron';
import {McpCaptureTargetsResult} from '../../common/mcp';
import {GetMainWindow, sendBridgeCommand} from './bridge';

const EXECUTE_TIMEOUT_MS = 10_000;
const POST_INPUT_SETTLE_MS = 500;

export interface ReadPageResult {
  deviceName: string;
  url: string;
  title: string;
  text: string;
  elements: Array<{
    selector: string;
    tag: string;
    text: string;
    value?: string;
    inputType?: string;
    href?: string;
    disabled?: boolean;
  }>;
  truncatedElements: boolean;
}

export interface ClickResult {
  deviceName: string;
  clicked: {tag: string; text: string};
  url: string;
  pageTitle: string;
}

export interface TypeTextResult {
  deviceName: string;
  value: string;
  url: string;
  pageTitle: string;
}

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const resolveTarget = async (
  getMainWindow: GetMainWindow,
  device?: string
): Promise<{deviceName: string; targetContents: Electron.WebContents}> => {
  const {targets, skipped} = await sendBridgeCommand<McpCaptureTargetsResult>(
    getMainWindow,
    'get-capture-targets',
    {device}
  );
  // Without a device filter the bridge returns previews in suite order, so
  // targets[0] is the primary device.
  const target = targets[0];
  if (target === undefined) {
    const reasons = skipped.map((s) => `${s.deviceName}: ${s.reason}`).join('; ');
    throw new Error(
      `No device preview available to interact with${reasons ? ` (${reasons})` : ''}.`
    );
  }
  const targetContents = webContents.fromId(target.webContentsId);
  if (targetContents === undefined || targetContents.isDestroyed()) {
    throw new Error(`The ${target.deviceName} preview is no longer available`);
  }
  return {deviceName: target.deviceName, targetContents};
};

const executeInPage = async <T>(
  targetContents: Electron.WebContents,
  script: string
): Promise<T> => {
  return Promise.race([
    targetContents.executeJavaScript(script) as Promise<T>,
    new Promise<never>((_resolve, reject) => {
      setTimeout(
        () => reject(new Error(`The page did not respond within ${EXECUTE_TIMEOUT_MS}ms`)),
        EXECUTE_TIMEOUT_MS
      );
    }),
  ]);
};

const READ_PAGE_SCRIPT = `
(() => {
  const MAX_ELEMENTS = 100;
  const MAX_TEXT = 3000;
  const isVisible = (el) => {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;
    const style = getComputedStyle(el);
    return style.visibility !== 'hidden' && style.display !== 'none';
  };
  const cssPath = (el) => {
    const parts = [];
    let node = el;
    while (node && node.nodeType === 1 && parts.length < 5) {
      if (node.id) {
        parts.unshift('#' + CSS.escape(node.id));
        return parts.join(' > ');
      }
      let selector = node.tagName.toLowerCase();
      const parent = node.parentElement;
      if (parent) {
        const sameTag = Array.from(parent.children).filter((c) => c.tagName === node.tagName);
        if (sameTag.length > 1) selector += ':nth-of-type(' + (sameTag.indexOf(node) + 1) + ')';
      }
      parts.unshift(selector);
      node = parent;
    }
    return parts.join(' > ');
  };
  const label = (el) =>
    (el.innerText || el.value || el.getAttribute('aria-label') || el.getAttribute('placeholder') || '')
      .trim()
      .replace(/\\s+/g, ' ')
      .slice(0, 80);
  const candidates = Array.from(
    document.querySelectorAll(
      'a[href], button, input, select, textarea, [role="button"], [role="link"], [role="tab"], [role="checkbox"], [role="menuitem"], [onclick]'
    )
  );
  const elements = [];
  for (const el of candidates) {
    if (elements.length >= MAX_ELEMENTS) break;
    if (!isVisible(el)) continue;
    const entry = {selector: cssPath(el), tag: el.tagName.toLowerCase(), text: label(el)};
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
      entry.value = String(el.value).slice(0, 80);
      entry.inputType = el.type;
    }
    if (el.disabled) entry.disabled = true;
    if (el.tagName === 'A' && el.href) entry.href = String(el.href).slice(0, 200);
    elements.push(entry);
  }
  const bodyText = (document.body ? document.body.innerText : '')
    .replace(/\\n{3,}/g, '\\n\\n')
    .slice(0, MAX_TEXT);
  return {
    url: location.href,
    title: document.title,
    text: bodyText,
    elements,
    truncatedElements: candidates.length > MAX_ELEMENTS,
  };
})()
`;

const locateScript = (selector: string) => `
((selector) => {
  const el = document.querySelector(selector);
  if (!el) return {error: 'No element matches the selector'};
  el.scrollIntoView({block: 'center', inline: 'center'});
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return {error: 'The element is not visible'};
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
    tag: el.tagName.toLowerCase(),
    text: (el.innerText || el.value || '').trim().replace(/\\s+/g, ' ').slice(0, 80),
  };
})(${JSON.stringify(selector)})
`;

const focusScript = (selector: string | undefined, clear: boolean) => `
((selector, clear) => {
  const el = selector ? document.querySelector(selector) : document.activeElement;
  if (!el || el === document.body) return {error: 'No element matches the selector'};
  el.scrollIntoView({block: 'center', inline: 'center'});
  el.focus();
  if (clear && typeof el.select === 'function') el.select();
  return {ok: true};
})(${JSON.stringify(selector ?? null)}, ${JSON.stringify(clear)})
`;

const readValueScript = (selector: string | undefined) => `
((selector) => {
  const el = selector ? document.querySelector(selector) : document.activeElement;
  if (!el) return {value: ''};
  return {value: String(el.value ?? el.textContent ?? '').slice(0, 200)};
})(${JSON.stringify(selector ?? null)})
`;

interface LocateResult {
  error?: string;
  x: number;
  y: number;
  tag: string;
  text: string;
}

export const readPage = async (
  getMainWindow: GetMainWindow,
  device?: string
): Promise<ReadPageResult> => {
  const {deviceName, targetContents} = await resolveTarget(getMainWindow, device);
  const page = await executeInPage<Omit<ReadPageResult, 'deviceName'>>(
    targetContents,
    READ_PAGE_SCRIPT
  );
  return {deviceName, ...page};
};

export const clickElement = async (
  getMainWindow: GetMainWindow,
  selector: string,
  device?: string
): Promise<ClickResult> => {
  const {deviceName, targetContents} = await resolveTarget(getMainWindow, device);
  const located = await executeInPage<LocateResult>(targetContents, locateScript(selector));
  if (located.error !== undefined) {
    throw new Error(
      `${located.error}: ${selector}. Use the read_page tool to discover clickable elements.`
    );
  }
  const x = Math.round(located.x);
  const y = Math.round(located.y);
  targetContents.sendInputEvent({type: 'mouseMove', x, y});
  targetContents.sendInputEvent({type: 'mouseDown', x, y, button: 'left', clickCount: 1});
  targetContents.sendInputEvent({type: 'mouseUp', x, y, button: 'left', clickCount: 1});
  // Give the page a moment to react (state updates, navigation start).
  await sleep(POST_INPUT_SETTLE_MS);
  return {
    deviceName,
    clicked: {tag: located.tag, text: located.text},
    url: targetContents.getURL(),
    pageTitle: targetContents.getTitle(),
  };
};

const sendCharacter = (targetContents: Electron.WebContents, character: string) => {
  targetContents.sendInputEvent({type: 'keyDown', keyCode: character});
  targetContents.sendInputEvent({type: 'char', keyCode: character});
  targetContents.sendInputEvent({type: 'keyUp', keyCode: character});
};

export const typeText = async (
  getMainWindow: GetMainWindow,
  options: {text: string; selector?: string; clear?: boolean; pressEnter?: boolean; device?: string}
): Promise<TypeTextResult> => {
  const {text, selector, clear = false, pressEnter = false, device} = options;
  const {deviceName, targetContents} = await resolveTarget(getMainWindow, device);
  const focused = await executeInPage<{error?: string}>(
    targetContents,
    focusScript(selector, clear)
  );
  if (focused.error !== undefined) {
    throw new Error(
      `${focused.error}: ${selector}. Use the read_page tool to discover form fields.`
    );
  }
  Array.from(text).forEach((character) => sendCharacter(targetContents, character));
  if (pressEnter) {
    targetContents.sendInputEvent({type: 'keyDown', keyCode: 'Return'});
    targetContents.sendInputEvent({type: 'char', keyCode: 'Return'});
    targetContents.sendInputEvent({type: 'keyUp', keyCode: 'Return'});
  }
  await sleep(POST_INPUT_SETTLE_MS);
  const state = await executeInPage<{value: string}>(targetContents, readValueScript(selector));
  return {
    deviceName,
    value: state.value,
    url: targetContents.getURL(),
    pageTitle: targetContents.getTitle(),
  };
};
