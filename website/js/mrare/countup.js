//
//
// countup.js
//
// Initialises the srollMonitor plugin and provides interface to watcher objects
// for the countup plugin to start counting up when elements are scrolled into view

import jQuery from 'jquery';
import scrollMonitor from 'scrollmonitor';
import { CountUp } from 'countup.js';

const mrCountup = (($) => {
  /**
   * Check for scrollMonitor dependency
   * scrollMonitor - https://github.com/stutrek/scrollMonitor
   */
  if (typeof scrollMonitor === 'undefined') {
    throw new Error('mrCountup requires scrollMonitor.js (https://github.com/stutrek/scrollMonitor)');
  }

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME = 'mrCountup';
  const VERSION = '1.1.0';
  const DATA_KEY = 'mr.countup';
  const EVENT_KEY = `.${DATA_KEY}`;
  const DATA_API_KEY = '.data-api';
  const JQUERY_NO_CONFLICT = $.fn[NAME];

  const Options = {
    START: 'start',
    END: 'end',
    DURATION: 'duration',
    GROUPING: 'grouping',
    SEPARATOR: 'separator',
    DECIMAL_CHARACTER: 'decimal-character',
    DECIMAL_PLACES: 'decimal-places',
    PREFIX: 'prefix',
    SUFFIX: 'suffix',
    EASING: 'easing',
  };

  const Event = {
    LOAD_DATA_API: `load${EVENT_KEY}${DATA_API_KEY}`,
    RESIZE: `resize${EVENT_KEY}`,
  };

  const Selector = {
    DATA_ATTR: 'countup',
    DATA_COUNTUP: '[data-countup]',
  };

  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class Countup {
    constructor(element) {
      const $element = $(element);

      // Grab data-attributes
      this.start = parseFloat($element.data(Options.START), 10) || 0;
      this.end = parseFloat($element.data(Options.END), 10) || parseFloat($element.text(), 10);
      this.duration = parseFloat($element.data(Options.DURATION), 10) || 2.5;
      this.grouping = $element.data(Options.GROUPING) === true || false;
      this.separator = $element.data(Options.SEPARATOR) || ',';
      this.decimalCharacter = $element.data(Options.DECIMAL_CHARACTER) || '.';
      this.decimalPlaces = parseInt($element.data(Options.DECIMAL_PLACES), 10) || 0;
      this.prefix = $element.data(Options.PREFIX) || '';
      this.suffix = $element.data(Options.SUFFIX) || '';
      // the easing data attribute will only disable easing if false is specified. Defaults to true.
      const easing = $element.data(Options.EASING);
      this.easing = easing === false ? easing : true;
      this.element = element;

      this.initWatcher(element);
      this.startCounting();
    }

    // getters

    static get VERSION() {
      return VERSION;
    }

    initWatcher(element) {
      this.CountUp = new CountUp(
        element,
        this.end,
        {
          startVal: this.start,
          decimalPlaces: this.decimalPlaces,
          duration: this.duration,
          useEasing: this.easing,
          useGrouping: this.grouping,
          separator: this.separator,
          decimal: this.decimalCharacter,
          prefix: this.prefix,
          suffix: this.suffix,
        },
      );

      const watcher = scrollMonitor.create(element);
      this.watcher = watcher;
      watcher.stateChange(() => {
        this.startCounting();
      });
    }

    startCounting() {
      if (this.watcher.isFullyInViewport) {
        if (!this.CountUp.error) {
          this.CountUp.start();
        } else {
          throw new Error(this.CountUp.error);
        }
      }
    }

    static jQueryInterface() {
      return this.each(function jqEachCountup() {
        const $element = $(this);
        let data = $element.data(DATA_KEY);
        if (!data) {
          data = new Countup(this);
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
    const countupElements = $.makeArray($(Selector.DATA_COUNTUP));

    /* eslint-disable no-plusplus */
    for (let i = countupElements.length; i--;) {
      const $countup = $(countupElements[i]);
      Countup.jQueryInterface.call($countup, $countup.data());
    }
  });

  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */
  /* eslint-disable no-param-reassign */
  $.fn[NAME] = Countup.jQueryInterface;
  $.fn[NAME].Constructor = Countup;
  $.fn[NAME].noConflict = function CountupNoConflict() {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return Countup.jQueryInterface;
  };
  /* eslint-enable no-param-reassign */

  return Countup;
})(jQuery);

export default mrCountup;
