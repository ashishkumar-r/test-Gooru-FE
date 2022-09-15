import DS from 'ember-data';

/**
 * Model to represent the TaxonomyPrefences in a Metadata object
 */
export default DS.Model.extend({
  /**
   * @property {Array} codeId
   */
  codeId: DS.attr(),
  /**
   * @property {Array} code
   */
  code: DS.attr()
});
