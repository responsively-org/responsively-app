//
//
// background-images.js
//
// a javascript fallback for CSS 'object-fit' property for browsers that don't support it

import jQuery from 'jquery';

(($) => {
  if ('objectFit' in document.documentElement.style === false) {
    $('.bg-image').each(function attachBg() {
      const img = $(this);
      const src = img.attr('src');
      const classes = img.get(0).classList;
      // Replaces the default <img.bg-image> element with a <div.bg-image>
      // to attach background using legacy friendly CSS rules
      img.before($(`<div class="${classes}" style="background: url(${src}); background-size: cover; background-position: 50% 50%;"></div>`));
      // Removes original <img.bg-image> as it is no longer required
      img.remove();
    });
  }
})(jQuery);
