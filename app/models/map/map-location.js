import Ember from 'ember';
import { ASSESSMENT_SUB_TYPES } from 'gooru-web/config/config';

/**
 * MapLocation model
 * This model represent a location in the course map, a location has a context and could have suggestions
 *
 * @typedef {Object} MapNavigation
 */
const MapLocationModel = Ember.Object.extend({
  /**
   * @property {MapContext} context
   */
  context: null,

  /**
   * @property {MapSuggestion[]} suggestions
   */
  suggestions: null,

  /**
   * @property {Boolean} hasContent
   */
  hasContent: true,

  /**
   * @property {boolean}
   */
  hasSuggestions: Ember.computed.bool('suggestions.length'),

  /**
   * @property {boolean}
   */
  hasPreTestSuggestions: Ember.computed('suggestions.[]', function() {
    return this.get('suggestions')
      .filterBy('isPreTest')
      .get('length');
  }),

  /**
   * @property {boolean}
   */
  hasPostTestSuggestions: Ember.computed('suggestions.[]', function() {
    return this.get('suggestions')
      .filterBy('isPostTest')
      .get('length');
  }),

  /**
   * @property {boolean}
   */
  hasBackFillSuggestions: Ember.computed('suggestions.[]', function() {
    return this.get('suggestions')
      .filterBy('isBackFill')
      .get('length');
  }),

  /**
   * @property {boolean}
   */
  hasBenchmarkSuggestions: Ember.computed('suggestions.[]', function() {
    return this.get('suggestions')
      .filterBy('isBenchmark')
      .get('length');
  }),

  /**
   * @property {boolean}
   */
  hasResourceSuggestions: Ember.computed('suggestions.[]', function() {
    return this.get('suggestions')
      .filterBy('isResource')
      .get('length');
  }),

  /**
   * Returns the post test suggestion for this location
   * @property {MapSuggestion}
   */
  postTestSuggestion: Ember.computed('hasPostTestSuggestions', function() {
    return this.get('hasPostTestSuggestions')
      ? this.getSuggestion(ASSESSMENT_SUB_TYPES.POST_TEST)
      : undefined;
  }),

  /**
   * Returns the pre test suggestion for this location
   * @property {MapSuggestion}
   */
  preTestSuggestion: Ember.computed('hasPreTestSuggestions', function() {
    return this.get('hasPreTestSuggestions')
      ? this.getSuggestion(ASSESSMENT_SUB_TYPES.PRE_TEST)
      : undefined;
  }),

  /**
   * Returns the backfill test suggestion for this location
   * @property {MapSuggestion}
   */
  backFillSuggestion: Ember.computed('hasBackFillSuggestions', function() {
    return this.get('hasBackFillSuggestions')
      ? this.getSuggestion(ASSESSMENT_SUB_TYPES.BACKFILL)
      : undefined;
  }),

  /**
   * Returns the benchmark suggestion for this location
   * @property {MapSuggestion}
   */
  benchmarkSuggestion: Ember.computed('hasBenchmarkSuggestions', function() {
    return this.get('hasBenchmarkSuggestions')
      ? this.getSuggestion(ASSESSMENT_SUB_TYPES.BENCHMARK)
      : undefined;
  }),

  /**
   * Returns the resource suggestion for this location
   * @property {MapSuggestion}
   */
  resourceSuggestion: Ember.computed('hasResourceSuggestions', function() {
    return this.get('hasResourceSuggestions')
      ? this.getSuggestion(ASSESSMENT_SUB_TYPES.RESOURCE)
      : undefined;
  }),

  /**
   * Returns the suggestion by sub type
   * @param {string} subType @see ASSESSMENT_SUB_TYPES
   */
  getSuggestion: function(subType) {
    return this.get('suggestions').findBy('subType', subType);
  },

  /**
   * Returns the suggestion by sub type
   * @param {string} subType @see ASSESSMENT_SUB_TYPES
   */
  getSystemSuggestion: function(subType) {
    return this.get('suggestions').findBy('subType', subType);
  },

  /**
   * Returns the Signaure Collection suggestion for this location
   * @property {MapSuggestion}
   */
  signatureCollectionSuggestions: Ember.computed(
    'hasSignatureCollectionSuggestions',
    function() {
      return this.get('hasSignatureCollectionSuggestions')
        ? this.getSystemSuggestion(ASSESSMENT_SUB_TYPES.SIGNATURE_COLLECTION)
        : undefined;
    }
  ),

  /**
   * @property {boolean}
   */
  hasSignatureCollectionSuggestions: Ember.computed(
    'suggestions.[]',
    function() {
      return this.get('suggestions')
        .filterBy('subType', 'signature_collection')
        .get('length');
    }
  ),

  /**
   * Returns the signature assessment suggestion for this location
   * @property {MapSuggestion}
   */
  signatureAssessmentSuggestions: Ember.computed(
    'hasSignatureAssessmentSuggestions',
    function() {
      return this.get('hasSignatureAssessmentSuggestions')
        ? this.getSystemSuggestion(ASSESSMENT_SUB_TYPES.SIGNATURE_ASSESSMENT)
        : undefined;
    }
  ),

  /**
   * @property {boolean}
   */
  hasSignatureAssessmentSuggestions: Ember.computed(
    'suggestions.[]',
    function() {
      return this.get('suggestions')
        .filterBy('subType', 'signature_assessment')
        .get('length');
    }
  )
});

export default MapLocationModel;
