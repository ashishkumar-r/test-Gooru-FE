import DS from 'ember-data';

/**
 * @typedef {Object} Standard
 */
export default DS.Model.extend({
  /**
   * @property {string} Standard's name
   */
  name: DS.attr('string'),
  /**
   * @property {string} Standard's description
   */
  description: DS.attr('string')
});
