// Application Widget loader.
// This file support the player widget 1.0 initialization

var ApplicationWidget = function(selector, properties, autoStart) {
  var aw = {
    name: 'application-widget.js',

    emberApp: 'GooruWebApp',

    rootElementId: 'gooru-application-container',

    selector: selector,

    properties: {},

    autoStart: autoStart || true,

    getContainer: function() {
      var selector = this.selector || `#${  this.rootElementId}`;
      var container = jQuery(selector);
      // Verify Container ID
      var containerId = container.attr('id');
      if (typeof containerId === 'undefined') {
        container.attr('id', this.rootElementId);
      }

      return container;
    },

    /**
     * Initialize the application widget application, it also load dependencies
     */
    initialize: function(properties, onLoad) {
      var jqueryWasPresent = window.jQuery !== undefined;
      if (jqueryWasPresent) {
        jQuery.noConflict(true);
      }

      var aw = this;
      properties.appRootPath =
        properties.appRootPath || aw.getAppRootPathFromScript();
      var appRootPath = properties.appRootPath;

      // Add google font styles
      aw.addCss(
        'https://www.gooru.org/css?family=Lato:400,300,300italic,400italic,700,700italic',
        'text/css'
      );
      aw.addCss('https://www.gooru.org/icon?family=Material+Icons');

      // Add web app styles
      aw.addCss(`${appRootPath  }assets/vendor.css`, 'text/css');
      aw.addCss(`${appRootPath  }assets/gooru-web.css`, 'text/css');

      // Add web app javascripts
      aw.addScript(`${appRootPath  }assets/vendor.js`, {
        // Add Ember App after vendor libs
        onload: function() {
          aw.addScript(`${appRootPath  }assets/gooru-web.js`, {
            onload: function() {
              aw.properties = aw.mergeDefaultProperties(properties);
              onLoad(properties);
            }
          });
        }
      });
    },

    /**
     * Merges application default properties
     */
    mergeDefaultProperties: function(properties) {
      const features = properties.features || {};
      //setting header default features
      const header = features.header || {};
      header.enabled = false;
      features.header = header;

      properties.features = features;

      const environment = properties.environment || 'qa';
      properties = this.mergePropertiesByEnvironment(environment, properties);
      return properties;
    },

    mergePropertiesByEnvironment: function(environment, properties) {
      //we support 2 environments for now, qa and prod, any other environment will use qa
      var endpointUrl = 'https://nucleus-qa.gooru.org';
      var realTimeUrl = 'https://rt.nucleus-qa.gooru.org';

      if (environment !== 'custom') {
        if (environment === 'prod') {
          endpointUrl = 'https://www.gooru.org';
          realTimeUrl = 'https://rt.gooru.org';
        }
        properties.endpoint = {
          url: endpointUrl,
          secureUrl: endpointUrl
        };
        properties.realtime = {
          webServiceUrl: realTimeUrl,
          webSocketUrl: realTimeUrl
        };
      }
      return properties;
    },

    /**
     * Load the player
     */
    start: function() {
      var aw = this;

      // Try to find a data-role=gooru-player element
      var container = aw.getContainer();
      if (container) {
        // Start App in next tick of the run loop.
        Ember.run.next(this, function() {
          var emberApp = window[aw.emberApp];
          emberApp.start({
            awProps: aw.properties
          });
        });
      } else {
        throw new Error(`Container not found:${  aw.selector}`);
      }
    },

    /**
     * Add a script tag to head
     * @param url
     * @param options
     */
    addScript: function(url, options) {
      var tag = document.createElement('script');
      tag.setAttribute('type', 'text/javascript');
      tag.setAttribute('src', url);
      if (typeof options !== 'undefined') {
        // Add onload callback
        tag.onload = options.onload;
      }
      // Add script tag to head
      var parent = document.getElementsByTagName('head')[0];
      parent.appendChild(tag);
    },

    /**
     * Add a stylesheet tag to head
     * @param url
     * @param type
     */
    addCss: function(url, type) {
      var tag = document.createElement('link');
      if (typeof type !== 'undefined') {
        tag.setAttribute('type', type);
      }
      tag.setAttribute('rel', 'stylesheet');
      tag.setAttribute('href', url);
      // Add stylesheet to head
      var parent = document.getElementsByTagName('head')[0];
      parent.appendChild(tag);
    },

    /**
     * Gets the app root path from the current script url
     * @returns {*}
     */
    getAppRootPathFromScript: function() {
      var appRootPath = null;
      var scriptName = this.name;
      var scripts = document.getElementsByTagName('script');
      for (var i = 0; i < scripts.length; i++) {
        var script = scripts[i];
        if (script.src && script.src.indexOf(scriptName) >= 0) {
          appRootPath = script.src.replace(scriptName, '');
        }
      }
      return appRootPath;
    },

    /**
     * Destroys the application
     */
    destroy: function() {
      var emberApp = window[aw.emberApp];
      if (emberApp) {
        emberApp.destroy();
      }
    }
  };

  aw.initialize(properties, function() {
    if (aw.autoStart) {
      aw.start();
    }
  });

  return aw;
};
