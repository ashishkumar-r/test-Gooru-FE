import Ember from 'ember';

/**
 * Gru icon
 * Wrapper for application icons, default implementation is material-design-icons from google
 * https://material.io/icons/
 * @see application.hbs
 *
 *
 * @module
 * @typedef {object} GruIcon
 */
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @property {Service} I18N service
   */
  i18n: Ember.inject.service(),

  // -------------------------------------------------------------------------
  // Attributes
  attributeBindings: ['tooltipData:title', 'dataToggle:data-toggle'],

  classNames: ['gru-icon'],

  classNameBindings: ['name', 'style'],

  tagName: 'i',

  // -------------------------------------------------------------------------
  // Actions

  // -------------------------------------------------------------------------
  // Events

  // -------------------------------------------------------------------------
  // Properties

  /**
   * Icon name
   * @property {string}
   */
  name: null,

  /**
   * This property will decide which material style need to choose, google material icon supported
   * styles are (material-icons, material-icons-outlined, material-icons-two-tone, material-icons-round
   * and material-icons-sharp).  Default style is material-icons
   * @type {String}
   */
  style: 'material-icons',

  tooltipTitle: null,

  tooltipTitleData: null,

  tooltipData: Ember.computed('tooltipTitle', function() {
    return this.get('tooltipTitle')
      ? this.get('i18n').t(this.get('tooltipTitle'))
      : this.get('tooltipTitleData')
        ? this.get('tooltipTitleData')
        : undefined;
  }),

  dataToggle: Ember.computed('tooltipTitle', function() {
    return this.get('tooltipTitle') ? 'tooltip' : undefined;
  })

  // -------------------------------------------------------------------------
  // Observers

  // -------------------------------------------------------------------------
  // Methods
});
