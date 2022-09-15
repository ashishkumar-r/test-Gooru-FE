import Ember from 'ember';
import { CONTENT_TYPES } from 'gooru-web/config/config';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['activity-report', 'monthly-summary-report'],

  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @requires service:api-sdk/analytics
   */
  analyticsService: Ember.inject.service('api-sdk/analytics'),

  /**
   * @requires service:api-sdk/class-activity
   */
  classActivityService: Ember.inject.service('api-sdk/class-activity'),

  /**
   * @requires service:session
   */
  session: Ember.inject.service('session'),

  // -------------------------------------------------------------------------
  // Events
  didInsertElement() {
    const component = this;
    component.loadClassActivityData();
  },

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    //Action triggered when click on sort by date
    onSortByDate() {
      const component = this;
      if (component.get('isSortedByDate')) {
        component.set(
          'activitySummaryList',
          component.get('activitySummaryList').sortBy('date')
        );
      } else {
        component.set(
          'activitySummaryList',
          component
            .get('activitySummaryList')
            .sortBy('date')
            .reverse()
        );
      }
      component.toggleProperty('isSortedByDate');
    },

    //Action triggered when click on sort by title
    onSortByTitle() {
      const component = this;
      if (component.get('isSortedByTitle')) {
        component.set(
          'activitySummaryList',
          component
            .get('activitySummaryList')
            .sortBy('title')
            .reverse()
        );
      } else {
        component.set(
          'activitySummaryList',
          component.get('activitySummaryList').sortBy('title')
        );
      }
      component.toggleProperty('isSortedByTitle');
    },

    //Action triggered when click on filter by assessment
    onFilterByAssessment() {
      const component = this;
      if (component.get('isAssessmentFilterActive')) {
        component.set(
          'activitySummaryList',
          component.get('collectionSummaryList')
        );
      } else if (component.get('isCollectionFilterActive')) {
        component.set(
          'activitySummaryList',
          component.get('monthlySummaryList')
        );
      }
      component.toggleProperty('isAssessmentFilterActive');
    },

    //Action triggered when click on filter by collection
    onFilterByCollection() {
      const component = this;
      if (component.get('isCollectionFilterActive')) {
        component.set(
          'activitySummaryList',
          component.get('assessmentSummaryList')
        );
      } else if (component.get('isAssessmentFilterActive')) {
        component.set(
          'activitySummaryList',
          component.get('monthlySummaryList')
        );
      }
      component.toggleProperty('isCollectionFilterActive');
    },

    //Action triggered when carousel through months
    onCarouselMonth(direction) {
      const component = this;
      let activeIndex = component.get('activeIndex');
      activeIndex = direction === 'prev' ? activeIndex - 1 : activeIndex + 1;
      component.set('activeIndex', activeIndex);
      component.set(
        'reportContext',
        component.get('classSummary').objectAt(activeIndex)
      );
      component.loadClassActivityData();
    },

    //Action triggered when click on the content performance
    onOpenContentReport(activityContent) {
      const component = this;
      let contentType = activityContent.get('contentType');
      let params = {
        userId: component.get('userId'),
        classId: component.get('classId'),
        collectionId: activityContent.get('content.id'),
        type: contentType,
        isStudent: true,
        collection: activityContent.get('content'),
        activityDate: moment(activityContent.get('date')).format('YYYY-MM-DD'),
        studentPerformance: activityContent.get('performanceSummary'),
        startDate: moment(activityContent.get('start_date')).format(
          'YYYY-MM-DD'
        ),
        endDate: moment(activityContent.get('end_date')).format('YYYY-MM-DD')
      };
      if (contentType === 'assessment-external') {
        component.set('isShowStudentExternalAssessmentReport', true);
      } else if (contentType === 'collection-external') {
        component.set('isShowStudentExternalCollectionReport', true);
      } else {
        component.set('showStudentDcaReport', true);
      }

      component.set('studentReportContextData', params);
    },

    //Action triggered when click close pullup
    onClosePullUp(isCloseAll) {
      const component = this;
      component.set('showStudentDcaReport', false);
      component.set('isShowStudentExternalAssessmentReport', false);
      component.set('isShowStudentExternalCollectionReport', false);
      if (isCloseAll) {
        component.sendAction('onClosePullUp', isCloseAll);
      }
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Booean} isShowStudentExternalAssessmentReport
   */
  isShowStudentExternalAssessmentReport: false,

  /**
   * @property {Boolean} showStudentDcaReport
   */
  showStudentDcaReport: false,

  /**
   * @property {Boolean} isShowStudentExternalCollectionReport
   */
  isShowStudentExternalCollectionReport: false,

  /**
   * @property {Number} activeIndex
   */
  activeIndex: Ember.computed('classSummary', function() {
    const component = this;
    const classSummary = component.get('classSummary');
    let reportContext = component.get('reportContext');
    return classSummary.indexOf(reportContext);
  }),

  /**
   * @property {Boolean} isPrevEnabled
   */
  isPrevEnabled: Ember.computed.gt('activeIndex', 0),

  /**
   * @property {Boolean} isNextEnabled
   */
  isNextEnabled: Ember.computed('activeIndex', function() {
    const component = this;
    let activeIndex = component.get('activeIndex');
    let totalMonths = component.get('classSummary.length') - 1;
    return activeIndex < totalMonths;
  }),

  /**
   * @property {Booelan} isAssessmentFilterActive
   */
  isAssessmentFilterActive: true,

  /**
   * @property {Boolean} isCollectionFilterActive
   */
  isCollectionFilterActive: true,

  /**
   * @property {Boolean} isSortedByDate
   */
  isSortedByDate: true,

  /**
   * @property {String} defaultSortCriteria
   */
  defaultSortCriteria: 'date',

  /**
   * @property {Boolean} isSortedByTitle
   */
  isSortedByTitle: false,

  /**
   * @property {Object} reportContext
   */
  reportContext: null,

  /**
   * @property {Number} scoreInPercentage
   */
  scoreInPercentage: Ember.computed.alias('reportContext.scoreInPercentage'),

  /**
   * @property {Number} timespent
   */
  timespent: Ember.computed.alias('reportContext.timespent'),

  /**
   * @property {Number} month
   */
  month: Ember.computed.alias('reportContext.month'),

  /**
   * @property {Number} year
   */
  year: Ember.computed.alias('reportContext.year'),

  /**
   * @property {UUID} userId
   */
  userId: Ember.computed.alias('session.userId'),

  /**
   * @property {Array} assessmentSummaryList
   */
  assessmentSummaryList: Ember.A([]),

  /**
   * @property {Array} collectionSummaryList
   */
  collectionSummaryList: Ember.A([]),

  /**
   * @property {Array} monthlySummaryList
   */
  monthlySummaryList: Ember.A([]),

  /**
   * @property {Array} activitySummaryList
   */
  activitySummaryList: Ember.computed('monthlySummaryList', function() {
    const component = this;
    let monthlySummaryList = component.get('monthlySummaryList');
    return monthlySummaryList
      .sortBy(component.get('defaultSortCriteria'))
      .reverse();
  }),

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function loadClassActivityData
   * Method to load class activity data
   */
  loadClassActivityData() {
    const component = this;
    component.set('isLoading', true);
    component.fetchClassActivities().then(function(classActivities) {
      component.parseClassActivitiesMonthlySummary(classActivities);
    });
  },

  /**
   * @function fetchClassActivities
   * Method to fetch class activities
   */
  fetchClassActivities() {
    const component = this;
    const classActivityService = component.get('classActivityService');
    const classId = component.get('classId');
    const userId = component.get('userId');
    let forMonth = component.get('month');
    let forYear = component.get('year');
    let startDate = `${forYear}-${forMonth}-01`;
    var endDate = moment(startDate)
      .endOf('month')
      .format('YYYY-MM-DD');
    return classActivityService.getStudentScheduledActivities(
      userId,
      classId,
      startDate,
      endDate
    );
  },

  /**
   * @function parseClassActivitiesMonthlySummary
   * Method to parse class activity monthly summary
   */
  parseClassActivitiesMonthlySummary(classActivities) {
    const component = this;
    let collectionSummaryList = Ember.A([]);
    let assessmentSummaryList = Ember.A([]);
    let monthlySummaryList = Ember.A([]);
    classActivities.map(activity => {
      let activityContent = activity.get('collection');
      let activityContentType =
        activityContent.get('format') || activityContent.get('collectionType');
      let activityPerformanceData = Ember.Object.create({
        content: activityContent,
        contentType: activityContentType,
        performanceSummary: activityContent.get('performance'),
        date: activity.get('date'),
        month: activity.get('forMonth'),
        year: activity.get('forYear'),
        id: activity.get('id'),
        title: activityContent.get('title'),
        start_date: activity.get('activation_date'),
        end_date: activity.get('end_date')
      });
      if (
        activityContentType === CONTENT_TYPES.ASSESSMENT ||
        activityContentType === CONTENT_TYPES.EXTERNAL_ASSESSMENT
      ) {
        assessmentSummaryList.pushObject(activityPerformanceData);
      } else {
        collectionSummaryList.pushObject(activityPerformanceData);
      }
    });
    if (!component.isDestroyed) {
      monthlySummaryList = assessmentSummaryList.concat(collectionSummaryList);
      component.set('assessmentSummaryList', assessmentSummaryList);
      component.set('collectionSummaryList', collectionSummaryList);
      component.set('monthlySummaryList', monthlySummaryList);
      component.set('isLoading', false);
    }
    return monthlySummaryList;
  }
});
