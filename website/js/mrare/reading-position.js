//
//
// readingPosition.js
//
// Initialises the srollMonitor plugin and provides interface to watcher objects
// for sticking elements to the top of viewport while scrolling

import scrollMonitor from 'scrollmonitor';
import mrUtil from './util';

const mrReadingPosition = (($) => {
  /**
   * Check for scrollMonitor dependency
   * scrollMonitor - https://github.com/stutrek/scrollMonitor
   */
  if (typeof scrollMonitor === 'undefined') {
    throw new Error('mrReadingPosition requires scrollMonitor.js (https://github.com/stutrek/scrollMonitor)');
  }

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME = 'mrReadingPosition';
  const VERSION = '1.0.0';
  const DATA_KEY = 'mr.readingPosition';
  const EVENT_KEY = `.${DATA_KEY}`;
  const DATA_API_KEY = '.data-api';
  const JQUERY_NO_CONFLICT = $.fn[NAME];

  const Css = {
    HIDDEN: 'reading-position-hidden',
  };

  const Event = {
    LOAD_DATA_API: `load${EVENT_KEY}${DATA_API_KEY}`,
    RESIZE: 'resize',
    SCROLL: 'scroll',
  };


  const Selector = {
    PROGRESS: 'progress.reading-position',
    DATA_ATTR: 'reading-position',
    DATA_READING_POSITION: '[data-reading-position]',
    VALUE: 'value',
    MAX: 'max',
  };

  const Value = {
    BAR_MAX: 100,
    BAR_MIN: 0,
  };

  const progressBars = document.querySelectorAll(Selector.PROGRESS);
  // const $window = $(window);
  // const $document = $(document);

  const getWindowHeight = () => Math.max(
    document.documentElement.clientHeight,
    window.innerHeight || 0,
  );

  const getScrollPosition = () => (document.documentElement.scrollTop === 0
    ? document.body.scrollTop : document.documentElement.scrollTop)
      || 0;

  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */
  class ReadingPosition {
    constructor(element) {
      this.progressBars = progressBars;
      this.element = element;
      this.top = 0;
      this.bottom = 0;
      this.height = 0;
      this.scrollLength = 0;
      this.articlePositionPercent = 0;
      this.ticking = false;
      this.inView = false;
      this.reading = false;
      this.initWatcher(element);
      this.initBarValues();
      this.setValue(getScrollPosition());
      this.setScrollEvent();
      this.setResizeEvent();
    }

    // get VERSION
    static get VERSION() {
      return VERSION;
    }

    initWatcher(element) {
      const watcher = scrollMonitor.create(element);
      this.watcher = watcher;
      this.recalculateAll();

      watcher.stateChange(() => {
        this.inView = watcher.isInViewport;
        this.reading = watcher.isAboveViewport && watcher.isFullyInViewport;
        this.toggleBars(this.reading);
      });
    }

    initBarValues() {
      mrUtil.forEach(this.progressBars, (index, bar) => {
        bar.setAttribute(Selector.MAX, Value.BAR_MAX);
      });
    }

    setValue(scrollPosition) {
      this.recalculatePercentage(scrollPosition);
      mrUtil.forEach(this.progressBars, (index, bar) => {
        bar.setAttribute(Selector.VALUE, this.articlePositionPercent);
      });
    }

    toggleBars(show) {
      mrUtil.forEach(this.progressBars, (index, bar) => {
        if (show) { bar.classList.remove(Css.HIDDEN); } else { bar.classList.add(Css.HIDDEN); }
      });
    }

    setScrollEvent() {
      window.addEventListener(Event.SCROLL, () => {
        const scrollPosition = getScrollPosition();

        if (!this.ticking && this.inView && this.reading) {
          window.requestAnimationFrame(() => {
            this.setValue(scrollPosition);
            this.ticking = false;
          });

          this.ticking = true;
        }
      });
    }

    setResizeEvent() {
      window.addEventListener(Event.RESIZE, () => this.recalculateAll());
    }

    recalculateAll() {
      this.watcher.recalculateLocation();
      this.top = this.watcher.top;
      this.bottom = this.watcher.bottom;
      this.height = this.watcher.height;
      // Scroll Length is the scrolling viewable area of the article
      // from top of article = top of window to bottom of article = bottom of window.
      this.scrollLength = this.height - getWindowHeight();
      // Position percent is how far the view is through the scrollable length in percentage.
      this.recalculatePercentage(getScrollPosition());
    }

    recalculatePercentage(scrollPosition) {
      this.articlePositionPercent = !scrollPosition ? 0
        : ((scrollPosition - this.top) / this.scrollLength) * 100;
    }

    static jQueryInterface() {
      return this.each(function jqEachReadingPosition() {
        const $element = $(this);
        let data = $element.data(DATA_KEY);
        if (!data) {
          data = new ReadingPosition(this);
          $element.data(DATA_KEY, data);
        }
      });
    }
  }

  /**
   * ------------------------------------------------------------------------
   * Initialise by data attribute
   * ------------------------------------------------------------------------
   */

  $(window).on(Event.LOAD_DATA_API, () => {
    // Proceed to initialise only if a progress bar is found in the document
    if (progressBars.length === 0) {
      return;
    }

    // Gather articles and loop over, initialising ReadingPosition instance
    const readingPositionElements = $.makeArray($(Selector.DATA_READING_POSITION));
    /* eslint-disable no-plusplus */
    for (let i = readingPositionElements.length; i--;) {
      const $readingPosition = $(readingPositionElements[i]);
      ReadingPosition.jQueryInterface.call($readingPosition, $readingPosition.data());
    }
  });

  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */
  /* eslint-disable no-param-reassign */
  $.fn[NAME] = ReadingPosition.jQueryInterface;
  $.fn[NAME].Constructor = ReadingPosition;
  $.fn[NAME].noConflict = function ReadingPositionNoConflict() {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return ReadingPosition.jQueryInterface;
  };
  /* eslint-enable no-param-reassign */

  return ReadingPosition;
})(jQuery);

export default mrReadingPosition;
