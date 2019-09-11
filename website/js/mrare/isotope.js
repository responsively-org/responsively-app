//
//
// isotope.js
//
// Initialize the isotope plugin for filtering


import jQuery from 'jquery';
import Isotope from 'isotope-layout';
import mrUtil from './util';

const mrIsotope = (($) => {
  /**
   * Check for isotope dependency
   * isotope - https://github.com/metafizzy/isotope
   */
  if (typeof Isotope === 'undefined') {
    throw new Error('mrIsotope requires isotope.pkgd.js (https://github.com/metafizzy/isotope)');
  }

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME = 'mrIsotope';
  const VERSION = '1.0.0';
  const DATA_KEY = 'mr.isotope';
  const EVENT_KEY = `.${DATA_KEY}`;
  const DATA_API_KEY = '.data-api';
  const JQUERY_NO_CONFLICT = $.fn[NAME];

  const Css = {
    ACTIVE: 'active',
  };

  const Event = {
    LOAD_DATA_API: `load${EVENT_KEY}${DATA_API_KEY}`,
    FILTER_CLICK: 'click touchstart',
    SORTER_CLICK: 'click touchstart',
  };

  const Options = {
    DEFAULT_LAYOUT: 'masonry',
    ORIGINAL_ORDER: 'original-order',
  };

  const Selector = {
    FILTER_INITIALISED: '.js-filter-inited',
    DATA_ATTR: 'isotope',
    ISOTOPE_ID: 'data-isotope-id',
    DATA_ISOTOPE_COLLECTION: '[data-isotope-collection]',
    DATA_ISOTOPE_ITEM: '[data-isotope-item]',
    DATA_ISOTOPE_FILTERS: '[data-isotope-filters]',
    DATA_ISOTOPE_SORTERS: '[data-isotope-sorters]',
    CATEGORY: 'data-category',
    FILTER: 'data-filter',
    SORTER: 'data-sort',
    PRIMARY_SORTER: 'data-primary-sort',
    SECOND_SORTER: 'data-secondary-sort',
    SORT_SELECTOR: 'data-sort-selector',
    DATA_CATEGORY: '[data-category]',
    SORT_ASCENDING: 'data-sort-ascending',
    FILTER_ALL: '*',
  };

  // returns a selector string for filterable elements matching the provided category
  function getCategoryFilter(filterBy) {
    return filterBy && filterBy !== Selector.FILTER_ALL ? `[${Selector.CATEGORY}*="${filterBy}"]` : Selector.FILTER_ALL;
  }
  // returns a nodelist of all filter links matching the provided isotope ID
  function getFilters(isotopeId, exclude) {
    const excludeSelector = exclude ? `:not(${exclude})` : '';
    const filters = document.querySelectorAll(`${Selector.DATA_ISOTOPE_FILTERS}[${Selector.ISOTOPE_ID}="${isotopeId}"] [${Selector.FILTER}]${excludeSelector}`);
    return filters;
  }
  // returns a nodelist of all sorter links matching the provided isotope ID
  function getSorters(isotopeId) {
    return document.querySelectorAll(`${Selector.DATA_ISOTOPE_SORTERS}[${Selector.ISOTOPE_ID}="${isotopeId}"] [${Selector.SORTER}][${Selector.SORT_SELECTOR}],
      ${Selector.DATA_ISOTOPE_SORTERS}[${Selector.ISOTOPE_ID}="${isotopeId}"] [${Selector.SORTER}][${Selector.PRIMARY_SORTER}][${Selector.SECOND_SORTER}]`);
  }
  // returns a nodelist of all sorter links matching the provided sort value
  function getSorter(isotopeId, sortValue) {
    return document.querySelectorAll(`${Selector.DATA_ISOTOPE_SORTERS}[${Selector.ISOTOPE_ID}="${isotopeId}"] [${Selector.SORTER}="${sortValue}"]`);
  }
  // returns a nodelist of all filter links matching the provided filter value
  function getFilter(isotopeId, filter) {
    return document.querySelectorAll(`${Selector.DATA_ISOTOPE_FILTERS}[${Selector.ISOTOPE_ID}="${isotopeId}"] [${Selector.FILTER}="${filter}"]`);
  }
  // sets active class of provided elements on or off
  function toggleActive(filters, active) {
    if (filters) {
      mrUtil.forEach(filters, (index, filter) => {
        if (filter && typeof filter.classList !== typeof undefined) {
          if (active) {
            filter.classList.add(Css.ACTIVE);
          } else { filter.classList.remove(Css.ACTIVE); }
        }
      });
    }
  }

  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class IsotopeWrapper {
    constructor(element) {
      const $element = $(element);
      const attributes = $element.data();

      this.element = element;
      this.attributes = attributes;
      this.filters = {};
      this.sorters = {};
      this.activeFilter = null;
      this.activeSorter = null;
      this.isotope = null;

      this.options = {};
      this.options.getSortData = {};
      this.options.sortAscending = {};

      this.initIsotope();
      this.initSorters();
      this.initFilters();
    }

    // getters

    static get VERSION() {
      return VERSION;
    }

    initFilters() {
      // Get all filter links
      const filters = getFilters(this.attributes.isotopeId, Selector.FILTER_INITIALISED);
      mrUtil.forEach(filters, (index, filter) => {
        const filterValue = filter.attributes[Selector.FILTER]
          && filter.attributes[Selector.FILTER].value;

        // Find all other filters matching this value to be de/activated on click
        this.filters[filterValue] = getFilter(this.attributes.isotopeId, filterValue);
        // Set up filter click event
        $(filter).on(Event.FILTER_CLICK, (event) => {
          if (event.preventDefault) { event.preventDefault(); }
          // Activate appropriate links
          toggleActive(this.activeFilter, false);
          toggleActive(this.filters[filterValue], true);
          this.activeFilter = filters;
          // Get selectorified filter value unless value is '*' (* does not need to be a selector)
          this.options.filter = filterValue === '*' ? filterValue : getCategoryFilter(filterValue);
          // Update isotope with current filter settings
          this.isotope.arrange(this.options);
        });
        // Add FILTER_INITIALISED class
        // just to make distinguishing old and new filters easier
        filter.classList.add(Selector.FILTER_INITIALISED);
      });
    }

    initSorters() {
      // Get all sorters linked to current isotope-id
      const sorters = getSorters(this.attributes.isotopeId);
      const defaultSort = this.attributes.defaultSort || Options.ORIGINAL_ORDER;

      mrUtil.forEach(sorters, (index, sorter) => {
        // Get options from attributes
        // Done this way for brevity (previous way was too wordy)
        const sa = sorter.attributes;
        const ss = sa[Selector.SORTER];
        const ssel = sa[Selector.SORT_SELECTOR];
        const asc = sa[Selector.SORT_ASCENDING];
        const pri = sa[Selector.PRIMARY_SORTER];
        const sec = sa[Selector.SECOND_SORTER];

        // Extract options from attributes
        const sortValue = ss && ss.value;
        const sortSelector = ssel && ssel.value;
        // If secondSort is set, pass in an array rather than a single sort value
        const arraySort = (pri && pri.value && sec && sec.value) ? [pri.value, sec.value] : null;
        const sortAscending = !(asc && asc.value && asc.value === 'false');

        // Store list of other sorters matching this value to be de/activated on click
        this.sorters[sortValue] = getSorter(this.attributes.isotopeId, sortValue);

        // Set up sorters click event for this one sorter
        $(sorter).on(Event.SORTER_CLICK, (event) => {
          if (event.preventDefault) { event.preventDefault(); }
          // Switch active class on sorter links
          toggleActive(this.activeSorter, false);
          toggleActive(this.sorters[sortValue], true);
          this.activeSorter = this.sorters[sortValue];
          // Pass in the arraySort (primary/secondary) array if it exists
          // otherwise use clicked sortValue
          this.options.sortBy = arraySort || sortValue;
          // Update isotope with curent options
          this.isotope.arrange(this.options);
        });
        // Set sortAscending object with current sortAscending value
        this.options.sortAscending[sortValue] = sortAscending;
        // Only set sortData in isotope if this is a unique sorting ID, not for
        // array sorts (primary/secondary) as they simply use an array to
        // reference existing sort configs
        if ((sortValue !== Options.ORIGINAL_ORDER) && !arraySort) {
          // Set the sort object in isotope options (will be reinitialised later)
          // Won't be added as a new sortData entry if secondSort is active
          this.options.getSortData[sortValue] = sortSelector;
        }
      });
      // Set sorting order to default if it exists
      this.options.sortBy = defaultSort;
      // Set default sorter to active
      this.activeSorter = getSorter(this.attributes.isotopeId, defaultSort);
      toggleActive(this.activeSorter, true);
      // Update isotope with collected sorter data
      this.isotope.updateSortData();
      // Update isotope with current sort options
      this.isotope.arrange(this.options);
    }

    initIsotope() {
      // Get hash filter from URL
      let hashFilter = window.location.hash.replace('#', '');
      hashFilter = hashFilter !== '' && !this.attributes.ignoreHash ? hashFilter : null;
      // Determine default filter
      const defaultFilter = hashFilter || this.attributes.defaultFilter || Selector.FILTER_ALL;
      const defaultFilterSelector = getCategoryFilter(defaultFilter);
      // Default to true, unless found to be explicitly false
      const defaultSortAscending = !this.attributes.sortAscending === false;

      // Setup initial config
      this.options.itemSelector = Selector.DATA_ISOTOPE_ITEM;
      this.options.layoutMode = this.attributes.layoutMode || Options.DEFAULT_LAYOUT;
      this.options.filter = defaultFilterSelector;
      this.options.sortAscending[Options.ORIGINAL_ORDER] = defaultSortAscending;
      this.isotope = new Isotope(this.element, this.options);
      this.activeFilter = getFilter(this.attributes.isotopeId, defaultFilter);
      toggleActive(this.activeFilter, true);
    }

    static jQueryInterface() {
      return this.each(function jqEachIsotope() {
        const $element = $(this);
        let data = $element.data(DATA_KEY);
        if (!data) {
          data = new IsotopeWrapper(this);
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
    const isotopeElements = $.makeArray($(Selector.DATA_ISOTOPE_COLLECTION));

    /* eslint-disable no-plusplus */
    for (let i = isotopeElements.length; i--;) {
      const $isotope = $(isotopeElements[i]);
      IsotopeWrapper.jQueryInterface.call($isotope, $isotope.data());
    }
  });

  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */
  /* eslint-disable no-param-reassign */
  $.fn[NAME] = IsotopeWrapper.jQueryInterface;
  $.fn[NAME].Constructor = IsotopeWrapper;
  $.fn[NAME].noConflict = function IsotopeWrapperNoConflict() {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return IsotopeWrapper.jQueryInterface;
  };
  /* eslint-enable no-param-reassign */

  return IsotopeWrapper;
})(jQuery);

export default mrIsotope;
