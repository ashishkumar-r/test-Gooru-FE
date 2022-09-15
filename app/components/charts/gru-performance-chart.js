import Ember from 'ember';
import { getBarGradeColor } from 'gooru-web/utils/utils';
import { roundFloat } from 'gooru-web/utils/math';

/**
 * Performance and Completion Chart
 *
 * Component responsible for showing the Performance and Completion Chart.
 * This component takes the dimensions of height and width from the parent element.
 *
 * @module
 * @augments ember/Component
 */
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['charts', 'gru-performance-chart'],

  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @requires service:session
   */
  session: Ember.inject.service('session'),

  /**
   * @requires service:i18n
   */
  i18n: Ember.inject.service(),

  // -------------------------------------------------------------------------
  // Events

  didRender: function() {
    this.$('[data-toggle="tooltip"]').tooltip();
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * Indicates if it is a teacher
   * @property {boolean}
   */
  isTeacher: false,
  /**
   * @property {Performance} Performance summary
   */
  performanceSummary: null,
  /**
   * @property {integer} assessmentCount
   */
  assessmentCount: null,
  /**
   * @property {String} Route to go after clicking on percentage
   */
  routeToGo: null,

  /**
   * @property {Text} score text
   * Computed property for the performance score text to be displayed
   */
  scoreText: Ember.computed('performanceSummary.score', function() {
    let scorePercentage = this.get('performanceSummary.score');
    if (this.get('assessmentCount') === 0) {
      scorePercentage = null;
    }
    return scorePercentage >= 0 && scorePercentage !== null
      ? `${scorePercentage}%`
      : this.get('i18n').t('common.not_started').string;
  }),

  isNotStarted: Ember.computed('performanceSummary.score', function() {
    let scorePercentage = this.get('performanceSummary.score');
    if (this.get('assessmentCount') === 0) {
      scorePercentage = null;
    }
    return !(scorePercentage >= 0 && scorePercentage !== null);
  }),

  /**
   * @property {Text} score text
   * Computed property for the performance score text to be displayed
   */
  scoreVal: Ember.computed('performanceSummary.score', function() {
    let scorePercentage = this.get('performanceSummary.score');
    if (this.get('assessmentCount') === 0) {
      scorePercentage = null;
    }
    return scorePercentage >= 0 && scorePercentage !== null
      ? `${scorePercentage}`
      : '--';
  }),
  /**
   * @property {Boolean} hasStarted
   * Computed property to know if course has started
   */
  hasStarted: Ember.computed('performanceSummary', function() {
    return this.get('performanceSummary') !== null;
  }),

  /**
   * @property {Number} completionPercentage
   * Computed property to calculate the completion percentage
   */
  completionPercentage: Ember.computed('performanceSummary', function() {
    const completed =
      this.get('performanceSummary.totalCompleted') ||
      this.get('performanceSummary.completionTotal');
    const total =
      this.get('performanceSummary.total') ||
      this.get('performanceSummary.completionTotal');
    return completed ? roundFloat((completed / total) * 100) : 0;
  }),

  /**
   * @property {Number} tooltipText
   * Computed property to show the tooltipText
   */
  tooltipText: Ember.computed('performanceSummary', function() {
    const completed =
      this.get('performanceSummary.totalCompleted') ||
      this.get('performanceSummary.completionTotal') ||
      0;
    const total =
      this.get('performanceSummary.total') ||
      this.get('performanceSummary.completionTotal');
    const percentage = completed ? roundFloat((completed / total) * 100) : 0;
    var tooltipText = `${percentage}% ${
      this.get('i18n').t('common.completed').string
    }`;
    if (this.get('assessmentCount') === 0) {
      tooltipText = 'NA';
    }
    return tooltipText;
  }),

  /**
   * @property {String} widthStyle
   * Computed property to know the width of the bar
   */
  widthStyle: Ember.computed('completionPercentage', function() {
    const completed =
      this.get('performanceSummary.totalCompleted') ||
      this.get('performanceSummary.completionTotal') ||
      0;
    const total =
      this.get('performanceSummary.total') ||
      this.get('performanceSummary.completionTotal');
    const percentage = completed ? roundFloat((completed / total) * 100) : 0;

    return Ember.String.htmlSafe(`width: ${percentage}%;`);
  }),

  /**
   * @property {String} barColor
   * Computed property to know the color of the small bar
   */
  colorStyle: Ember.computed('performanceSummary', function() {
    let score = this.get('performanceSummary.score');
    return Ember.String.htmlSafe(
      `background-color: ${getBarGradeColor(score)};`
    );
  }),

  /**
   * @property {Boolean} isFull
   * Computed property to know if the completion is full
   */
  isFull: Ember.computed('completionPercentage', function() {
    return this.get('completionPercentage') >= 100;
  })
});
