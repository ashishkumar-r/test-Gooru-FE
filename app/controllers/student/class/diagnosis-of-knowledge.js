import Ember from 'ember';
import TaxonomyTag from 'gooru-web/models/taxonomy/taxonomy-tag';
import TaxonomyTagData from 'gooru-web/models/taxonomy/taxonomy-tag-data';
import { PLAYER_EVENT_SOURCE } from 'gooru-web/config/config';

export default Ember.Controller.extend({
  // -------------------------------------------------------------------------
  // Actions
  actions: {
    start() {
      let assessment = this.get('assessment');
      let courseId = this.get('class.courseId');
      let classId = this.get('class.id');
      this.transitionToRoute('player', assessment.get('id'), {
        queryParams: {
          type: assessment.get('collectionType'),
          role: 'student',
          classId,
          courseId,
          source: PLAYER_EVENT_SOURCE.DIAGNOSTIC
        }
      });
    },

    cancel() {
      this.transitionToRoute('student-home');
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {TaxonomyTag[]} List of taxonomy tags
   */
  tags: Ember.computed('assessment', function() {
    let standards = this.get('assessment.standards');
    if (standards) {
      standards = standards.filter(function(standard) {
        // Filter out learning targets (they're too long for the card)
        return !TaxonomyTagData.isMicroStandardId(standard.get('id'));
      });
      return TaxonomyTag.getTaxonomyTags(standards);
    }
  }),
  isShowImpersonate: Ember.computed(function() {
    let impersonate;
    if (window.frameElement) {
      impersonate = window.parent.impersonate;
    }
    return impersonate;
  })
});
