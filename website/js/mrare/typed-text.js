//
//
// typed-text.js
//
// an initializer for the Typed.js text animation plugin
//
//

import jQuery from 'jquery';
import Typed from 'typed.js';
import scrollMonitor from 'scrollmonitor';

const mrTypedText = (($) => {
  /**
   * Check for typedText dependency
   * typedText - https://github.com/mattboldt/typed.js/
   */
  if (typeof Typed !== 'function') {
    throw new Error('mrTypedText requires typed.js (https://github.com/mattboldt/typed.js/)');
  }

  /**
   * Check for scrollMonitor dependency
   * scrollMonitor - https://github.com/stutrek/scrollMonitor
   */
  if (typeof scrollMonitor === 'undefined') {
    throw new Error('mrTypedText requires scrollMonitor.js (https://github.com/stutrek/scrollMonitor)');
  }

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME = 'mrTypedText';
  const VERSION = '1.0.0';
  const DATA_KEY = 'mr.typedText';
  const EVENT_KEY = `.${DATA_KEY}`;
  const DATA_API_KEY = '.data-api';
  const JQUERY_NO_CONFLICT = $.fn[NAME];

  const Event = {
    LOAD_DATA_API: `load${EVENT_KEY}${DATA_API_KEY}`,
  };

  const Selector = {
    TYPED_TEXT: '[data-typed-text]',
  };

  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class TypedText {
    constructor(element) {
      // The current map element
      this.element = element;
      const $element = $(element);
      this.Typed = new Typed(this.element, $element.data());
      this.initWatcher(element);
    }

    // getters
    static get VERSION() {
      return VERSION;
    }

    static jQueryInterface() {
      return this.each(function jqEachTypedText() {
        const $element = $(this);
        let data = $element.data(DATA_KEY);
        if (!data) {
          data = new TypedText(this);
          $element.data(DATA_KEY, data);
        }
      });
    }

    initWatcher(element) {
      const watcher = scrollMonitor.create(element);
      watcher.stateChange(() => {
        // Stop the Typed animation when the element leaves the viewport
        if (watcher.isInViewport) { this.Typed.start(); } else { this.Typed.stop(); }
      });
    }
    // END Class definition
  }
  /**
   * ------------------------------------------------------------------------
   * Initialise by data attribute
   * ------------------------------------------------------------------------
   */

  $(window).on(Event.LOAD_DATA_API, () => {
    const cdownsOnPage = $.makeArray($(Selector.TYPED_TEXT));

    /* eslint-disable no-plusplus */
    for (let i = cdownsOnPage.length; i--;) {
      const $typedText = $(cdownsOnPage[i]);
      TypedText.jQueryInterface.call($typedText, $typedText.data());
    }
  });

  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */
  /* eslint-disable no-param-reassign */
  $.fn[NAME] = TypedText.jQueryInterface;
  $.fn[NAME].Constructor = TypedText;
  $.fn[NAME].noConflict = function TypedTextNoConflict() {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return TypedText.jQueryInterface;
  };
  /* eslint-enable no-param-reassign */

  return TypedText;
})(jQuery);

export default mrTypedText;
