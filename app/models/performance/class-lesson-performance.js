import DS from 'ember-data';
import ClassPerformance from './class-performance';

/**
 * Model that contains the Lesson Teacher Performance information
 * @typedef {Object} LessonTeacherPerformance
 */
export default ClassPerformance.extend({
  /**
   * @property {Performance[]} List of Performance items for collections/assessments
   */
  collections: DS.hasMany('performance/collection-performance')
});
