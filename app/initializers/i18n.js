/**
 * Make ember-18n service available to all components, models and controllers
 *
 * @module
 */
export default {
  name: 'i18n',

  after: 'ember-i18n',

  initialize: function(app) {
    app.inject('controller', 'i18n', 'service:i18n');
    app.inject('model', 'i18n', 'service:i18n');
  }
};
