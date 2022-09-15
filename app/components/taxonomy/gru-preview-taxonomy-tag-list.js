import Ember from 'ember';
import TaxonomyTag from 'gooru-web/models/taxonomy/taxonomy-tag';
import TaxonomyTagData from 'gooru-web/models/taxonomy/taxonomy-tag-data';

/**
 * Preview Taxonomy tag list from search
 */
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['taxonomy', 'gru-preview-taxonomy-tag-list'],

  // --------------------------------------------
  // Actions

  // --------------------------------------------
  // Properties

  /**
   * @property {TaxonomyTag[]} List of taxonomy tags
   */
  tags: Ember.computed('standards.[]', function() {
    var standards = this.get('standards');
    standards = standards.filter(function(standard) {
      // Filter out learning targets (they're too long)
      return !TaxonomyTagData.isMicroStandardId(standard.get('id'));
    });
    return TaxonomyTag.getTaxonomyTags(standards);
  }),

  /**
   * Indicates the total of tags visible
   * @property {number}
   */
  tagsVisible: null,

  /**
   * @property {TaxonomyTag[]} taxonomy tag
   */
  visibleTags: Ember.computed('tags.[]', function() {
    const tagsVisible = this.get('tagsVisible') || 999999; //long number so it show all when no provided
    return this.get('tags').filter(function(tag, index) {
      return index < tagsVisible;
    });
  }),

  /**
   * @property {number}
   */
  totalTags: Ember.computed.alias('tags.length'),

  /**
   * Indicates how many tags are not visible
   * @property {number}
   */
  nonVisibleTags: Ember.computed('totalTags', function() {
    const totalTags = this.get('totalTags');
    const tagsVisible = this.get('tagsVisible') || totalTags;
    const nonVisibleTags = totalTags - tagsVisible;
    return nonVisibleTags > 0 ? nonVisibleTags : 0;
  })

  // -------------------------------------------------------------------------
  // Methods
});
