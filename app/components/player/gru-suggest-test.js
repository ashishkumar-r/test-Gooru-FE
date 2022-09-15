import Ember from 'ember';
import { ASSESSMENT_SUB_TYPES } from 'gooru-web/config/config';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['player', 'gru-suggest-test'],

  actions: {
    playCollection: function() {
      this.set('disabledButtons', true);
      this.sendAction('onPlayCollection');
    },
    playSuggestion: function() {
      this.set('disabledButtons', true);
      this.sendAction('onPlaySuggestion');
    }
  },
  // -------------------------------------------------------------------------
  // Properties
  /**
   * Suggestion type
   * @param {String} (pre-test/post-test/backfill-pretest)
   */
  type: '',

  /**
   * Indicate if the suggestion is a back fill after a pre test
   * @param {Boolean} isBackFill
   */
  isBackFill: Ember.computed.equal('type', ASSESSMENT_SUB_TYPES.BACKFILL),

  /**
   * Indicate if the suggestion is a benchmark after a post test
   * @param {Boolean} isBenchmark
   */
  isBenchmark: Ember.computed.equal('type', ASSESSMENT_SUB_TYPES.BENCHMARK),

  /**
   * Indicate if the suggestion is a resource
   * @param {Boolean} isResource
   */
  isResource: Ember.computed.equal('type', ASSESSMENT_SUB_TYPES.RESOURCE),

  /**
   * Indicate if the suggestion is a Signature Collection
   * @param {Boolean} isResource
   */
  isSignatureCollection: Ember.computed.equal(
    'type',
    ASSESSMENT_SUB_TYPES.SIGNATURE_COLLECTION
  ),

  /**
   * Indicate if the suggestion is a Signature Assesment
   * @param {Boolean} isResource
   */
  isSignatureAssessment: Ember.computed.equal(
    'type',
    ASSESSMENT_SUB_TYPES.SIGNATURE_ASSESSMENT
  ),

  /**
   * @param {Assessment} assessment
   */
  assessment: null,

  /**
   * Disables next and no thanks buttons
   * @property {Boolean} disabledButtons
   */
  disabledButtons: false,

  /**
   * @property {Number} Resource count
   */
  resourceCount: Ember.computed('assessment.resources', function() {
    return this.get('assessment.resources').filter(item =>
      item.get('isResource')
    ).length;
  }),
  /**
   * Suggested assessment
   * @param {Assessment/Collection} suggestion
   */
  suggestion: null,

  /**
   * @property {Number} Question count
   */
  questionCount: Ember.computed('assessment.resources', function() {
    return this.get('assessment.resources').filter(
      item => !item.get('isResource')
    ).length;
  })
});
