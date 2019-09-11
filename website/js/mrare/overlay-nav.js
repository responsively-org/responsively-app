//
//
// overlay-nav.js
//
// Allows navs to overlay the first section of content by setting
// style to pull content up and add padding to first sibling element

import jQuery from 'jquery';
import mrUtil from './util';

const mrOverlayNav = (($) => {
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME = 'mrOverlayNav';
  const VERSION = '1.1.0';
  const DATA_KEY = 'mr.overlayNav';
  const EVENT_KEY = `.${DATA_KEY}`;
  const JQUERY_NO_CONFLICT = $.fn[NAME];

  const Event = {
    RESIZE: `resize${EVENT_KEY}`,
    RESIZED: `resized${EVENT_KEY}`,
    IMAGE_LOAD: 'load',
    TOGGLE_SHOW: 'show.bs.collapse',
    TOGGLE_HIDDEN: 'hidden.bs.collapse',
    NOTIFICATION_CLOSE: '',
    ALERT_CLOSE: 'close.bs.alert',
  };

  const Selector = {
    CONTAINER: 'body > div.navbar-container',
    OVERLAY_NAV: 'body > div.navbar-container > nav[data-overlay]',
    NAV: 'nav',
    OVERLAY_SECTION: '[data-overlay]',
    IMAGE: 'img',
    NAV_TOGGLED: 'navbar-toggled-show',
  };

  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class OverlayNav {
    constructor(element) {
      this.ticking = false; // Used to debounce resize event
      this.element = element;
      this.navHeight = this.getNavHeight();
      this.navToggled = false;
      this.container = OverlayNav.getContainerElement();
      this.overlayElement = OverlayNav.getFirstOverlayElement();
      this.setImageLoadEvent();
      this.updateValues();
      this.setResizeEvent();
      this.setNavToggleEvents();
    }

    // getters

    static get VERSION() {
      return VERSION;
    }

    getNavHeight() {
      this.navHeight = this.element.getBoundingClientRect().height;
    }

    updateValues() {
      this.getNavHeight();
      this.updateContainer();
      this.updateOverlayElement();
      $(this.element).trigger($.Event(Event.RESIZED));
    }

    updateContainer() {
      // Don't update min height on the container if the nav is toggled/open.
      if (!this.container || this.navToggled) {
        return;
      }
      this.container.style.minHeight = `${this.navHeight}px`;
      this.container.style.marginBottom = `-${this.navHeight}px`;
    }

    updateOverlayElement() {
      if (!this.overlayElement || this.navToggled) {
        return;
      }
      this.overlayElement.style.setProperty('padding-top', `${this.navHeight}px`, 'important');
    }

    setResizeEvent() {
      $(window).on(`${Event.RESIZE} ${Event.ALERT_CLOSE}`, () => {
        if (!this.ticking) {
          window.requestAnimationFrame(() => {
            this.updateValues();
            this.ticking = false;
          });
          this.ticking = true;
        }
      });
    }

    setNavToggleEvents() {
      $(this.element).on(`${Event.TOGGLE_SHOW}`, () => {
        this.navToggled = true;
      });

      // navHeight should only be recalculated when the nav is not open/toggled
      // Don't allow the navHeight to be recalculated until the nav is fully hidden
      $(this.element).on(`${Event.TOGGLE_HIDDEN}`, () => {
        this.navToggled = false;
      });
    }

    setImageLoadEvent() {
      const images = this.container.querySelectorAll(Selector.IMAGE);
      mrUtil.forEach(images, (index, image) => {
        image.addEventListener(Event.IMAGE_LOAD, () => this.updateValues());
      });
    }

    static getContainerElement() {
      if (!this.container) {
        this.container = document.querySelector(Selector.CONTAINER);
      }
      return this.container;
    }


    static getFirstOverlayElement() {
      return document.querySelector(`${Selector.OVERLAY_SECTION}:not(${Selector.NAV})`);
    }

    static jQueryInterface() {
      return this.each(function jqEachoverlayNav() {
        const $element = $(this);
        let data = $element.data(DATA_KEY);
        if (!data) {
          data = new OverlayNav(this);
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

  $(document).ready(() => {
    const overlayNavElements = $.makeArray($(Selector.OVERLAY_NAV));

    /* eslint-disable no-plusplus */
    for (let i = overlayNavElements.length; i--;) {
      const $overlayNav = $(overlayNavElements[i]);
      OverlayNav.jQueryInterface.call($overlayNav, $overlayNav.data());
    }
  });

  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */
  /* eslint-disable no-param-reassign */
  $.fn[NAME] = OverlayNav.jQueryInterface;
  $.fn[NAME].Constructor = OverlayNav;
  $.fn[NAME].noConflict = function overlayNavNoConflict() {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return OverlayNav.jQueryInterface;
  };
  /* eslint-enable no-param-reassign */

  return OverlayNav;
})(jQuery);

export default mrOverlayNav;
