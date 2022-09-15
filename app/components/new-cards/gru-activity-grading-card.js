import Ember from 'ember';
import { CONTENT_TYPES } from 'gooru-web/config/config';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';
import InstructionalCoacheMixin from 'gooru-web/mixins/instructional-coache-mixin';

export default Ember.Component.extend(InstructionalCoacheMixin, {
  classNames: ['new-cards', 'gru-activity-grading-card'],

  /**
   * @requires service:api-sdk/offline-activity
   */
  offlineActivityService: Ember.inject.service(
    'api-sdk/offline-activity/offline-activity'
  ),

  /**
   * @requires service:api-sdk/assessment
   */
  assessmentService: Ember.inject.service('api-sdk/assessment'),

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  session: Ember.inject.service('session'),

  didInsertElement() {
    const component = this;
    component.loadGradingData();
    component.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
  },

  actions: {
    onGradeItem(gradingClass) {
      const component = this;
      let gradingClasses = component.get('gradingClasses').get(0);

      const gradingItem = component.get('gradingItem');
      let baseResourceId = gradingItem.subQuestionId
        ? gradingItem.resourceId
        : null;
      const gradingItemObject = Ember.Object.create({
        classId: gradingClasses.get('id'),
        dcaContentId: gradingItem.get('activityId'),
        content: gradingClass.get('gradingContent'),
        collection: gradingClass.get('content'),
        contentType: gradingItem.get('contentType'),
        studentCount: gradingClasses.get('studentCount'),
        activityDate: gradingClasses.get('activityDate')
      });
      if (baseResourceId) {
        gradingItemObject.set('baseResourceId', baseResourceId);
      }
      let activity = Ember.Object.create({
        activation_date: gradingClasses.get('activityDate')
      });
      const classActivity = Ember.Object.create({
        id: gradingClasses.get('id'),
        activity: activity,
        content: component.get('gradingContent')
      });
      component.sendAction('onGradeItem', gradingItemObject, classActivity);
    },

    onAllGradeItem(gradingClass) {
      let tempGradingItemObject = Ember.A([]);
      const component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_CA_ITEM_GRADE_SCORE);
      let gradingClasses = component.get('gradingClasses').get(0);

      gradingClass.forEach(gradQues => {
        const component = this;
        const gradingItem = component.get('gradingItem');
        let baseResourceId = gradingItem.subQuestionId
          ? gradingItem.resourceId
          : null;
        const gradingItemObject = Ember.Object.create({
          classId: gradingClasses.get('id'),
          dcaContentId:
            gradingItem.get('activityId') || gradQues.get('dca_content_id'),
          content: gradQues.get('gradingContent'),
          collection: gradQues.get('content'),
          contentType: gradingItem.get('contentType'),
          studentCount: gradingClasses.get('studentCount'),
          activityDate: gradingClasses.get('activityDate')
        });
        if (baseResourceId) {
          gradingItemObject.set('baseResourceId', baseResourceId);
        }
        let activity = Ember.Object.create({
          activation_date: gradingClasses.get('activityDate')
        });
        const classActivity = Ember.Object.create({
          id: gradingClasses.get('id'),
          activity: activity,
          content: component.get('gradingContent')
        });

        tempGradingItemObject.pushObject(gradingItemObject);
        component.sendAction(
          'onAllGradeItem',
          tempGradingItemObject,
          classActivity
        );
      });
    }
  },

  isAssessmentGrading: Ember.computed.equal(
    'gradingItem.contentType',
    CONTENT_TYPES.ASSESSMENT
  ),

  isOfflineActivityGrading: Ember.computed.equal(
    'gradingItem.contentType',
    CONTENT_TYPES.OFFLINE_ACTIVITY
  ),

  contentId: Ember.computed.alias('gradingItem.contentId'),

  gradingContent: Ember.Object.create({}),

  gradingClasses: Ember.computed.alias('gradingItem.gradingClasses'),

  filterGrades: Ember.computed.alias('gradingItem.filterGrades'),

  isInstructionalCoache: Ember.computed(function() {
    return this.instructionalCoache();
  }),

  loadGradingData() {
    const component = this;
    if (component.get('isAssessmentGrading')) {
      component.loadAssessmentData();
    } else {
      component.loadOfflineActivityData();
    }
  },

  loadAssessmentData() {
    const component = this;
    let filterGrades = component.get('gradingItem.filterGrades');

    const activationDate = filterGrades[0].get('activationDate');
    component.set('activationDate', activationDate);

    const assessmentId = filterGrades[0].get('contentId');

    return Ember.RSVP.hash({
      assessment: component
        .get('assessmentService')
        .readAssessment(assessmentId, false)
    }).then(({ assessment }) => {
      filterGrades.forEach(filterGrade => {
        const questionId = filterGrade.get('resourceId');
        const subQuestionId = filterGrade.get('subQuestionId');

        const questions = assessment.get('children');
        let question = questions.findBy('id', questionId);
        if (subQuestionId) {
          question = question.subQuestions.findBy('id', subQuestionId);
        }
        filterGrade.set('content', assessment);
        filterGrade.set('gradingContent', question);
        component.set('content', assessment);
        component.set('gradingContent', question);
      });
    });
  },

  loadOfflineActivityData() {
    const component = this;
    let filterGrades = component.get('gradingItem.filterGrades');

    const activationDate = filterGrades[0].get('activationDate');
    component.set('activationDate', activationDate);

    filterGrades.forEach(filterGrade => {
      const offlineActivityId = filterGrade.get('contentId');
      return Ember.RSVP.hash({
        offlineActivity: component
          .get('offlineActivityService')
          .readActivity(offlineActivityId)
      })
        .then(({ offlineActivity }) => {
          component.set('gradingContent', offlineActivity);
          component.set('content', offlineActivity);
          filterGrade.set('gradingContent', offlineActivity);
          filterGrade.set('content', offlineActivity);
        })
        .catch(function() {
          component.$('.activity-grading-card').addClass('content-not-found');
        });
    });
  }
});
