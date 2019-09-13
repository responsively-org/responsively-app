//
//
// ion-rangeslider.js
//
// Initialize the Ion rangeSlider plugin

import jQuery from 'jquery';
import mrUtil from './util';
import 'ion-rangeslider';

const mrIonRangeSlider = (($) => {
  /**
   * Check for Ion rangeSlider dependency
   * https://github.com/IonDen/ion.rangeSlider
   */
  if (typeof $.fn.ionRangeSlider !== 'function') {
    throw new Error('mrIonRangeSlider requires ion.rangeSlider.js (https://github.com/IonDen/ion.rangeSlider)');
  }

  // Check mrUtil is present and correct version
  if (!(mrUtil && mrUtil.version >= '1.2.0')) {
    throw new Error('mrUtil >= version 1.2.0 is required.');
  }

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME = 'mrIonRangeSlider';
  const VERSION = '1.0.0';
  const DATA_KEY = 'mr.ionRangeSlider';
  const EVENT_KEY = `.${DATA_KEY}`;
  const DATA_API_KEY = '.data-api';
  const JQUERY_NO_CONFLICT = $.fn[NAME];
  const ION_RANGE_SLIDER_KEY = 'ionRangeSlider';

  const Event = {
    LOAD_DATA_API: `load${EVENT_KEY}${DATA_API_KEY}`,
    CHANGE: 'input',
  };

  const Selector = {
    DATA_ATTR: 'ion-rangeslider',
    DATA_ION_RANGESLIDER: '[data-ion-rangeslider]',
    INPUT: 'INPUT',
    TEXT: 'text',
  };

  const Options = {
    SKIN_DEFAULT: 'theme',
  };

  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class IonRangeSlider {
    constructor(element) {
      const $element = $(element);
      this.options = $element.data();
      this.element = element;
      this.fromElement = null;
      this.toElement = null;
      this.unitElement = null;
      this.initRangeSlider();
    }

    // getters

    static get VERSION() {
      return VERSION;
    }

    initRangeSlider() {
      const { options } = this;
      if (options.fromSelector) {
        this.fromElement = document.querySelectorAll(options.fromSelector);
        this.setFromUpdateEvent(this.fromElement);
      }
      if (options.toSelector) {
        this.toElement = document.querySelectorAll(options.toSelector);
        this.setToUpdateEvent(this.toElement);
      }
      if (options.unitSelector && options.unitSingle && options.unitPlural) {
        this.unitElement = document.querySelectorAll(options.unitSelector);
      }

      $(this.element).ionRangeSlider({
        skin: Options.SKIN_DEFAULT,
        onStart: mrUtil.getFuncFromString(options.onStart),
        onFinish: mrUtil.getFuncFromString(options.onFinish),
        onChange: this.handleChange,
        scope: this,
        onUpdate: mrUtil.getFuncFromString(options.onUpdate),
      });
      this.rangeSlider = $(this.element).data(ION_RANGE_SLIDER_KEY);
    }

    // HandleChange then also calls the user's callback
    handleChange(data) {
      if (this.fromElement && this.fromElement.length > 0) {
        mrIonRangeSlider.updateValue(this.fromElement, data.from_value || data.from);
      }
      if (this.toElement && this.toElement.length > 0) {
        mrIonRangeSlider.updateValue(this.toElement, data.to_value || data.to);
      }
      if (this.unitElement && this.unitElement.length > 0) {
        const value = parseInt(data.from_value, 10) || data.value;
        mrIonRangeSlider.updateValue(this.unitElement, value > 1
          ? this.options.unitPlural
          : this.options.unitSingle);
      }

      const userChangeFunction = mrUtil.getFuncFromString(this.options.onChange);
      if (userChangeFunction) {
        userChangeFunction(data);
      }
    }

    // Takes a collection of "To" elements and attaches
    // a change event handler to update the rangeslider when user inputs a value
    setToUpdateEvent(collection) {
      mrUtil.forEach(collection, (index, element) => {
        if (element.tagName.toUpperCase() === Selector.INPUT
          && element.type === Selector.TEXT) {
          element.addEventListener(Event.CHANGE, () => {
            this.rangeSlider.update({ to: element.value });
          });
        }
      });
    }

    // Takes a collection of "From" elements and attaches
    // a change event handler to update the rangeslider when user inputs a value
    setFromUpdateEvent(collection) {
      mrUtil.forEach(collection, (index, element) => {
        if (element.tagName.toUpperCase() === Selector.INPUT
          && element.type === Selector.TEXT) {
          element.addEventListener(Event.CHANGE, () => {
            this.rangeSlider.update({ from: element.value });
          });
        }
      });
    }

    static updateValue(collection, value) {
      mrUtil.forEach(collection, (index, element) => {
        const updateElement = element;
        // If element is an input, set the value instead of textContent
        const updateMethod = element.tagName.toUpperCase() === Selector.INPUT
          ? 'value' : 'textContent';
        updateElement[updateMethod] = value;
      });
    }

    static jQueryInterface() {
      return this.each(function jqEachIonRangeSlider() {
        const $element = $(this);
        let data = $element.data(DATA_KEY);
        if (!data) {
          data = new IonRangeSlider(this);
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
    const ionRangeSliderElements = $.makeArray($(Selector.DATA_ION_RANGESLIDER));

    /* eslint-disable no-plusplus */
    for (let i = ionRangeSliderElements.length; i--;) {
      const $ionRangeSlider = $(ionRangeSliderElements[i]);
      IonRangeSlider.jQueryInterface.call($ionRangeSlider, $ionRangeSlider.data());
    }
  });

  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */
  /* eslint-disable no-param-reassign */
  $.fn[NAME] = IonRangeSlider.jQueryInterface;
  $.fn[NAME].Constructor = IonRangeSlider;
  $.fn[NAME].noConflict = function IonRangeSliderNoConflict() {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return IonRangeSlider.jQueryInterface;
  };
  /* eslint-enable no-param-reassign */

  return IonRangeSlider;
})(jQuery);

export default mrIonRangeSlider;
