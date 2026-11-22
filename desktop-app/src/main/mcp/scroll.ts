import {GetMainWindow} from './bridge';
import {assertOperablePage} from './file-url';
import {executeInPage, resolveTarget} from './interactions';

export interface ScrollToOptions {
  device?: string;
  selector?: string;
  text?: string;
  x?: number;
  y?: number;
  exact?: boolean;
  block?: 'start' | 'center' | 'end' | 'nearest';
}

export interface ScrollToResult {
  deviceName: string;
  url: string;
  pageTitle: string;
  scroll: {x: number; y: number};
  viewport: {width: number; height: number};
  page: {width: number; height: number};
  matchedElement?: {
    selector: string;
    tag: string;
    text: string;
    rect: {x: number; y: number; width: number; height: number};
  };
}

const validateOptions = ({selector, text, x, y, exact, block}: ScrollToOptions) => {
  const hasSelector = selector !== undefined;
  const hasText = text !== undefined;
  const hasCoordinates = x !== undefined || y !== undefined;
  if (Number(hasSelector) + Number(hasText) + Number(hasCoordinates) !== 1) {
    throw new Error('Provide exactly one scroll target: selector, text, or x and/or y.');
  }
  if (hasSelector && (typeof selector !== 'string' || !selector.trim())) {
    throw new Error('selector must be a non-empty CSS selector.');
  }
  if (hasText && (typeof text !== 'string' || !text.trim())) {
    throw new Error('text must be a non-empty string.');
  }
  for (const [name, value] of Object.entries({x, y})) {
    if (
      value !== undefined &&
      (typeof value !== 'number' || !Number.isFinite(value) || value < 0)
    ) {
      throw new Error(`${name} must be a finite, non-negative number of CSS pixels.`);
    }
  }
  if (exact !== undefined && (!hasText || typeof exact !== 'boolean')) {
    throw new Error('exact is a boolean option available only with a text target.');
  }
  if (
    block !== undefined &&
    (hasCoordinates || !['start', 'center', 'end', 'nearest'].includes(block))
  ) {
    throw new Error(
      'block must be start, center, end, or nearest, with a selector or text target.'
    );
  }
};

