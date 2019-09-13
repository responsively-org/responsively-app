//
// svg-injector.js
//

// Initialize the injection of SVGs into the DOM from src on img tags

// SVGInjector uses Array.from() which IE does not support.
import 'core-js/features/array/from';
import { SVGInjector } from '@tanem/svg-injector';
import mrUtil from './util';


if (mrUtil.isIE()) {
  window.addEventListener('load', () => {
    SVGInjector(document.querySelectorAll('[class][data-inject-svg]'));
  });
  SVGInjector(document.querySelectorAll('[data-inject-svg]'));
} else {
  SVGInjector(document.querySelectorAll('[data-inject-svg]'));
}
