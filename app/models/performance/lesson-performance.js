import DS from 'ember-data';
import PerformanceModel from './performance';

/**
 * Model that contains the Lesson Performance information
 * @typedef {Object} LessonPerformance
 */
export default PerformanceModel.extend({
  /**
   * @property {Performance[]} List of Performance items for collections/assessments
   */
  collections: DS.hasMany('performance/collection-performance')
});
