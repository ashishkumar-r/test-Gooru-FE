import Ember from 'ember';
import { CONTENT_TYPES } from 'gooru-web/config/config';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: [
    'reports',
    'backdrop-pull-ups',
    'pull-up-collection-report-listview'
  ],

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  // -------------------------------------------------------------------------
  // Properties

  /**
   * This property will get change based on filter selection, by default reaction filter off.
   * @type {Boolean}
   */
  isReactionFltApplied: false,

  /**
   * This property will get change based on filter selection, by default timespent filter off.
   * @type {Boolean}
   */
  isTimeSpentFltApplied: false,

  /**
   * List of contents associated with collection
   * @type {Array}
   */
  contents: Ember.A(),

  /**
   * Students report data
   * @type {Array}
   */
  studentReportData: Ember.A(),

  /**
   * Maintain the status of sort by firstName
   * @type {String}
   */
  sortByFirstnameEnabled: false,

  /**
   * Maintain the status of sort by lastName
   * @type {String}
   */
  sortByLastnameEnabled: true,

  /**
   * Maintain the status of sort by score
   * @type {String}
   */
  sortByScoreEnabled: false,

  /**
   * Maintain the status of sort by Time spent
   * @type {String}
   */
  sortByTimeSpentEnabled: false,

  /**
   * Maintains the state of suggestion  pull up
   * @type {Boolean}
   */
  showSuggestionPullup: false,

  /**
   * Maintains list of students selected for  suggest
   * @type {Array}
   */
  studentsSelectedForSuggest: Ember.A([]),

  /**
   * suggest result count
   * @type {Array}
   */
  suggestResultCount: 0,

  /**
   * Maintains the context object
   * @type {Object}
   */
  contextParams: Ember.computed('context', function() {
    let context = this.get('context');
    let params = Ember.Object.create({
      classId: context.classId,
      courseId: context.courseId,
      unitId: context.unitModel.get('id'),
      lessonId: context.lessonModel.get('id'),
      collectionId: context.id
    });
    return params;
  }),

  /**
   * defaultSuggestContentType
   * @type {String}
   */
  defaultSuggestContentType: 'collection',

  didInsertElement() {
    const component = this;
    Ember.run.later(function() {
      let questions = component.get('contents');
      let context = component.get('context');
      if (context && context.selectedQuestionId && context.selectedUserId) {
        let question = questions.filterBy('id', context.selectedQuestionId);
        if (question && question.length) {
          component.sendAction('openQuestionReport', question[0], questions);
        }
      }
    }, 2000);
  },

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    studentReport(collection, userId) {
      this.sendAction('studentReport', collection, userId);
    },

    openQuestionReport(question, questions) {
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_LJ_IS_MILESTONE_LESSON_CFU_REPORT
      );
      this.sendAction('openQuestionReport', question, questions);
    },

    likertQuestionReport(question, questions) {
      event.stopPropagation();
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_LJ_IS_MILESTONE_LESSON_CFU_REPORT
      );
      this.sendAction('likertQuestionReport', question, questions);
    },

    sortByFirstName() {
      let component = this;
      component.toggleProperty('sortByFirstnameEnabled');
      if (component.get('sortByFirstnameEnabled')) {
        component.set(
          'studentReportData',
          component.get('studentReportData').sortBy('firstName')
        );
      } else {
        component.set(
          'studentReportData',
          component
            .get('studentReportData')
            .sortBy('firstName')
            .reverse()
        );
      }
    },

    sortByLastName() {
      let component = this;
      component.toggleProperty('sortByLastnameEnabled');
      if (component.get('sortByLastnameEnabled')) {
        component.set(
          'studentReportData',
          component.get('studentReportData').sortBy('lastName')
        );
      } else {
        component.set(
          'studentReportData',
          component
            .get('studentReportData')
            .sortBy('lastName')
            .reverse()
        );
      }
    },

    sortByScore() {
      let component = this;
      component.toggleProperty('sortByScoreEnabled');
      let studentReportData;
      if (component.get('sortByScoreEnabled')) {
        studentReportData = component
          .get('studentReportData')
          .sortBy('score-use-for-sort')
          .reverse();
      } else {
        studentReportData = component
          .get('studentReportData')
          .sortBy('score-use-for-sort');
      }
      component.set('studentReportData', studentReportData);
    },

    sortByTimeSpent() {
      let component = this;
      component.toggleProperty('sortByTimeSpentEnabled');
      let studentReportData;
      if (component.get('sortByTimeSpentEnabled')) {
        studentReportData = component
          .get('studentReportData')
          .sortBy('totalTimeSpent')
          .reverse();
      } else {
        studentReportData = component
          .get('studentReportData')
          .sortBy('totalTimeSpent');
      }
      component.set('studentReportData', studentReportData);
    },

    onClickScrollLeftArrow() {
      let component = this;
      let scrollLeft = component.$('#table-fixed-right-xs').scrollLeft() - 400;
      component.$('#table-fixed-right-xs').animate(
        {
          scrollLeft: `${scrollLeft}px`
        },
        400
      );
    },

    onClickScrollRightArrow() {
      let component = this;
      let scrollLeft = component.$('#table-fixed-right-xs').scrollLeft() + 400;
      component.$('#table-fixed-right-xs').animate(
        {
          scrollLeft: `${scrollLeft}px`
        },
        400
      );
    },

    onDeSelectUser(student) {
      this.get('studentsSelectedForSuggest').removeObject(student);
      student.set('selectedForSuggestion', false);
    },

    onSelectUser(student) {
      const collectionType = this.get('context.collection.format');
      if (collectionType !== CONTENT_TYPES.COLLECTION) {
        this.get('studentsSelectedForSuggest').pushObject(student);
        student.set('selectedForSuggestion', true);
      }
    },

    onOpenSuggestionPullup() {
      this.set('showSuggestionPullup', true);
    },

    onCloseSuggest() {
      this.set('studentsSelectedForSuggest', Ember.A());
      this.get('studentReportData')
        .filterBy('selectedForSuggestion', true)
        .map(data => {
          data.set('selectedForSuggestion', false);
        });
    }
  }
});
