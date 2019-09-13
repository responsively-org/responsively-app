//
//
//  fade-page.js
//
//

// Page Transition to fade out when clicking a link which has opted in using class 'fade-page'

(() => {
  const ATTR_HREF = 'href';
  const EVENT_CLICK = 'click';
  const SELECTOR_FADE = 'fade-page';
  const EFFECT_DELAY = 500;

  const fadePage = document.getElementsByClassName(SELECTOR_FADE);

  function fadePageFunction(event) {
    if (!(event.ctrlKey
      || event.shiftKey
      || event.metaKey
      || (event.button && event.button === 1))) {
      event.preventDefault();
      event.stopPropagation();
      document.body.classList.add(SELECTOR_FADE);

      const href = this.getAttribute(ATTR_HREF);
      setTimeout(() => {
        if (href !== '' && href !== '#') {
          window.location.href = href;
        }
      }, EFFECT_DELAY);
    }
  }
  // Bind click event
  for (let i = 0; i < fadePage.length; i += 1) {
    fadePage[i].addEventListener(EVENT_CLICK, fadePageFunction, false);
  }
})();
