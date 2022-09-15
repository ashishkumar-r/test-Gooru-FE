import Ember from 'ember';
import DS from 'ember-data';
import { formatTime } from '../../utils/utils';

/**
 * Model that contains the performance information
 * @typedef {Object} Performance
 */
export default DS.Model.extend({
  /**
   * @property {String} Title for the performance
   */
  title: DS.attr('string'),
  /**
   * @property {String} Student performance type (e.g. unit, lesson, collection, assessment)
   */
  type: DS.attr('string'),
  /**
   * This will fix the change in gru-accordion-lesson because classPerformance uses collectionType instead of type, this would be only for collection and assessmet
   * @property {String} Student performance type (e.g. collection, assessment)
   */
  collectionType: Ember.computed.alias('type'),
  /**
   * @property {Boolean} Value that tells whether the performance data belongs to an assessment
   */
  isAssessment: Ember.computed.equal('type', 'assessment'),

  /**
   * @property {Boolean} Value that tells whether the performance data belongs to an assessment
   */
  isExternalAssessment: Ember.computed.equal('type', 'assessment-external'),

  /**
   * @property {Boolean} Value that tells whether the performance data belongs to a collection
   */
  isCollection: Ember.computed.equal('type', 'collection'),
  /**
   * @property {Boolean} Value that tells whether the performance data belongs to a collection
   */
  isCollectionOrAssessment: Ember.computed.or(
    'isCollection',
    'isAssessment',
    'isExternalAssessment'
  ),
  /**
   * @property {Boolean} Value that tells whether the performance data belongs to an Unit
   */
  isUnit: Ember.computed.equal('type', 'unit'),
  /**
   * @property {Boolean} Value that tells whether the performance data belongs to a Lesson
   */
  isLesson: Ember.computed.equal('type', 'lesson'),
  /**
   * @property {Boolean} Value that tells whether the performance data belongs to a unit or a lesson
   */
  isUnitOrLesson: Ember.computed.or('isUnit', 'isLesson'),
  /**
   * @property {Number} The performance score (in percentages e.g. 80%, 100%, 95%, etc)
   */
  score: DS.attr('number'),
  /**
   * @property {Number} The completion done in the unit, class or collection/assessment, e.g. It is the top number of the fraction 5/10
   */
  completionDone: DS.attr('number'),
  /**
   * @property {Number} The total of completionin the unit, class or collection/assessment, e.g. It is the bottom number of the fraction 5/10
   */
  completionTotal: DS.attr('number'),
  /**
   * @property {Number} The registered time spent in the unit, class or collection/assessment
   */
  timeSpent: DS.attr('number'),
  /**
   * @property {Number} The grading status for the collection/assessmet
   */
  isGraded: DS.attr('boolean'),
  /**
   *  @property {Number} The average rating score set for set for the unit, class or collection/assessment
   */
  ratingScore: DS.attr('number'),
  /**
   *  @property {Number} The number of attempts registered for the unit, class or collection/assessment
   */
  attempts: DS.attr('number'),

  /**
   *  @property {Number} The grading status for the collection/assessmet
   */
  gradingStatus: DS.attr('string'),

  /**
   *  @property {boolean} Whether the performance is completed or not.
   */
  isCompleted: Ember.computed('completionDone', 'completionTotal', function() {
    const completionTotal = this.get('completionTotal');
    const completionDone = this.get('completionDone');
    return completionDone > 0 && completionDone >= completionTotal; //TODO sometimes completion total is 0
  }),

  completionValue: Ember.computed(
    'completionDone',
    'completionTotal',
    function() {
      const completionTotal = this.get('completionTotal');
      const completionDone = this.get('completionDone');
      return completionTotal > 0
        ? (completionDone * 100) / completionTotal
        : completionDone > 0
          ? 100
          : null;
    }
  ),

  isInprogress: Ember.computed('score', 'gradingStatus', function() {
    return this.get('gradingStatus') === 'in-progress';
  }),

  hasStarted: Ember.computed('timeSpent', 'score', function() {
    return Math.floor(this.get('timeSpent')) > 0 || this.get('score') > 0;
  }),

  displayableTimeSpent: Ember.computed('timeSpent', function() {
    return formatTime(this.get('timeSpent'));
  }),

  /**
   * TODO: This is a temporal computed property. This will be removed soon.
   *  @property {String} Removes the dash from the id property in case it has one.
   */
  realId: Ember.computed('id', function() {
    var id = this.get('id');
    if (id.indexOf('@') > 0) {
      return id.split('@')[1];
    } else {
      return id;
    }
  })
});
