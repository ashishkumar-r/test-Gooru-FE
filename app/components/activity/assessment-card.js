import Ember from 'ember';
import TaxonomyTag from 'gooru-web/models/taxonomy/taxonomy-tag';
import TaxonomyTagData from 'gooru-web/models/taxonomy/taxonomy-tag-data';
import {
  PLAYER_WINDOW_NAME,
  PLAYER_EVENT_SOURCE
} from 'gooru-web/config/config';
import { getEndpointUrl } from 'gooru-web/utils/endpoint-config';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['activity-assessment-card'],

  // -------------------------------------------------------------------------
  // Events
  didRender() {
    var component = this;
    component.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * assessment object
   * @type {Object}
   */
  assessment: null,

  /**
   * @property {TaxonomyTag[]} List of taxonomy tags
   */
  tags: Ember.computed('assessment.standards.[]', function() {
    let standards = this.get('assessment.standards');
    if (standards) {
      standards = standards.filter(function(standard) {
        // Filter out learning targets (they're too long for the card)
        return !TaxonomyTagData.isMicroStandardId(standard.get('id'));
      });
      return TaxonomyTag.getTaxonomyTags(standards);
    }
  }),

  actions: {
    onSuggestContent(collection) {
      const component = this;
      component.sendAction('onSuggestContent', collection);
    },
    /**
     * Action triggered when the user play collection
     * It'll open the player in new tab
     */
    onPlayAssessment(assessmentId) {
      let playerURL = `${getEndpointUrl()}/player/${assessmentId}?source=${
        PLAYER_EVENT_SOURCE.RGO
      }`;
      window.open(playerURL, PLAYER_WINDOW_NAME);
    }
  }
});
