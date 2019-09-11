//
//
// popovers.js
//
// In case popovers are used inside a tab structure;
// this utility will close all popovers in the target tab or accordion when a tab is switched.

import jQuery from 'jquery';

(($) => {
  $(document).on('hide.bs.tab', (evt) => { $($(evt.target).attr('href')).find('[data-toggle="popover"]').popover('hide'); });
  $(document).on('hide.bs.collapse', (evt) => { $(evt.target).find('[data-toggle="popover"]').popover('hide'); });
})(jQuery);
