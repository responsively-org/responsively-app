//
//
// maps.js
//
// an initializer for the Google Maps js API
//

/* global google */
import mrMapStyle from './maps-style';

const mrMaps = (($) => {
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME = 'mrMaps';
  const VERSION = '1.1.0';
  const DATA_KEY = 'mr.maps';
  const EVENT_KEY = `.${DATA_KEY}`;
  const JQUERY_NO_CONFLICT = $.fn[NAME];

  const Selector = {
    MAP: '[data-maps-api-key]',
    MARKER: 'div.map-marker',
    STYLE: 'div.map-style',
    MARKER_ADDRESS: 'data-address',
    MARKER_LATLNG: 'data-latlong',
    MARKER_IMAGE: 'data-marker-image',
    MARKER_TITLE: 'data-marker-title',
    INFOWindow: 'div.info-window',
  };

  const String = {
    MARKER_TITLE: '',
  };

  const Event = {
    MAP_LOADED: `loaded${EVENT_KEY}`,
  };

  const Default = {
    MARKER_IMAGE_URL: 'assets/img/map-marker.png',
    MAP: {
      disableDefaultUI: true,
      draggable: true,
      scrollwheel: false,
      zoom: 17,
      zoomControl: false,
    },
  };

  // mrMapStyle should be defined in a js file included prior to maps.js
  // The data should be an array of style overrides as per snazzymaps.com.
  Default.MAP.styles = typeof mrMapStyle !== typeof undefined ? mrMapStyle : undefined;

  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class Map {
    constructor(element) {
      // The current map element
      this.element = element;
      this.$element = $(element);
      this.markers = [];
      this.geocoder = new google.maps.Geocoder();
      this.markerElements = this.$element.find(Selector.MARKER);
      this.styleElement = this.$element.find(Selector.STYLE).first();
      this.initMap();
      this.createMarkers();
    }

    // version getter
    static get VERSION() {
      return VERSION;
    }

    static init() {
      const mapsOnPage = $.makeArray($(Selector.MAP));
      /* eslint-disable no-plusplus */
      for (let i = mapsOnPage.length; i--;) {
        const $map = $(mapsOnPage[i]);
        Map.jQueryInterface.call($map, $map.data());
      }
    }

    initMap() {
      const mapElement = this.element;
      const mapInstance = this.$element;
      const showZoomControl = typeof mapInstance.attr('data-zoom-controls') !== typeof undefined;
      const zoomControlPos = typeof mapInstance.attr('data-zoom-controls') !== typeof undefined
        ? mapInstance.attr('data-zoom-controls') : false;
      const latlong = typeof mapInstance.attr('data-latlong') !== typeof undefined
        ? mapInstance.attr('data-latlong') : false;
      const latitude = latlong
        ? parseFloat(latlong.substr(0, latlong.indexOf(','))) : false;
      const longitude = latlong
        ? parseFloat(latlong.substr(latlong.indexOf(',') + 1)) : false;

      const address = mapInstance.attr('data-address') || '';
      let mapOptions = null;
      // let markerOptions = null;
      const mapAo = {};

      // Attribute overrides - allows data attributes on the map to override global options
      try {
        mapAo.styles = this.styleElement.length
          ? JSON.parse(this.styleElement.html().trim()) : undefined;
      } catch (error) { throw new Error(error); }

      mapAo.zoom = mapInstance.attr('data-map-zoom')
        ? parseInt(mapInstance.attr('data-map-zoom'), 10) : undefined;
      mapAo.zoomControl = showZoomControl;
      mapAo.zoomControlOptions = zoomControlPos !== false
        ? { position: google.maps.ControlPosition[zoomControlPos] } : undefined;

      mapOptions = jQuery.extend({}, Default.MAP, mapAo);
      this.map = new google.maps.Map(mapElement, mapOptions);

      google.maps.event.addListenerOnce(this.map, 'center_changed', () => {
        // Map has been centered.
        const loadedEvent = $.Event(Event.MAP_LOADED, { map: this.map });
        mapInstance.trigger(loadedEvent);
      });

      if (typeof latitude !== typeof undefined && latitude !== '' && latitude !== false && typeof longitude !== typeof undefined && longitude !== '' && longitude !== false) {
        this.map.setCenter(new google.maps.LatLng(latitude, longitude));
      } else if (address !== '') {
        this.geocodeAddress(address, Map.centerMap, this, this.map);
      } else {
        throw new Error('No valid address or latitude/longitude pair provided for map.');
      }
    }

    geocodeAddress(address, callback, thisMap, args) {
      this.geocoder.geocode({ address }, (results, status) => {
        if (status !== google.maps.GeocoderStatus.OK) {
          throw new Error(`There was a problem geocoding the address "${address}".`);
        } else {
          callback(results, thisMap, args);
        }
      });
    }

    static centerMap(geocodeResults, thisMap) {
      thisMap.map.setCenter(geocodeResults[0].geometry.location);
    }

    static moveMarker(geocodeResults, thisMap, gMarker) {
      gMarker.setPosition(geocodeResults[0].geometry.location);
    }

    createMarkers() {
      Default.MARKER = {
        icon: {
          url: this.$element.attr(Selector.MARKER_IMAGE) || Default.MARKER_IMAGE_URL,
          scaledSize: new google.maps.Size(50, 50),
        },
        title: String.MARKER_TITLE,
        optimised: false,
      };

      this.markerElements.each((index, marker) => {
        let gMarker;
        const $marker = $(marker);
        const markerAddress = $marker.attr(Selector.MARKER_ADDRESS);
        const markerLatLng = $marker.attr(Selector.MARKER_LATLNG);
        const infoWindow = $marker.find(Selector.INFOWindow);
        const markerAo = { title: $marker.attr(Selector.MARKER_TITLE) };

        markerAo.icon = typeof $marker.attr(Selector.MARKER_IMAGE) !== typeof undefined ? {
          url: $marker.attr(Selector.MARKER_IMAGE),
          scaledSize: new google.maps.Size(50, 50),
        } : undefined;

        const markerOptions = jQuery.extend({}, Default.MARKER, markerAo);

        gMarker = new google.maps.Marker(jQuery.extend({}, markerOptions, {
          map: this.map,
        }));

        if (infoWindow.length) {
          const gInfoWindow = new google.maps.InfoWindow({
            content: infoWindow.first().html(),
            maxWidth: parseInt(infoWindow.attr('data-max-width') || '250', 10),
          });

          gMarker.addListener('click', () => {
            gInfoWindow.open(this.map, gMarker);
          });
        }

        // Set marker position
        if (markerLatLng) {
          if (/(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)/.test(markerLatLng)) {
            gMarker.setPosition(new google.maps.LatLng(
              parseFloat(markerLatLng.substr(0, markerLatLng.indexOf(','))),
              parseFloat(markerLatLng.substr(markerLatLng.indexOf(',') + 1)),
            ));
            this.markers[index] = gMarker;
          }
        } else if (markerAddress) {
          this.geocodeAddress(markerAddress, Map.moveMarker, this, gMarker);
          this.markers[index] = gMarker;
        } else {
          gMarker = null;
          throw new Error(`Invalid data-address or data-latlong provided for marker ${index + 1}`);
        }
      });
    }

    static jQueryInterface() {
      return this.each(function jqEachMap() {
        const $element = $(this);
        let data = $element.data(DATA_KEY);
        if (!data) {
          data = new Map(this);
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

  // Load Google MAP API JS with callback to initialise when fully loaded
  if (document.querySelector('[data-maps-api-key]') && !document.querySelector('.gMapsAPI')) {
    if ($('[data-maps-api-key]').length) {
      const apiKey = $('[data-maps-api-key]:first').attr('data-maps-api-key') || '';
      if (apiKey !== '') {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=theme.mrMaps.init`;
        script.className = 'gMapsAPI';
        document.body.appendChild(script);
      }
    }
  }

  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */
  /* eslint-disable no-param-reassign */
  $.fn[NAME] = Map.jQueryInterface;
  $.fn[NAME].Constructor = Map;
  $.fn[NAME].noConflict = function MapNoConflict() {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return Map.jQueryInterface;
  };
  /* eslint-enable no-param-reassign */

  return Map;
})(jQuery);

export default mrMaps;
