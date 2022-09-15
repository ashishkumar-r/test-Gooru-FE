import Ember from 'ember';
import TaxonomyTag from 'gooru-web/models/taxonomy/taxonomy-tag';

export default Ember.Controller.extend({
  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * Performs a back action in the browser history
     */
    goBack: function() {
      window.history.go(-1);
    }
  },
  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {TaxonomyTag[]} List of taxonomy tags
   */
  tags: Ember.computed('rubric.standards.[]', function() {
    return TaxonomyTag.getTaxonomyTags(this.get('rubric.standards'), false);
  }),

  /**
   * @property {Ember.Object} resource
   * Resource to show on preview
   */
  resource: Ember.computed('rubric.url', function() {
    return Ember.Object.create({ url: this.get('rubric.url') });
  })
});
