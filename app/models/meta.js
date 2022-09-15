import DS from 'ember-data';

/**
 * Model to represent the Meta (metadata) of a User
 */
export default DS.Model.extend({
  /**
   * @property {string} isFeaturedUser
   */
  isFeaturedUser: DS.attr('string'),
  /**
   * @property {TaxonomyPreference} taxonomyPreference
   */
  taxonomyPreference: DS.belongsTo('taxonomy-preference', { async: true })
});
