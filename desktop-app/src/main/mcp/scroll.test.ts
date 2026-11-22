import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {executeInPage, resolveTarget} from './interactions';
import {scrollTo, ScrollToOptions} from './scroll';

vi.mock('./interactions', () => ({
  resolveTarget: vi.fn(),
  executeInPage: vi.fn(),
}));

const getMainWindow = () => null;
const targetContents = {getURL: () => 'https://example.com'} as unknown as Electron.WebContents;
const scrollIntoView = vi.fn();

const renderPage = (html: string) => {
  document.body.innerHTML = html;
  for (const element of [document.body, ...Array.from(document.body.querySelectorAll('*'))]) {
    element.getBoundingClientRect = () => new DOMRect(10, 20, 100, 30);
    element.scrollIntoView = scrollIntoView;
  }
};

const performScroll = async (options: ScrollToOptions) => {
  const pending = scrollTo(getMainWindow, options);
  await vi.runAllTimersAsync();
  return pending;
};

describe('scrollTo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    vi.mocked(resolveTarget).mockResolvedValue({deviceName: 'Desktop', targetContents});
    vi.mocked(executeInPage).mockImplementation((_target, script) => window.eval(script));
    vi.stubGlobal('CSS', {escape: (value: string) => value});
    vi.spyOn(window, 'scrollTo').mockImplementation((options: unknown) => {
      const position = options as {left: number; top: number};
      window.scrollX = position.left;
      window.scrollY = position.top;
    });
    window.scrollX = 42;
    window.scrollY = 70;
    document.title = 'Scroll fixtures';
    renderPage('');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it.each([
    [{}, /exactly one scroll target/],
    [{selector: '#target', text: 'Target'}, /exactly one scroll target/],
    [{selector: '#target', y: 0}, /exactly one scroll target/],
    [{text: 'Target', x: 0}, /exactly one scroll target/],
    [{selector: '  '}, /non-empty CSS selector/],
    [{text: '\n '}, /non-empty string/],
    [{y: -1}, /finite, non-negative/],
    [{x: Infinity}, /finite, non-negative/],
    [{y: NaN}, /finite, non-negative/],
    [{y: '100'}, /finite, non-negative/],
    [{y: 0, block: 'center'}, /with a selector or text target/],
    [{selector: '#target', block: 'middle'}, /block must be/],
    [{selector: '#target', exact: true}, /only with a text target/],
    [{text: 'Target', exact: 'yes'}, /boolean option/],
  ])('rejects invalid arguments before resolving a preview: %j', async (options, error) => {
    await expect(scrollTo(getMainWindow, options as ScrollToOptions)).rejects.toThrow(error);
    expect(resolveTarget).not.toHaveBeenCalled();
    expect(executeInPage).not.toHaveBeenCalled();
  });

  it('scrolls to CSS pixel coordinates and preserves an unspecified axis', async () => {
    const result = await performScroll({y: 0, device: 'Desktop'});
    expect(resolveTarget).toHaveBeenCalledWith(getMainWindow, 'Desktop');
    expect(window.scrollTo).toHaveBeenCalledWith({left: 42, top: 0, behavior: 'instant'});
    expect(result).toMatchObject({
      deviceName: 'Desktop',
      pageTitle: 'Scroll fixtures',
      scroll: {x: 42, y: 0},
      viewport: {width: window.innerWidth, height: window.innerHeight},
    });
    expect(result).not.toHaveProperty('matchedElement');
    const horizontal = await performScroll({x: 8});
    expect(horizontal.scroll).toEqual({x: 8, y: 0});
  });

  it('scrolls a selector into view instantly and reports the target', async () => {
    renderPage('<section><h2 id="pricing">Pricing <span>plans</span></h2></section>');
    const result = await performScroll({selector: '#pricing', block: 'start'});
    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'instant',
      block: 'start',
      inline: 'nearest',
    });
    expect(result.matchedElement).toEqual({
      selector: '#pricing',
      tag: 'h2',
      text: 'Pricing plans',
      rect: {x: 10, y: 20, width: 100, height: 30},
    });
  });

  it('matches the smallest element with case-insensitive, normalized substring text', async () => {
    renderPage(
      '<main><section><h2 id="pricing">Pricing \n <span>plans</span></h2></section></main>'
    );
    const result = await performScroll({text: '  PRICING   plans '});
    expect(result.matchedElement?.selector).toBe('#pricing');
    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'instant',
      block: 'center',
      inline: 'nearest',
    });
  });

  it('uses exact text to distinguish a label from a longer label', async () => {
    renderPage('<h2 id="pricing">Pricing</h2><a id="plans">Pricing plans</a>');
    await expect(scrollTo(getMainWindow, {text: 'Pricing'})).rejects.toThrow(
      /2 rendered elements.*exact: true/
    );
    const result = await performScroll({text: ' PRICING ', exact: true});
    expect(result.matchedElement?.selector).toBe('#pricing');
  });

  it('rejects ambiguous text and includes selectors to disambiguate', async () => {
    renderPage('<button id="first">Details</button><button id="second">Details</button>');
    await expect(scrollTo(getMainWindow, {text: 'Details', exact: true})).rejects.toThrow(
      /2 rendered elements.*#first \(Details\), #second \(Details\)/
    );
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it.each(['display: none', 'visibility: hidden', 'opacity: 0', 'content-visibility: hidden'])(
    'excludes hidden descendants from ancestor text (%s)',
    async (style) => {
      renderPage(`<section id="parent"><span style="${style}">Secret label</span></section>`);
      await expect(scrollTo(getMainWindow, {text: 'Secret label'})).rejects.toThrow(
        /No rendered element matches/
      );
      expect(scrollIntoView).not.toHaveBeenCalled();
    }
  );

  it('does not match text in script, style, or template elements', async () => {
    renderPage(
      '<script>secret label</script><style>/* secret label */</style><template>secret label</template>'
    );
    await expect(scrollTo(getMainWindow, {text: 'secret label'})).rejects.toThrow(
      /No rendered element matches/
    );
  });

  it('uses only rendered selector matches and rejects missing, invalid, or ambiguous selectors', async () => {
    renderPage(
      '<p class="entry" style="display: none">Hidden</p><p class="entry" id="shown">Shown</p>'
    );
    expect((await performScroll({selector: '.entry'})).matchedElement?.selector).toBe('#shown');
    await expect(scrollTo(getMainWindow, {selector: '['})).rejects.toThrow(/Invalid CSS selector/);
    await expect(scrollTo(getMainWindow, {selector: '#missing'})).rejects.toThrow(
      /No element matches/
    );
    await expect(scrollTo(getMainWindow, {selector: '[style]'})).rejects.toThrow(/only hidden/);
    renderPage('<p class="entry" id="one">One</p><p class="entry" id="two">Two</p>');
    await expect(scrollTo(getMainWindow, {selector: '.entry'})).rejects.toThrow(
      /2 rendered elements.*#one, #two/
    );
  });

  it('finishes when animation frames are unavailable in a background preview', async () => {
    vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(99);
    const cancelFrame = vi.spyOn(window, 'cancelAnimationFrame');
    const result = await performScroll({y: 100});
    expect(result.scroll.y).toBe(100);
    expect(cancelFrame).toHaveBeenCalledWith(99);
  });
});
