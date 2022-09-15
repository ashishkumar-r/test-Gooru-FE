/* eslint-env node */

module.exports = function(environment) {
  var isEmbedded = process.env.GOORU_EMBEDDED === 'true';

  var ENV = {
    modulePrefix: 'gooru-web',
    rootElement: '#gooru-application-container',
    environment: environment,
    rootURL: isEmbedded ? undefined : '/',
    locationType: isEmbedded ? 'none' : 'auto',
    exportApplicationGlobal: 'GooruWebApp',
    firebase: {
      apiKey: 'AIzaSyBK9u8tQun9rL9erEEkIq9HULSpdjHBLL8',
      authDomain: 'nile-2d108.firebaseapp.com',
      databaseURL: 'https://nile-2d108.firebaseio.com',
      storageBucket: 'nile-2d108.appspot.com'
    },
    theme: {
      themes: ['goorultr', 'goorurtl'], // MANDATORY
      defaultTheme: 'goorultr' // OPTIONAL
    },
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },

    embedded: {
      //Add anything you want as default values
    },

    marketingSiteUrl: '/about',
    supportSiteUrl: 'https://community.gooru.org/',
    toolkitSiteUrl: '/about/toolkit',
    termsConditionsUrl: '/about/terms-and-conditions',
    appId: '8fa21656-889c-4e38-a7e6-f863f12fa169'
  };

  ENV.embedded = isEmbedded;

  ENV.i18n = {
    defaultLocale: 'en',
    allowedLocales: ['en', 'sp', 'ar', 'hi', 'mr', 'kn']
  };

  ENV['ember-simple-auth'] = {
    baseURL: ''
  };

  /**
   * Application themes configuration
   */
  ENV.themes = {
    default: null /* when present it is not necessary to pass a query param */
  };

  ENV.player = {
    vimeoPlayerUrl: '//player.vimeo.com/video/',
    youtubePlayerUrl: 'https://www.youtube.com/embed/'
  };

  ENV.events = {
    apiVersion: '3.0',
    playerEventEndpoint: '/api/log/event',
    eventAPIKey: '33b9ad34-1a0c-43ba-bb9c-4784abe07110'
  };

  ENV['simple-auth-custom'] = {
    apiKey: 'ASERTYUIOMNHBGFDXSDWERT123RTGHYT',
    serverTokenEndpoint: '/gooruapi/rest/v2/account/login',
    anonymousEndpoint: '/gooruapi/rest/v2/account/loginas/anonymous'
  };

  ENV['API-3.0'] = {
    clientKey: 'c2hlZWJhbkBnb29ydWxlYXJuaW5nLm9yZw==',
    clientId: 'ba956a97-ae15-11e5-a302-f8a963065976',
    'user-token-api-2.0': '0e22e273-e2aa-4a6e-9e4f-c4d376c5317b',
    'anonymous-token-api-2.0': '00ed3b76-bffa-4372-90b0-00f886ce2584'
  };

  ENV['google-sign-in'] = {
    url: '/api/nucleus-auth-idp/v1/google'
  };

  ENV['passport-login-url'] = {
    url: '/api/nucleus-auth-idp/v2/saml/gg4l'
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
    ENV.APP.REDIRECT_CHECK = true;
    ENV.contentSecurityPolicy = {
      'default-src': '*',
      'script-src': '*',
      'font-src': '*',
      'connect-src': '*',
      'img-src': '*',
      'style-src': '* \'unsafe-inline\'',
      'media-src': '*'
    };
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV['ember-simple-auth'].store = 'session-store:ephemeral';

    ENV.APP.rootElement = '#ember-testing';
    ENV.rootElement = '#ember-testing';
    ENV.embedded = false;
  }

  if (environment === 'production' && !isEmbedded) {
    ENV.googleAnalytics = {
      webPropertyId: 'UA-79540131-1',
      tracker: 'analytics.js',
      globalVariable: 'hewlettOERTracker',
      cookieName: 'hewlettOERCookie'
    };
  }

  return ENV;
};
