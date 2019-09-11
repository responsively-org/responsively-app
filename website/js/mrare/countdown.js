//
//
// countdown.js
//
// an initializer for the Final Countdown plugin
// http://hilios.github.io/jQuery.countdown/documentation.html#introduction
//

import jQuery from 'jquery';
import 'jquery-countdown';

const mrCountdown = (($) => {
  /**
   * Check for countdown dependency
   * countdown - https://github.com/hilios/jQuery.countdown/
   */
  if (typeof $.fn.countdown !== 'function') {
    throw new Error('mrCountdown requires jquery.countdown.js (https://github.com/hilios/jQuery.countdown/)');
  }

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME = 'mrCountdown';
  const VERSION = '1.1.0';
  const DATA_KEY = 'mr.countdown';
  const EVENT_KEY = `.${DATA_KEY}`;
  const DATA_API_KEY = '.data-api';
  const JQUERY_NO_CONFLICT = $.fn[NAME];

  const Event = {
    LOAD_DATA_API: `load${EVENT_KEY}${DATA_API_KEY}`,
  };

  const Default = {
    DAYS_TEXT: 'days',
    ELAPSED: 'Timer Done',
    Y_FMT: '%Y',
    MTHS_FMT: '%m',
    W_FMT: '%w',
    D_FMT: '%D',
    H_FMT: '%H',
    MINS_FMT: '%M',
    S_FMT: '%S',
    Y_LABEL_FMT: '%!Y:Year,Years;',
    MTHS_LABEL_FMT: '%!m:Month,Months;',
    W_LABEL_FMT: '%!w:Week,Weeks;',
    D_LABEL_FMT: '%!d:Day,Days;',
    H_LABEL_FMT: '%!H:Hour,Hours;',
    MINS_LABEL_FMT: '%!M:Minute,Minutes;',
    S_LABEL_FMT: '%!S:Second,Seconds;',
  };

  const CSS = {
    D_NONE: 'd-none',
  };

  const Selector = {
    COUNTDOWN: '[data-countdown-date]',
    ACTIVE: '[data-active-state]',
    ELAPSED: '[data-elapsed-state]',
    DATE_ATTR: 'data-countdown-date',
    DAYS_TEXT_ATTR: 'data-days-text',
    DATE_FORMAT_ATTR: 'data-date-format',
    DATE_FALLBACK_ATTR: 'data-date-fallback',
    Y_EL: '[data-years]',
    MTHS_EL: '[data-months]',
    W_EL: '[data-weeks]',
    D_EL: '[data-days]',
    H_EL: '[data-hours]',
    MINS_EL: '[data-minutes]',
    S_EL: '[data-seconds]',
    Y_LABEL_EL: '[data-years-label]',
    MTHS_LABEL_EL: '[data-months-label]',
    W_LABEL_EL: '[data-weeks-label]',
    D_LABEL_EL: '[data-days-label]',
    H_LABEL_EL: '[data-hours-label]',
    MINS_LABEL_EL: '[data-minutes-label]',
    S_LABEL_EL: '[data-seconds-label]',
  };

  const Options = {
    FORMAT: 'format',
    DETAILED: 'detailed',
  };

  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class Countdown {
    constructor(element) {
      // The current countdown element
      this.element = element;
      const $element = $(element);
      this.date = $element.attr(Selector.DATE_ATTR);
      this.daysText = $element.attr(Selector.DAYS_TEXT_ATTR) || Default.DAYS_TEXT;
      this.countdownText = `%D ${this.daysText} %H:%M:%S`;
      this.dateFormat = $element.attr(Selector.DATE_FORMAT_ATTR) || this.countdownText;
      this.fallback = $element.attr(Selector.DATE_FALLBACK_ATTR) || Default.ELAPSED;

      // Options for detailed mode
      this.detailed = this.element.getAttribute(`data-${Options.DETAILED}`) !== null;
      if (this.detailed) {
        this.years = {
          show: $element.find(Selector.Y_EL).length,
          element: $element.find(Selector.Y_EL),
          format: $element.find(Selector.Y_EL).data(Options.FORMAT) || Default.Y_FMT,
          label: {
            show: $element.find(Selector.Y_LABEL_EL).length,
            element: $element.find(Selector.Y_LABEL_EL),
            format: $element.find(Selector.Y_LABEL_EL).data(Options.FORMAT) || Default.Y_LABEL_FMT,
          },
        };
        this.months = {
          show: $element.find(Selector.MTHS_EL).length,
          element: $element.find(Selector.MTHS_EL),
          format: $element.find(Selector.MTHS_EL).data(Options.FORMAT) || Default.MTHS_FMT,
          label: {
            show: $element.find(Selector.MTHS_LABEL_EL).length,
            element: $element.find(Selector.MTHS_LABEL_EL),
            format: $element.find(Selector.MTHS_LABEL_EL).data(Options.FORMAT)
              || Default.MTHS_LABEL_FMT,
          },
        };
        this.weeks = {
          show: $element.find(Selector.W_EL).length,
          element: $element.find(Selector.W_EL),
          format: $element.find(Selector.W_EL).data(Options.FORMAT) || Default.W_FMT,
          label: {
            show: $element.find(Selector.W_LABEL_EL).length,
            element: $element.find(Selector.W_LABEL_EL),
            format: $element.find(Selector.W_LABEL_EL).data(Options.FORMAT) || Default.W_LABEL_FMT,
          },
        };
        this.days = {
          show: $element.find(Selector.D_EL).length,
          element: $element.find(Selector.D_EL),
          format: $element.find(Selector.D_EL).data(Options.FORMAT) || Default.D_FMT,
          label: {
            show: $element.find(Selector.D_LABEL_EL).length,
            element: $element.find(Selector.D_LABEL_EL),
            format: $element.find(Selector.D_LABEL_EL).data(Options.FORMAT) || Default.D_LABEL_FMT,
          },
        };
        this.hours = {
          show: $element.find(Selector.H_EL).length,
          element: $element.find(Selector.H_EL),
          format: $element.find(Selector.H_EL).data(Options.FORMAT) || Default.H_FMT,
          label: {
            show: $element.find(Selector.H_LABEL_EL).length,
            element: $element.find(Selector.H_LABEL_EL),
            format: $element.find(Selector.H_LABEL_EL).data(Options.FORMAT) || Default.H_LABEL_FMT,
          },
        };
        this.minutes = {
          show: $element.find(Selector.MINS_EL).length,
          element: $element.find(Selector.MINS_EL),
          format: $element.find(Selector.MINS_EL).data(Options.FORMAT) || Default.MINS_FMT,
          label: {
            show: $element.find(Selector.MINS_LABEL_EL).length,
            element: $element.find(Selector.MINS_LABEL_EL),
            format: $element
              .find(Selector.MINS_LABEL_EL).data(Options.FORMAT) || Default.MINS_LABEL_FMT,
          },
        };
        this.seconds = {
          show: $element.find(Selector.S_EL).length,
          element: $element.find(Selector.S_EL),
          format: $element.find(Selector.S_EL).data(Options.FORMAT) || Default.S_FMT,
          label: {
            show: $element.find(Selector.S_LABEL_EL).length,
            element: $element.find(Selector.S_LABEL_EL),
            format: $element
              .find(Selector.S_LABEL_EL).data(Options.FORMAT) || Default.S_LABEL_FMT,
          },
        };
      }
      this.initCountdown();
    }

    // getters
    static get VERSION() {
      return VERSION;
    }

    initCountdown() {
      const element = $(this.element);

      if (this.detailed) {
        element.countdown(this.date, (event) => {
          if (!event.elapsed) {
            if (this.years.show) {
              this.years.element.text(event.strftime(this.years.format));
            }
            if (this.years.label.show) {
              this.years.label.element.text(event.strftime(this.years.label.format));
            }
            if (this.months.show) {
              this.months.element.text(event.strftime(this.months.format));
            }
            if (this.months.label.show) {
              this.months.label.element.text(event.strftime(this.months.label.format));
            }
            if (this.weeks.show) {
              this.weeks.element.text(event.strftime(this.weeks.format));
            }
            if (this.weeks.label.show) {
              this.weeks.label.element.text(event.strftime(this.weeks.label.format));
            }
            if (this.days.show) {
              this.days.element.text(event.strftime(this.days.format));
            }
            if (this.days.label.show) {
              this.days.label.element.text(event.strftime(this.days.label.format));
            }
            if (this.hours.show) {
              this.hours.element.text(event.strftime(this.hours.format));
            }
            if (this.hours.label.show) {
              this.hours.label.element.text(event.strftime(this.hours.label.format));
            }
            if (this.minutes.show) {
              this.minutes.element.text(event.strftime(this.minutes.format));
            }
            if (this.minutes.label.show) {
              this.minutes.label.element.text(event.strftime(this.minutes.label.format));
            }
            if (this.seconds.show) {
              this.seconds.element.text(event.strftime(this.seconds.format));
            }
            if (this.seconds.label.show) {
              this.seconds.label.element.text(event.strftime(this.seconds.label.format));
            }
          } else {
            // If the countdown has elapsed (event.elapsed):
            element.find(Selector.ELAPSED).removeClass(CSS.D_NONE);
            element.find(Selector.ACTIVE).addClass(CSS.D_NONE);
          }
        });
      } else {
        $(this.element).countdown(this.date, (event) => {
          if (event.elapsed) {
            element.text(this.fallback);
          } else {
            element.text(event.strftime(this.dateFormat));
          }
        });
      }
    }

    static jQueryInterface() {
      return this.each(function jqEachCountdown() {
        const $element = $(this);
        let data = $element.data(DATA_KEY);
        if (!data) {
          data = new Countdown(this);
          $element.data(DATA_KEY, data);
        }
      });
    }
  }
  // END Class definition

  /**
   * ------------------------------------------------------------------------
   * Initialise by data attribute
   * ------------------------------------------------------------------------
   */

  $(window).on(Event.LOAD_DATA_API, () => {
    const cdownsOnPage = $.makeArray($(Selector.COUNTDOWN));

    /* eslint-disable no-plusplus */
    for (let i = cdownsOnPage.length; i--;) {
      const $countdown = $(cdownsOnPage[i]);
      Countdown.jQueryInterface.call($countdown, $countdown.data());
    }
  });

  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */
  /* eslint-disable no-param-reassign */
  $.fn[NAME] = Countdown.jQueryInterface;
  $.fn[NAME].Constructor = Countdown;
  $.fn[NAME].noConflict = function CountdownNoConflict() {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return Countdown.jQueryInterface;
  };
  /* eslint-enable no-param-reassign */

  return Countdown;
})(jQuery);

export default mrCountdown;
