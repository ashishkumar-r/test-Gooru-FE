import Ember from 'ember';

/**
 * This util class holds the information for a Gooru Theme.
 * Gooru themes are useful to setup the application branding, messages and locale
 *
 * @typedef {object} GruTheme
 */
export default Ember.Object.extend({
  // -------------------------------------------------------------------------
  // Properties
  /**
   * @property {string} theme id
   */
  id: null,

  /**
   * css url
   * @property {string}
   */
  cssUrl: Ember.computed('id', function() {
    const id = this.get('id');
    return `assets/themes/${id}/styles.css`;
  })
});
