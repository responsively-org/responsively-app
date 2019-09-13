//
//
// wizard.js
//
// initialises the jQuery Smart Wizard plugin

import $ from 'jquery';
import 'smartwizard';

$(document).ready(() => {
  $('.wizard').smartWizard({
    transitionEffect: 'fade',
    showStepURLhash: false,
    toolbarSettings: { toolbarPosition: 'none' },
  });
});
