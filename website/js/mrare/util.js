//
//
// Util
//
// Medium Rare utility functions
// v 1.3.0

import jQuery from 'jquery';

const mrUtil = (($) => {
  const VERSION = '1.2.0';

  const Tagname = {
    SCRIPT: 'script',
  };

  const Selector = {
    RECAPTCHA: '[data-recaptcha]',
  };

  // Activate tooltips
  $('body').tooltip({ selector: '[data-toggle="tooltip"]', container: 'body' });

  // Activate popovers
  $('body').popover({ selector: '[data-toggle="popover"]', container: 'body' });

  // Activate toasts
  $('.toast').toast();

  const Util = {

    version: VERSION,
    selector: Selector,

    activateIframeSrc(iframe) {
      const $iframe = $(iframe);
      if ($iframe.attr('data-src')) {
        $iframe.attr('src', $iframe.attr('data-src'));
      }
    },

    idleIframeSrc(iframe) {
      const $iframe = $(iframe);
      $iframe.attr('data-src', $iframe.attr('src')).attr('src', '');
    },

    forEach(array, callback, scope) {
      if (array) {
        if (array.length) {
          for (let i = 0; i < array.length; i += 1) {
            callback.call(scope, i, array[i]); // passes back stuff we need
          }
        } else if (array[0] || mrUtil.isElement(array)) { callback.call(scope, 0, array); }
      }
    },

    dedupArray(arr) {
      return arr.reduce((p, c) => {
        // create an identifying String from the object values
        const id = JSON.stringify(c);
        // if the JSON string is not found in the temp array
        // add the object to the output array
        // and add the key to the temp array
        if (p.temp.indexOf(id) === -1) {
          p.out.push(c);
          p.temp.push(id);
        }
        return p;
      // return the deduped array
      }, { temp: [], out: [] }).out;
    },

    isElement(obj) {
      return !!(obj && obj.nodeType === 1);
    },

    getFuncFromString(funcName, context) {
      const findFunc = funcName || null;

      // if already a function, return
      if (typeof findFunc === 'function') return funcName;

      // if string, try to find function or method of object (of "obj.func" format)
      if (typeof findFunc === 'string') {
        if (!findFunc.length) return null;
        let target = context || window;
        const func = findFunc.split('.');
        while (func.length) {
          const ns = func.shift();
          if (typeof target[ns] === 'undefined') return null;
          target = target[ns];
        }
        if (typeof target === 'function') return target;
      }
      // return null if could not parse
      return null;
    },
    getScript(source, callback) {
      let script = document.createElement(Tagname.SCRIPT);
      const prior = document.getElementsByTagName(Tagname.SCRIPT)[0];
      script.async = 1;
      script.defer = 1;

      script.onreadystatechange = (_, isAbort) => {
        if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState)) {
          script.onload = null;
          script.onreadystatechange = null;
          script = undefined;

          if (!isAbort && callback && typeof callback === 'function') { callback(); }
        }
      };

      script.onload = script.onreadystatechange;

      script.src = source;
      prior.parentNode.insertBefore(script, prior);
    },
    isIE() {
      const ua = window.navigator.userAgent;
      const isIE = /MSIE|Trident/.test(ua);
      return isIE;
    },
  };

  return Util;
})(jQuery);

export default mrUtil;
