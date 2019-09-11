//
//
// reacaptcha-v2.js
//
// Handles initialization and validation of recaptcha widgets

/* global grecaptcha */
import mrUtil from './util';

const mrRecaptchav2 = (($) => {
  // Check mrUtil is present and correct version
  if (!(mrUtil && mrUtil.version >= '1.2.0')) {
    throw new Error('mrUtil >= version 1.2.0 is required.');
  }

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME = 'mrRecaptchav2';
  const VERSION = '1.0.0';
  const DATA_KEY = 'mr.recaptchav2';
  // const EVENT_KEY = `.${DATA_KEY}`;
  // const DATA_API_KEY = '.data-api';
  const JQUERY_NO_CONFLICT = $.fn[NAME];
  const RECAPTCHA_CALLBACK = 'mrRecaptchav2Init';

  const RemoteScript = {
    RECAPTCHAV2: `https://www.google.com/recaptcha/api.js?onload=${RECAPTCHA_CALLBACK}&render=explicit`,
  };

  const Selector = {
    DATA_RECAPTCHA: '[data-recaptcha]',
    FORM: 'form',
  };

  const Options = {
    INVISIBLE: 'invisible',
  };

  // "static" properties
  const instances = [];
  let apiReady = false;

  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class Recaptchav2 {
    constructor(element) {
      this.element = element;
      this.form = this.getForm();
      this.isReady = false;
      this.isValid = false;
      this.options = $(this.element).data();
      this.invisible = this.options.size === Options.INVISIBLE;
      this.id = null;
      // Save instance into static property array
      instances.push(this);
    }

    // getters
    static get VERSION() {
      return VERSION;
    }

    static get ready() {
      return apiReady;
    }

    static get instances() {
      return instances;
    }

    init() {
      if (this.element.innerHTML.replace(/[\s\xA0]+/g, '') === '') {
        this.id = grecaptcha.render(this.element, {
          sitekey: this.options.sitekey,
          theme: this.options.theme,
          size: this.options.size,
          badge: this.options.badge,
          tabindex: this.options.tabindex,
          callback: () => { this.validate(); },
          'expired-callback': () => { this.invalidate(); },
        });
        this.isReady = true;
      }
    }

    validate() {
      this.isValid = true;
      if (this.invisible && this.form) {
        $(this.form).trigger('submit');
      }
    }

    invalidate() {
      this.isValid = false;
    }

    checkValidity() {
      if (this.isReady && this.isValid) {
        return true;
      }
      return false;
    }

    execute() {
      if (this.isReady && this.invisible) {
        grecaptcha.execute(this.id);
      }
    }

    reset() {
      if (this.isReady) {
        grecaptcha.reset(this.id);
        this.isValid = false;
      }
    }

    getForm() {
      const closestForm = $(this.element).closest(Selector.FORM);
      return closestForm.length ? closestForm.get(0) : null;
    }

    static getRecaptchaFromForm(form) {
      if (mrUtil.isElement(form)) {
        const captchaElement = form.querySelector(Selector.DATA_RECAPTCHA);
        if (captchaElement) {
          const data = $(captchaElement).data(DATA_KEY);

          return data || null;
        }
        return null;
      }
      throw new TypeError('Form argument passed to getRecaptchaFromForm is not an element.');
    }

    static set apiReady(ready) {
      if (ready === true && apiReady === false) {
        mrUtil.forEach(Recaptchav2.instances, (index, instance) => {
          instance.init();
        });
      }
      apiReady = true;
    }

    static jQueryInterface() {
      return this.each(function jqEachRecaptchav2() {
        const $element = $(this);
        let data = $element.data(DATA_KEY);
        if (!data) {
          data = new Recaptchav2(this);
          $element.data(DATA_KEY, data);
        }
      });
    }
  }

  window.mrRecaptchav2Init = () => {
    mrRecaptchav2.apiReady = true;
  };

  /**
   * ------------------------------------------------------------------------
   * Initialise API javascript if recaptcha widgets are found
   * ------------------------------------------------------------------------
   */

  $(document).ready(() => {
    const Recaptchav2Elements = $.makeArray($(Selector.DATA_RECAPTCHA));
    if (Recaptchav2Elements.length > 0) {
      mrUtil.getScript(RemoteScript.RECAPTCHAV2);

      /* eslint-disable no-plusplus */
      for (let i = Recaptchav2Elements.length; i--;) {
        const $Recaptchav2 = $(Recaptchav2Elements[i]);
        Recaptchav2.jQueryInterface.call($Recaptchav2, $Recaptchav2.data());
      }
    }
  });

  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */
  /* eslint-disable no-param-reassign */
  $.fn[NAME] = Recaptchav2.jQueryInterface;
  $.fn[NAME].Constructor = Recaptchav2;
  $.fn[NAME].noConflict = function Recaptchav2NoConflict() {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return Recaptchav2.jQueryInterface;
  };
  /* eslint-enable no-param-reassign */

  return Recaptchav2;
})(jQuery);

export default mrRecaptchav2;
