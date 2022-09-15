import Ember from 'ember';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend({
  classNames: ['oca-month-report-pull-up'],

  /**
   * @requires service:api-sdk/class-activity
   */
  classActivityService: Ember.inject.service('api-sdk/class-activity'),

  courseService: Ember.inject.service('api-sdk/course'),

  classService: Ember.inject.service('api-sdk/class'),

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),
  /**
   *
   @requires service:api-sdk/class-activity
  /**
   * Propery of class id
   * @property {Number}
   */
  classId: null,

  /**
   * Propery of context from parent
   * @property {Object}
   */
  context: null,

  /**
   * Propery of class activities
   * @property {Array}
   */
  classActivities: null,

  /**
   * Propery of selected activity
   * @property {Object}
   */
  selectedActivity: null,

  /**
   * Propery to hide the default pullup.
   * @property {Boolean}
   */
  showPullUp: false,

  /**
   * @property {Boolean}
   */
  isShowStudentsSummaryReport: false,
  primaryClass: null,

  /**
   * @property {Boolean}
   */
  isLoading: false,

  allSummaryData: null,

  contextObserver: Ember.observer('context', function() {
    this.loadData();
  }),

  selectedIndex: Ember.computed('context', function() {
    let component = this;
    let selectedSummary = component.get('context');
    let allSummary = component.get('allSummaryData');
    return allSummary.indexOf(selectedSummary);
  }),

  isToggleLeft: Ember.computed('context', function() {
    let component = this;
    let selectedIndex = component.get('selectedIndex');
    return selectedIndex > 0;
  }),

  isToggleRight: Ember.computed('context', function() {
    let component = this;
    let selectedIndex = component.get('selectedIndex');
    let length = component.get('allSummaryData').length;
    return selectedIndex < length - 1;
  }),

  actions: {
    onPullUpClose(closeAll) {
      let component = this;
      component.closePullUp(closeAll);
    },

    pullUpClose(closeAll) {
      let component = this;
      component.set('isShowStudentsSummaryReport', false);
      if (closeAll) {
        component.closePullUp(closeAll);
      }
    },

    onSelectActivity(activityClass) {
      let component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_CS_ACTIVITY_REPORT);
      const classActivity = Ember.Object.create({
        classId: activityClass.get('id'),
        id: activityClass.get('activity.id'),
        collection: activityClass.get('content'),
        contentId: activityClass.get('content.id'),
        contentType: activityClass.get('content.collectionType'),
        activation_date: activityClass.get('activity.activation_date')
          ? activityClass.get('activity.activation_date')
          : moment().format('YYYY-MM-DD'),
        end_date: activityClass.get('activity.end_date'),
        tabindex: this.get('tabindex'),
        activityClass
      });
      component.set('selectedActivity', classActivity);
      component.set('isShowStudentsSummaryReport', true);
    },
    onOpenPerformanceEntry(activityClass) {
      const component = this;
      component.sendAction('onOpenPerformanceEntry', activityClass);
    },

    toggle(isLeft) {
      let component = this;
      let currentIndex = component.get('selectedIndex');
      let allSummary = component.get('allSummaryData');
      let indexPosition = isLeft ? currentIndex - 1 : currentIndex + 1;
      let summary = allSummary.objectAt(indexPosition);
      if (summary) {
        component.set('context', summary);
      }
    }
  },

  // -------------------------------------------------------------------------
  // Events

  didInsertElement() {
    this.openPullUp();
    this.handleAppContainerScroll();
  },

  didDestroyElement() {
    this.handleAppContainerScroll();
  },

  init() {
    let component = this;
    component._super(...arguments);
    component.loadData();
  },

  /**
   * Function to animate the  pullup from bottom to top
   */
  openPullUp() {
    let component = this;
    component.set('showPullUp', true);
    component.$().animate(
      {
        top: '10%'
      },
      400
    );
  },

  /**
   * Function to animate the  pullup from top to bottom
   */
  closePullUp(closeAll) {
    let component = this;
    component.$().animate(
      {
        top: '100%'
      },
      400,
      function() {
        component.set('showPullUp', false);
        component.sendAction('onClosePullUp', closeAll);
      }
    );
  },

  /**
   * Function to hanle the pullup scroll
   */
  handleAppContainerScroll() {
    let activePullUpCount = Ember.$(document.body).find('.backdrop-pull-ups')
      .length;
    if (activePullUpCount > 0) {
      Ember.$(document.body).addClass('no-vertical-scroll');
    } else if (activePullUpCount === 0) {
      Ember.$(document.body).removeClass('no-vertical-scroll');
    }
  },

  loadData() {
    let component = this;
    let forMonth = component.get('context.month');
    let forYear = component.get('context.year');
    let startDate = `${forYear}-${forMonth}-01`;
    var endDate = moment(startDate)
      .endOf('month')
      .format('YYYY-MM-DD');
    const classId = component.get('classId');
    component.set('isLoading', true);
    Ember.RSVP.hash({
      classActivities: component
        .get('classActivityService')
        .getPerformanceOfClassActivitiesForMonth(classId, startDate, endDate)
    }).then(function(hash) {
      component.set(
        'classActivities',
        component.groupActivitiesByClass(hash.classActivities)
      );
      component.set('isLoading', false);
    });
  },
  groupActivitiesByClass(classActivities) {
    const component = this;
    const groupedActivities = Ember.A([]);
    const primaryClass = component.get('primaryClass');
    const secondaryClassesData = component.get('secondaryClasses');
    classActivities.map(classActivity => {
      let activityClassData =
        secondaryClassesData.findBy('id', classActivity.get('classId')) ||
        primaryClass;

      let existingActivity;
      if (classActivity.contentType !== 'meeting') {
        existingActivity = groupedActivities.find(groupedActivity => {
          return (
            groupedActivity.get('contentId') ===
              classActivity.get('contentId') &&
            groupedActivity.get('added_date') ===
              classActivity.get('added_date') &&
            groupedActivity.get('end_date') === classActivity.get('end_date')
          );
        });
      }
      let activityClass = component.getStructuredClassActivityObject(
        classActivity,
        activityClassData
      );
      if (existingActivity) {
        let activityClasses = existingActivity.get('activityClasses');
        activityClasses.pushObject(activityClass);
      } else {
        classActivity.set('activityClasses', Ember.A([activityClass]));
        classActivity.set('isActive', !!classActivity.get('activation_date'));
        groupedActivities.pushObject(classActivity);
      }
    });
    return groupedActivities;
  },

  getStructuredClassActivityObject(classActivity, activityClassData) {
    return Ember.Object.create({
      id: classActivity.get('classId'),
      title: activityClassData.get('title'),
      courseId: activityClassData.get('courseId') || null,
      members: activityClassData.get('members') || null,
      course: activityClassData.get('course') || null,
      content: classActivity.get('collection'),
      code: activityClassData.get('code') || null,
      memberCount: activityClassData.get('memberCount') || 0,
      activity: Ember.Object.create({
        id: classActivity.get('id'),
        usersCount: classActivity.get('usersCount'),
        isCompleted: classActivity.get('isCompleted'),
        allowMasteryAccrual: classActivity.get('allowMasteryAccrual'),
        activation_date: classActivity.get('activation_date'),
        end_date: classActivity.get('end_date'),
        added_date: classActivity.get('added_date')
      })
    });
  }
});