const scrollScript = (options: ScrollToOptions) => `
(async ({selector, text, x, y, exact = false, block = 'center'}) => {
  const normalize = (value) => value.trim().replace(/\\s+/g, ' ');
  const textCache = new Map();
  const renderedText = (el) => {
    if (textCache.has(el)) return textCache.get(el);
    const style = getComputedStyle(el);
    if (el.matches('script, style, noscript, template') || style.display === 'none' ||
        style.opacity === '0' || style.contentVisibility === 'hidden') return '';
    if (el.tagName === 'BR') return '\\n';
    const visible = style.visibility !== 'hidden' && style.visibility !== 'collapse';
    let content = '';
    for (const child of el.childNodes) {
      if (child.nodeType === Node.TEXT_NODE && visible) content += child.textContent;
      if (child.nodeType === Node.ELEMENT_NODE) {
        const display = getComputedStyle(child).display;
        const separate = display && display !== 'inline' && display !== 'contents' &&
          !display.startsWith('inline-');
        content += (separate ? '\\n' : '') + renderedText(child) + (separate ? '\\n' : '');
      }
    }
    textCache.set(el, content);
    return content;
  };
  const label = (el) => normalize(renderedText(el));
  const isRendered = (el) => {
    if (el.matches('script, style, noscript, template')) return false;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return false;
    const style = getComputedStyle(el);
    if (style.visibility === 'hidden' || style.visibility === 'collapse') return false;
    for (let node = el; node; node = node.parentElement) {
      const parentStyle = getComputedStyle(node);
      if (parentStyle.display === 'none' || parentStyle.opacity === '0' ||
          parentStyle.contentVisibility === 'hidden') return false;
    }
    return true;
  };
  const cssPath = (el) => {
    const parts = [];
    for (let node = el; node; node = node.parentElement) {
      if (node.id) {
        const idSelector = '#' + CSS.escape(node.id);
        if (document.querySelectorAll(idSelector).length === 1) {
          parts.unshift(idSelector);
          return parts.join(' > ');
        }
      }
      let part = node.tagName.toLowerCase();
      if (node.parentElement) {
        const siblings = Array.from(node.parentElement.children)
          .filter((child) => child.tagName === node.tagName);
        if (siblings.length > 1) part += ':nth-of-type(' + (siblings.indexOf(node) + 1) + ')';
      }
      parts.unshift(part);
    }
    return parts.join(' > ');
  };

  let target;
  if (selector !== undefined) {
    let matches;
    try {
      matches = Array.from(document.querySelectorAll(selector));
    } catch {
      return {error: 'Invalid CSS selector: ' + selector};
    }
    if (!matches.length) return {error: 'No element matches the selector: ' + selector};
    const rendered = matches.filter(isRendered);
    if (!rendered.length) return {error: 'The selector matches only hidden or unrendered elements: ' + selector};
    if (rendered.length > 1) {
      return {error: 'The selector matches ' + rendered.length + ' rendered elements. Use a more specific selector. Examples: ' +
        rendered.slice(0, 5).map(cssPath).join(', ')};
    }
    [target] = rendered;
  } else if (text !== undefined) {
    const query = normalize(text).toLowerCase();
    const matches = (document.body ? [document.body, ...document.body.querySelectorAll('*')] : [])
      .filter(isRendered)
      .filter((el) => {
        const content = label(el).toLowerCase();
        return exact ? content === query : content.includes(query);
      });
    // Select the smallest containing element, rather than all of its ancestors.
    const containingAncestors = new Set();
    for (const el of matches) {
      for (let parent = el.parentElement; parent; parent = parent.parentElement) {
        if (containingAncestors.has(parent)) break;
        containingAncestors.add(parent);
      }
    }
    const smallest = matches.filter((el) => !containingAncestors.has(el));
    if (!smallest.length) return {error: 'No rendered element matches the text: ' + text};
    if (smallest.length > 1) {
      return {error: 'The text matches ' + smallest.length + ' rendered elements. Use a selector' +
        (exact ? '' : ', more specific text, or exact: true') + '. Examples: ' +
        smallest.slice(0, 5).map((el) => cssPath(el) + ' (' + label(el).slice(0, 80) + ')').join(', ')};
    }
    [target] = smallest;
  }

  if (target) {
    // Native scrolling handles every scrollable ancestor, including nested panels.
    target.scrollIntoView({behavior: 'instant', block, inline: 'nearest'});
  } else {
    window.scrollTo({left: x ?? window.scrollX, top: y ?? window.scrollY, behavior: 'instant'});
  }
  // Let scroll handlers and layout run, with a deadline for background previews
  // whose animation frames may be throttled.
  await new Promise((resolve) => {
    let frame;
    const timeout = setTimeout(() => {
      cancelAnimationFrame(frame);
      resolve();
    }, 250);
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        clearTimeout(timeout);
        resolve();
      });
    });
  });
  if (target && (!target.isConnected || !isRendered(target))) {
    return {error: 'The matched element changed or became hidden while scrolling. Retry with a current selector or text target.'};
  }
  textCache.clear();
  const body = document.body;
  const root = document.documentElement;
  const result = {
    url: location.href,
    pageTitle: document.title,
    scroll: {x: window.scrollX, y: window.scrollY},
    viewport: {width: window.innerWidth, height: window.innerHeight},
    page: {
      width: Math.max(root.scrollWidth, root.clientWidth, body?.scrollWidth ?? 0),
      height: Math.max(root.scrollHeight, root.clientHeight, body?.scrollHeight ?? 0),
    },
  };
  if (target) {
    const rect = target.getBoundingClientRect();
    result.matchedElement = {
      selector: cssPath(target),
      tag: target.tagName.toLowerCase(),
      text: label(target).slice(0, 200),
      rect: {x: rect.x, y: rect.y, width: rect.width, height: rect.height},
    };
  }
  return result;
})(${JSON.stringify(options)})
`;

export const scrollTo = async (
  getMainWindow: GetMainWindow,
  options: ScrollToOptions
): Promise<ScrollToResult> => {
  validateOptions(options);
  const {deviceName, targetContents} = await resolveTarget(getMainWindow, options.device);
  const result = await executeInPage<Omit<ScrollToResult, 'deviceName'> | {error: string}>(
    targetContents,
    scrollScript(options)
  );
  if ('error' in result) throw new Error(result.error);
  assertOperablePage(deviceName, targetContents.getURL());
  return {deviceName, ...result};
};
