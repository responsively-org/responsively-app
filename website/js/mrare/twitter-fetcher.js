//
//
// twitterFetcher.js
//
// Initialises the twitterFetcher plugin and provides interface to watcher objects
// for sticking elements to the top of viewport while scrolling

import jQuery from 'jquery';
import twitterFetcher from 'twitter-fetcher';
import Flickity from 'flickity';

const mrTwitterFetcher = (($) => {
  /**
   * Check for twitterFetcher dependency
   * twitterFetcher - https://github.com/jasonmayes/Twitter-Post-Fetcher
   */
  if (typeof twitterFetcher === 'undefined') {
    throw new Error('mrTwitterFetcher requires twitterFetcher.js (https://github.com/jasonmayes/Twitter-Post-Fetcher)');
  }

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME = 'mrTwitterFetcher';
  const VERSION = '1.0.0';
  const DATA_KEY = 'mr.twitterFetcher';
  const EVENT_KEY = `.${DATA_KEY}`;
  const DATA_API_KEY = '.data-api';
  const JQUERY_NO_CONFLICT = $.fn[NAME];

  const Event = {
    LOAD_DATA_API: `load${EVENT_KEY}${DATA_API_KEY}`,
    RESIZE: `resize${EVENT_KEY}`,
    READY: `ready${EVENT_KEY}`,
    APPEND: `tweetAppended${EVENT_KEY}`,
  };

  const Selector = {
    DATA_ATTR: 'twitter-fetcher',
    DATA_TWITTER_FETCHER: '[data-twitter-fetcher]',
    DATA_TWITTER: 'data-twitter',
    USER: '.user',
    TWEET: '.tweet',
    TIME_POSTED: '.timePosted',
    INTERACT: '.interact',
  };

  const Defaults = {
    USERNAME: 'twitter',
    MAX_TWEETS: 6,
  };

  const Options = {
    USERNAME: 'username',
    MAX_TWEETS: 'max-tweets',
    FLICKITY: 'flickity',
    SLIDER: 'twitterFlickity',
    ISOTOPE: 'isotope',
  };

  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class TwitterFetcher {
    constructor(element) {
      const $element = $(element);
      this.element = element;
      this.element.id = `tweets-${new Date().getTime()}`;
      this.username = $element.data(Options.USERNAME).replace('@', '') || Defaults.USERNAME;
      this.maxTweets = parseInt($element.data(Options.MAX_TWEETS), 10) || Defaults.MAX_TWEETS;

      // Check if data-twitter-slider is options object, plain attribute or not present.
      this.slider = this.element.getAttribute(`${Selector.DATA_TWITTER}-${Options.FLICKITY}`) !== null;
      this.slider = this.slider && typeof $element.data(Options.SLIDER) === 'object'
        ? $element.data(Options.SLIDER) : this.slider;

      // Check if data-twitter-isotope is present.
      this.isotope = this.element.getAttribute(`${Selector.DATA_TWITTER}-${Options.ISOTOPE}`) !== null;

      this.initTwitterFeed();
    }

    // getters

    static get VERSION() {
      return VERSION;
    }

    initTwitterFeed() {
      this.config = {
        profile: {
          screenName: this.username,
        },
        domId: this.element.id,
        maxTweets: this.maxTweets,
        enableLinks: true,
        showUser: true,
        showTime: true,
        dateFunction: '',
        showRetweet: false,
        customCallback: (tweets) => {
          const $element = $(this.element);
          let html;
          const template = $element.children().first().detach();

          const x = tweets.length;
          let n = 0;
          while (n < x) {
            const tweetContent = $('<div>').append($(tweets[n]));
            const templateClone = template.clone();
            templateClone.find(Selector.TWEET)
              .html(tweetContent.find(Selector.TWEET).html());
            templateClone.find(Selector.USER)
              .html(tweetContent.find(Selector.USER).html());
            templateClone.find(Selector.TIME_POSTED)
              .html(tweetContent.find(Selector.TIME_POSTED).html());
            templateClone.find(Selector.INTERACT)
              .html(tweetContent.find(Selector.INTERACT).html());
            $element.append(templateClone);
            n += 1;

            // Fire an event when each tweet is added to the div
            const appendEvent = $.Event(Event.APPEND);
            appendEvent.appendedElement = templateClone;
            appendEvent.mrTwitterFetcher = this;
            $(this.element).trigger(appendEvent);
          }

          if (this.slider === true || typeof this.slider === 'object') {
            // Check for Flickity dependency
            if (typeof Flickity === 'undefined') {
              throw new Error('mrTwitterFetcher requires flickity.js (https://github.com/metafizzy/flickity)');
            } else {
              $element.data('flickity', new Flickity(this.element, this.slider));
            }
          } else if (this.isotope === true) {
            // Check for Isotope dependency
            if (typeof Isotope === 'undefined') {
              throw new Error('mrTwitterFetcher requires isotope.js (https://github.com/metafizzy/isotope)');
            } else {
              $(this.element).mrIsotope();
            }
          }

          // Fire an event for tweets ready
          const readyEvent = $.Event(Event.READY);
          readyEvent.mrTwitterFetcher = this;
          $(this.element).trigger(readyEvent);
          return html;
        },
      };

      twitterFetcher.fetch(this.config);
    }

    static jQueryInterface() {
      return this.each(function jqEachTwitterFetcher() {
        const $element = $(this);
        let data = $element.data(DATA_KEY);
        if (!data) {
          data = new TwitterFetcher(this);
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

  $(window).on(Event.LOAD_DATA_API, () => {
    const twitterFetcherElements = $.makeArray($(Selector.DATA_TWITTER_FETCHER));

    /* eslint-disable no-plusplus */
    for (let i = twitterFetcherElements.length; i--;) {
      const $twitterFetcher = $(twitterFetcherElements[i]);
      TwitterFetcher.jQueryInterface.call($twitterFetcher, $twitterFetcher.data());
    }
  });

  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */
  /* eslint-disable no-param-reassign */
  $.fn[NAME] = TwitterFetcher.jQueryInterface;
  $.fn[NAME].Constructor = TwitterFetcher;
  $.fn[NAME].noConflict = function TwitterFetcherNoConflict() {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return TwitterFetcher.jQueryInterface;
  };
  /* eslint-enable no-param-reassign */

  return TwitterFetcher;
})(jQuery);

export default mrTwitterFetcher;
