import Ember from 'ember';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

/**
 * class performance chart
 *
 * @module
 * @augments ember/Component
 */
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['teacher', 'class-atc-view'],

  // -------------------------------------------------------------------------
  // Dependencies
  session: Ember.inject.service('session'),

  // -------------------------------------------------------------------------
  // Events

  didRender() {
    var component = this;
    component.$('[data-toggle="tooltip"]').tooltip({ trigger: 'hover' });
  },

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * Action triggered when click on carousel nav
     */
    onChangeAtcClass(actionSequence) {
      let component = this;
      component.set('isLoading', true);
      component.sendAction('onChangeAtcClass', actionSequence);
    },

    /**
     * Action triggered when click on class properties icon
     * Page will be redirected to specific route based on item selected
     */
    onSelectClassItem(item, classId) {
      let component = this;
      component.sendAction('onSelectClassItem', item, classId);
    },

    /**
     * Action triggered when select a domain from pull up
     */
    onSelectDomain(domainSet) {
      let component = this;
      component.set('selectedDomain', domainSet);
      component.set('isShowDomainCompetencyReport', true);
    },

    /**
     * Action triggered when close all pull ups
     */
    onCloseCompetencyReportPullUp() {
      let component = this;
      component.set('isShowDomainCompetencyReport', false);
      component.set('isShowCompetencyReport', false);
    },

    /**
     * Action triggered when select a competency from competency report
     */
    onSelectCompetency(competency, userId) {
      let component = this;
      component.set('selectedCompetency', competency);
      component.set('selectedStudentUserId', userId);
      component.set('isShowCompetencyContentReport', true);
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_GROWTH_SUGGESTION_COLLECTION
      );
    },

    onSelectSecondaryClass(secondaryClass) {
      const component = this;
      component.sendAction('onSelectSecondaryClass', secondaryClass);
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {JSON}
   * Property to hold active class data
   */
  classData: null,

  /**
   * @property {Boolean}
   * Property to enable/disable previous nav icon
   */
  isPreviousDisabled: Ember.computed('classPosition', function() {
    let component = this;
    let classPosition = component.get('classPosition');
    return classPosition === 0;
  }),

  /**
   * @property {Boolean}
   * Property to enable/disable next nav icon
   */
  isNextDisabled: Ember.computed('classPosition', 'totalClasses', function() {
    let component = this;
    let totalClasses = component.get('totalClasses');
    let classPosition = component.get('classPosition');
    return totalClasses === classPosition + 1;
  }),

  /**
   * @property {Array}
   * Property to hold class performance data
   */
  classPerformanceData: Ember.computed('classData', function() {
    let component = this;
    let classPerformance = component.get('classData.performance');
    let score = classPerformance ? classPerformance.score : 0;
    let classPerformanceData = Ember.A([
      {
        score: score
      }
    ]);
    return classPerformanceData;
  }),

  /**
   * @property {Boolean}
   * Computed property  to identify class is started or not
   */
  hasStarted: Ember.computed('classData', function() {
    const scorePercentage = this.get('classData.performance.score');
    return scorePercentage !== null && scorePercentage >= 0;
  }),

  /**
   * @property {Boolean}
   * Property to check whether the class mapped with a course or not
   */
  isStudentPerformed: Ember.computed('classData', function() {
    let component = this;
    return component.get('classData.courseId') || false;
  }),

  /**
   * @property {Boolean}
   * Property to show/hide competency report pull up
   */
  isShowCompetencyReport: false,

  /**
   * @property {Boolean}
   * Property to show/hide domain competency report pull up
   */
  isShowDomainCompetencyReport: false,

  /**
   * @property {courseSubjectCode}
   * Property to fetch subject code from subject bucket
   */
  courseSubjectCode: Ember.computed('classData', function() {
    let component = this;
    let classData = component.get('classData');
    return classData.courseSubjectCode;
  }),

  /**
   * @property {Boolean}
   * Property to check whether a premium course or not
   */
  isPremiumClass: Ember.computed('classData', function() {
    let component = this;
    let classData = component.get('classData');
    let setting = classData.setting;
    return setting ? setting['course.premium'] : false;
  })
});
