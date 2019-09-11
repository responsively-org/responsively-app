//
//
// flatpickr.js
//
// an initializer for the flatpickr date/time picker plugin
// https://flatpickr.js.org/
//

import jQuery from 'jquery';
import flatpickr from 'flatpickr';

const mrFlatpickr = (($) => {
  /**
   * Check for flatpickr dependency
   */
  if (typeof flatpickr === 'undefined') {
    throw new Error('mrFlatpickr requires flatpickr.js (https://github.com/flatpickr/flatpickr)');
  }

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME = 'mrFlatpickr';
  const VERSION = '1.0.0';
  const DATA_KEY = 'mr.flatpickr';
  const EVENT_KEY = `.${DATA_KEY}`;
  const DATA_API_KEY = '.data-api';
  const JQUERY_NO_CONFLICT = $.fn[NAME];

  const Event = {
    LOAD_DATA_API: `load${EVENT_KEY}${DATA_API_KEY}`,
  };

  const Selector = {
    FLATPICKR: '[data-flatpickr]',
  };

  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class Flatpickr {
    constructor(element) {
      // The current flatpickr element
      this.element = element;
      // const $element = $(element);

      this.initflatpickr();
    }

    // getters
    static get VERSION() {
      return VERSION;
    }

    initflatpickr() {
      const options = $(this.element).data();
      this.instance = flatpickr(this.element, options);
    }

    static jQueryInterface() {
      return this.each(function jqEachFlatpickr() {
        const $element = $(this);
        let data = $element.data(DATA_KEY);
        if (!data) {
          data = new Flatpickr(this);
          $element.data(DATA_KEY, data);
        }
      });
    }
  }
  // END Class definition

  /**
   * ------------------------------------------------------------------------
   * Initialise by data attribute
   * ------------------------------------------------------------------------
   */

  $(window).on(Event.LOAD_DATA_API, () => {
    const pickers = $.makeArray($(Selector.FLATPICKR));

    /* eslint-disable no-plusplus */
    for (let i = pickers.length; i--;) {
      const $flatpickr = $(pickers[i]);
      Flatpickr.jQueryInterface.call($flatpickr, $flatpickr.data());
    }
  });

  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */
  /* eslint-disable no-param-reassign */
  $.fn[NAME] = Flatpickr.jQueryInterface;
  $.fn[NAME].Constructor = Flatpickr;
  $.fn[NAME].noConflict = function flatpickrNoConflict() {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return Flatpickr.jQueryInterface;
  };
  /* eslint-enable no-param-reassign */

  return Flatpickr;
})(jQuery);

export default mrFlatpickr;
