//
//
// navigation.js
//
// Manage classes on nav bar when toggled

import jQuery from 'jquery';

(($) => {
  const Event = {
    TOGGLE_SHOW: 'show.bs.collapse',
    TOGGLE_HIDE: 'hide.bs.collapse',
  };

  const Selector = {
    CONTAINER: 'body > div.navbar-container',
    NAV: '.navbar-container > .navbar',
  };

  const ClassName = {
    TOGGLED_SHOW: 'navbar-toggled-show',
  };

  const container = document.querySelector(Selector.CONTAINER);
  const nav = document.querySelector(Selector.NAV);
  $(container).on(`${Event.TOGGLE_SHOW} ${Event.TOGGLE_HIDE}`, (evt) => {
    const action = `${evt.type}.${evt.namespace}` === Event.TOGGLE_SHOW ? 'add' : 'remove';
    nav.classList[action](ClassName.TOGGLED_SHOW);
  });
})(jQuery);
