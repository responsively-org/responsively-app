//
//
// dropdown-grid.js
//
// Handles "mega menu" style dropdowns allowing for full BS grid markup within.
// Based on Bootstrap v4.1.x dropdown.js which is licensed under MIT
// (https://github.com/twbs/bootstrap/blob/master/LICENSE)

import jQuery from 'jquery';
import mrUtil from './util';

const mrDropdownGrid = (($) => {
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME = 'mrDropdownGrid';
  const VERSION = '1.0.0';
  const DATA_KEY = 'mr.dropdownGrid';
  const EVENT_KEY = `.${DATA_KEY}`;
  const DATA_API_KEY = '.data-api';
  const JQUERY_NO_CONFLICT = $.fn[NAME];
  // KeyboardEvent.which value for Escape (Esc) key
  const ESCAPE_KEYCODE = 27;
  // KeyboardEvent.which value for space key
  const SPACE_KEYCODE = 32;
  // KeyboardEvent.which value for tab key
  const TAB_KEYCODE = 9;
  // KeyboardEvent.which value for up arrow key
  const ARROW_UP_KEYCODE = 38;
  // KeyboardEvent.which value for down arrow key
  const ARROW_DOWN_KEYCODE = 40;
  // MouseEvent.which value for the right button (assuming a right-handed mouse)
  const RIGHT_MOUSE_BUTTON_WHICH = 3;
  const REGEXP_KEYDOWN = new RegExp(`${ARROW_UP_KEYCODE}|${ARROW_DOWN_KEYCODE}|${ESCAPE_KEYCODE}`);

  const ClassName = {
    SHOW: 'show',
  };

  const Event = {
    LOAD_DATA_API: `load${EVENT_KEY}${DATA_API_KEY}`,
    RESIZE: `resize${EVENT_KEY}`,
    HIDE: `hide${EVENT_KEY}`,
    HIDDEN: `hidden${EVENT_KEY}`,
    SHOW: `show${EVENT_KEY}`,
    SHOWN: `shown${EVENT_KEY}`,
    CLICK: `click${EVENT_KEY}`,
    MOUSE_ENTER: `mouseenter${EVENT_KEY}`,
    MOUSE_LEAVE: `mouseleave${EVENT_KEY}`,
    CLICK_DATA_API: `click${EVENT_KEY}${DATA_API_KEY}`,
    KEYDOWN_DATA_API: `keydown${EVENT_KEY}${DATA_API_KEY}`,
    KEYUP_DATA_API: `keyup${EVENT_KEY}${DATA_API_KEY}`,
  };

  const Selector = {
    DATA_TOGGLE: '[data-toggle="dropdown-grid"]',
    FORM_CHILD: '.dropdown form',
    MENU: '.dropdown-menu',
    CONTAINER: '.dropdown-menu',
    CONTENT: '[data-dropdown-content]',
    NAVBAR_NAV: '.navbar-nav',
    VISIBLE_ITEMS: '.dropdown-menu .dropdown-item:not(.disabled):not(:disabled)',
  };

  const Options = {
    HOVER: 'data-hover',
    BODY_HOVER: 'data-dropdown-grid-hover',
  };

  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class DropdownGrid {
    constructor(element) {
      this.ticking = false;
      this.isActive = false;
      this.element = element;
      this.getOptions();
      this.parent = DropdownGrid.getParentFromElement(this.element);
      this.menu = this.getMenuElement();
      this.container = this.getContainerElement();
      this.content = this.getContentElement();
      this.isSubmenu = this.hasParentMenu();
      if (this.isSubmenu) {
        this.siblingMenus = this.getSiblingMenus();
      }
      this.submenus = this.getSubmenus();
      this.hover = this.options.hover;
      this.addEventListeners();
      this.setResizeEvent();
    }

    static get VERSION() {
      return VERSION;
    }

    getOptions() {
      if (!this.options) {
        this.options = {};
        this.options.hover = (this.element.getAttribute(Options.HOVER) === 'true'
          || document.body.getAttribute(Options.BODY_HOVER) === 'true')
          && this.element.getAttribute(Options.HOVER) !== 'false';
      }
    }

    toggle(event) {
      this.getParentMenu();
      if (this.element.disabled || $(this.element).hasClass(ClassName.DISABLED)) {
        return;
      }

      this.isActive = $(this.menu).hasClass(ClassName.SHOW);
      const togglingOff = this.isActive;
      const togglingOn = !this.isActive;

      if (!this.isSubmenu) {
        DropdownGrid.clearMenus();
      }

      if (!this.isSubmenu && togglingOff) {
        return;
      }

      if (!this.isSubmenu && togglingOn && event && event.type === Event.MOUSE_LEAVE) {
        return;
      }

      if (this.isSubmenu && this.isActive) {
        DropdownGrid.clearMenus(null, this.element);
        DropdownGrid.clearMenus(null, this.submenus);
        return;
      }

      if (this.isSubmenu && !this.isActive) {
        DropdownGrid.clearMenus(null, this.siblingMenus);
      }

      const relatedTarget = {
        relatedTarget: this.element,
      };
      const showEvent = $.Event(Event.SHOW, relatedTarget);

      $(this.parent).trigger(showEvent);

      if (showEvent.isDefaultPrevented()) {
        return;
      }

      // If this is a touch-enabled device we add extra
      // empty mouseover listeners to the body's immediate children;
      // only needed because of broken event delegation on iOS
      // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html
      if ('ontouchstart' in document.documentElement
        && $(this.parent).closest(Selector.NAVBAR_NAV).length === 0) {
        $(document.body).children().on('mouseover', null, $.noop);
      }

      this.element.focus();
      this.element.setAttribute('aria-expanded', true);

      $(this.menu).toggleClass(ClassName.SHOW);
      // Recalculate positions after applying the shown class
      // This is because jQuery can't measure an invisible element.
      this.updatePosition();
      this.isActive = true;
      $(this.parent)
        .toggleClass(ClassName.SHOW)
        .trigger($.Event(Event.SHOWN, relatedTarget));
    }

    updatePosition(winWidth) {
      const windowWidth = winWidth || window.innerWidth;
      const trigger = mrDropdownGrid.getDimensionsFromElement(this.element);
      this.positionContainer(trigger.offsetLeft);
      this.positionContent(windowWidth, trigger.offsetLeft);
    }

    positionContainer(offsetLeft) {
      if (this.container) {
        this.container.style.left = `-${offsetLeft}px`;
      } else {
        throw new TypeError('No element matching .dropdown-menu.container found.');
      }
    }

    positionContent(windowWidth, offsetLeft) {
      if (this.content) {
        let leftValue;
        // let topValue;
        const contentRect = mrDropdownGrid.getDimensionsFromElement(this.content);
        const contentWidth = contentRect.width;

        // If submenu, the left of the content needs to sit to the side of the trigger's content
        if (this.isSubmenu) {
          this.getParentMenu();
          const parentContent = mrDropdownGrid.getDimensionsFromElement(this.parentMenu.content);
          // Calculate X Offset
          if (parentContent.offsetLeft + parentContent.width + contentWidth <= windowWidth) {
            // Submenu can fit next to parent menu
            leftValue = parentContent.offsetLeft + parentContent.width;
          } else if (parentContent.offsetLeft >= contentWidth) {
            // No room for submenu to fit to the right of parent, sit it to the left instead.
            leftValue = parentContent.offsetLeft - contentWidth;
          } else {
            leftValue = 0;
          }
          // Calculate Y offset
        } else if (contentWidth + offsetLeft >= windowWidth) {
          // Not a submenu, but if the content won't fit, sit content close to the right boundary
          leftValue = windowWidth - contentWidth;
        } else {
          // Not a submenu, and there is room to fit normally and sit below trigger
          leftValue = offsetLeft;
        }

        const leftString = `${Math.round(leftValue)}px`;
        this.content.style.left = leftString;
      } else {
        throw new TypeError('No [data-dropdown-content] element was found.');
      }
    }

    setResizeEvent() {
      $(window).on(Event.RESIZE, () => {
        if (!this.ticking) {
          window.requestAnimationFrame(() => {
            this.updatePosition();
            this.ticking = false;
          });
          this.ticking = true;
        }
      });
    }

    getMenuElement() {
      if (!this.menu) {
        if (this.parent) {
          this.menu = this.parent.querySelector(Selector.MENU);
        }
      }
      return this.menu;
    }

    getContainerElement() {
      if (!this.container) {
        if (this.parent) {
          this.container = this.parent.querySelector(`${Selector.MENU}${Selector.CONTAINER}`);
        }
      }
      return this.container;
    }

    getContentElement() {
      if (!this.content) {
        if (this.parent) {
          this.content = this.container.querySelector(Selector.CONTENT);
        }
      }
      return this.content;
    }

    hasParentMenu() {
      return $(this.element).closest(Selector.CONTENT).length > 0;
    }

    getParentMenu() {
      if (this.isSubmenu && !this.parentMenu) {
        this.parentMenu = $(this.parent)
          .closest(Selector.MENU)
          .siblings(Selector.DATA_TOGGLE)
          .data(DATA_KEY);
      }
    }

    getSiblingMenus() {
      return $(this.element)
        .closest(Selector.CONTENT)
        .get(0).querySelectorAll(Selector.DATA_TOGGLE);
    }

    getSubmenus() {
      const children = this.content.querySelectorAll(Selector.DATA_TOGGLE);
      this.isParent = children.length !== 0;
      return children;
    }

    addEventListeners() {
      $(this.element).on(Event.CLICK, (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.toggle();
      });

      if (this.hover) {
        $(this.parent).on(`${Event.MOUSE_ENTER} ${Event.MOUSE_LEAVE}`, (event) => {
          event.preventDefault();
          event.stopPropagation();

          if ((`${event.type}${EVENT_KEY}` === Event.MOUSE_ENTER && this.isActive)
            || (`${event.type}${EVENT_KEY}` === Event.MOUSE_LEAVE && !this.isActive)) {
            return;
          }
          this.toggle(event);
        });
      }
    }

    static getDimensionsFromElement(element) {
      if (element && mrUtil.isElement(element)) {
        const rect = element.getBoundingClientRect();
        rect.offsetLeft = Math.round((rect.left + window.pageXOffset)
          - document.documentElement.clientLeft);
        return rect;
      }
      // If not an element, throw an error
      throw new TypeError('Can\'t get a measurement from a non-element');
    }

    static getParentFromElement(element) {
      return element.parentNode;
    }

    static clearMenus(event, specificToggle) {
      if (event
        && (event.which === RIGHT_MOUSE_BUTTON_WHICH
          || event.type === 'keyup'
        ) && event.which !== TAB_KEYCODE) {
        return;
      }

      let toggles;
      if (specificToggle && typeof specificToggle === 'object') {
        toggles = specificToggle;
      } else {
        toggles = document.querySelectorAll(Selector.DATA_TOGGLE);
      }

      mrUtil.forEach(toggles, (index, toggle) => {
        const parent = DropdownGrid.getParentFromElement(toggle);
        const context = $(toggle).data(DATA_KEY);
        const relatedTarget = {
          relatedTarget: toggle,
        };


        if (event && event.type === 'click') {
          relatedTarget.clickEvent = event;
        }

        if (!context) {
          return;
        }

        const dropdownMenu = context.menu;
        if (!$(parent).hasClass(ClassName.SHOW)) {
          return;
        }

        if (event) {
          if (
            ((event.type === 'click' && /input|textarea/i.test(event.target.tagName))
              || (event.type === 'keyup' && event.which === TAB_KEYCODE))
            && $.contains(parent, event.target)) {
            return;
          }
        }

        if (event) {
          if (event.type === 'click' && ($.contains(context.content, event.target) || context.content.isSameNode(event.target))) {
            return;
          }
        }

        const hideEvent = $.Event(Event.HIDE, relatedTarget);
        $(parent).trigger(hideEvent);
        if (hideEvent.isDefaultPrevented()) {
          return;
        }

        // If this is a touch-enabled device we remove the extra
        // empty mouseover listeners we added for iOS support
        if ('ontouchstart' in document.documentElement) {
          $(document.body).children().off('mouseover', null, $.noop);
        }

        toggle.setAttribute('aria-expanded', 'false');
        context.isActive = false;
        $(dropdownMenu).removeClass(ClassName.SHOW);
        $(parent)
          .removeClass(ClassName.SHOW)
          .trigger($.Event(Event.HIDDEN, relatedTarget));
      });
    }

    static jQueryInterface(config) {
      return this.each(function jqEachDropdownGrid() {
        const $element = $(this);

        let data = $element.data(DATA_KEY);
        if (!data) {
          data = new DropdownGrid(this);
          $element.data(DATA_KEY, data);
        }

        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new TypeError(`No method named "${config}"`);
          }
          data[config]();
        }
      });
    }

    // eslint-disable-next-line complexity
    static dataApiKeydownHandler(event) {
      // If not input/textarea:
      //  - And not a key in REGEXP_KEYDOWN => not a dropdown command
      // If input/textarea:
      //  - If space key => not a dropdown command
      //  - If key is other than escape
      //    - If key is not up or down => not a dropdown command
      //    - If trigger inside the menu => not a dropdown command
      if (/input|textarea/i.test(event.target.tagName)
        ? (event.which === SPACE_KEYCODE || event.which !== ESCAPE_KEYCODE)
        && ((event.which !== ARROW_DOWN_KEYCODE && event.which !== ARROW_UP_KEYCODE)
          || $(event.target).closest(Selector.MENU).length) : !REGEXP_KEYDOWN.test(event.which)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (this.disabled || $(this).hasClass(ClassName.DISABLED)) {
        return;
      }

      const parent = DropdownGrid.getParentFromElement(this);
      const isActive = $(parent).hasClass(ClassName.SHOW);

      if ((!isActive && (event.which !== ESCAPE_KEYCODE || event.which !== SPACE_KEYCODE))
        || (isActive && (event.which === ESCAPE_KEYCODE || event.which === SPACE_KEYCODE))) {
        if (event.which === ESCAPE_KEYCODE) {
          const toggle = parent.querySelector(Selector.DATA_TOGGLE);
          $(toggle).trigger('focus');
        }

        $(this).trigger('click');
        return;
      }

      const items = [].slice.call(parent.querySelectorAll(Selector.VISIBLE_ITEMS));

      if (items.length === 0) {
        return;
      }

      let index = items.indexOf(event.target);

      if (event.which === ARROW_UP_KEYCODE && index > 0) { // Up
        index -= 1;
      }

      if (event.which === ARROW_DOWN_KEYCODE && index < items.length - 1) { // Down
        index += 1;
      }

      if (index < 0) {
        index = 0;
      }

      items[index].focus();
    }
  }

  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */

  $(document)
    .on(Event.KEYDOWN_DATA_API, Selector.DATA_TOGGLE, DropdownGrid.dataApiKeydownHandler)
    .on(Event.KEYDOWN_DATA_API, Selector.MENU, DropdownGrid.dataApiKeydownHandler)
    .on(`${Event.CLICK_DATA_API} ${Event.KEYUP_DATA_API}`, DropdownGrid.clearMenus)
    .on(Event.CLICK_DATA_API, Selector.FORM_CHILD, (e) => {
      e.stopPropagation();
    });

  /**
   * ------------------------------------------------------------------------
   * Initialise by data attribute
   * ------------------------------------------------------------------------
   */

  $(document).ready(() => {
    const dropdownGridElements = $.makeArray($(Selector.DATA_TOGGLE));

    /* eslint-disable no-plusplus */
    for (let i = dropdownGridElements.length; i--;) {
      const $dropdownGrid = $(dropdownGridElements[i]);
      DropdownGrid.jQueryInterface.call($dropdownGrid, $dropdownGrid.data());
    }
  });

  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */
  /* eslint-disable no-param-reassign */
  $.fn[NAME] = DropdownGrid.jQueryInterface;
  $.fn[NAME].Constructor = DropdownGrid;
  $.fn[NAME].noConflict = function DropdownGridNoConflict() {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return DropdownGrid.jQueryInterface;
  };
  /* eslint-enable no-param-reassign */

  return DropdownGrid;
})(jQuery);

export default mrDropdownGrid;
