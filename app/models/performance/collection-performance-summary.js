import Ember from 'ember';
import PerformanceSummary from './performance-summary';

/**
 * Collection performance summary model
 *
 * @typedef {Object} CollectionPerformanceSummary
 */
export default PerformanceSummary.extend({
  /**
     * @property {String} classId
     */
  collectionId: null,

  /**
     * @property {string} collectionType assessment|collection|assessment-external
     */
  collectionType: null,

  /**
     * @property {number}
     */
  attempts: null,

  /**
     * @property {number}
     */
  views: null,

  /**
     * @property {string}
     */
  status: null,

  /**
     * @property {Boolean} Value that tells whether the performance data belongs to an assessment
     */
  isAssessment: Ember.computed.equal('collectionType', 'assessment'),

  /**
     * @property {Boolean} Value that tells whether the performance data belongs to an assessment
     */
  isExternalAssessment: Ember.computed.equal(
    'collectionType',
    'assessment-external'
  ),

  /**
     * @property {Boolean} Value that tells whether the performance data belongs to a collection
     */
  isCollection: Ember.computed.equal('collectionType', 'collection')
});
