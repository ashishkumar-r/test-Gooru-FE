import Ember from 'ember';
import { getObjectsDeepCopy } from 'gooru-web/utils/utils';

export default Ember.Component.extend({
  // -------------------------------------------------------------
  // Attributes

  classNames: ['student-standard-list-pull-up'],

  // ------------------------------------------------------------------
  // Dependencies

  /**
   * @requires competencyService
   */
  competencyService: Ember.inject.service('api-sdk/competency'),

  /**
   * Class Activities Service
   */
  classActivitiesService: Ember.inject.service('api-sdk/class-activity'),

  /**
   * @property {service} suggestService
   */
  suggestService: Ember.inject.service('api-sdk/suggest'),

  session: Ember.inject.service(),

  /**
   * @property {service} searchService
   */
  searchService: Ember.inject.service('api-sdk/search'),

  // ------------------------------------------------------------------
  // Properties

  showCompetencyInfo: false,

  selectedCompetency: null,

  class: null,

  activeCompetency: null,

  isLoading: false,

  totalSuggestions: Ember.computed('activeCompetency', function() {
    let students = this.get('activeCompetency.students');
    return students ? students.reduce((a, b) => a + b.suggestions, 0) : 0;
  }),

  showSuggestConfirmation: false,

  suggestedCollection: null,

  suggestedCollectionType: null,

  userId: Ember.computed.alias('session.userId'),

  suggestions: Ember.A(),

  selectedStudent: null,

  watchSelectedCompetency: Ember.observer('selectedCompetency', function() {
    if (this.get('selectedCompetency')) {
      this.fetchUsersListByCompetency();
      this.fetchLearningMapsContent();
    }
  }),
  filteredWeekLocal: Ember.A([]),

  /**
   * @property {String} previewContentType
   * property hold the content type of the preview
   */
  previewContentType: null,

  /**
   * @property {Array} previewContent
   * property hold the content type of the preview
   */
  previewContent: null,

  /**
   * @property {Boolean} isShowContentPreview
   * property help to show the preview collection from the competency pullup
   */
  isShowContentPreview: false,

  /**
   * @property {Boolean} isShowStrugglingCompetencyReport
   * property hold the show / hide activity for grade competency
   */
  isShowStrugglingCompetencyReport: false,

  /**
   * @property {boolean} isShowCompetencyStudentList
   */
  isShowCompetencyStudentList: false,

  // ---------------------------------------------------------------------
  // Actions

  actions: {
    onSearchWeeklyLocal(searchWeekLocal) {
      let filteredStudents = getObjectsDeepCopy(
        this.get('activeCompetency.students')
      ).filter(student => {
        searchWeekLocal = searchWeekLocal.toLowerCase();
        return (
          (student.firstName &&
            student.firstName.toLowerCase().startsWith(searchWeekLocal)) ||
          (student.lastName &&
            student.lastName.toLowerCase().startsWith(searchWeekLocal))
        );
      });
      this.set('filteredWeekLocal', filteredStudents);
    },
    onClosePullup() {
      this.toggleProperty('showCompetencyInfo');
      this.sendAction('onClosePullUp');
    },

    onPrint() {
      window.print();
    },

    onSuggestContent(student) {
      this.set('selectedStudent', [student]);
      student.set('avatarUrl', student.thumbnailUrl);
      this.set('showSuggestConfirmation', true);
      this.set('isShowStrugglingCompetencyReport', true);
    },

    onCancelSuggest() {
      this.set('showSuggestConfirmation', false);
    },

    onConfirmSuggest() {
      this.suggestContent();
      this.set('showSuggestConfirmation', false);
    },

    // Action trigger when click ah play button
    onPreviewContent(content) {
      let component = this;
      component.set(
        'previewContentType',
        content.get('format') || content.get('collectionType')
      );
      component.set('previewContent', content);
      component.set('isShowContentPreview', true);
    },

    // Action trigger when click add to class activity
    onAddCollectionToDCA(content) {
      let component = this;
      let classId = component.get('class.id');
      let contentType = content.get('format');
      let contentId = content.get('id');
      let date = moment().format('YYYY-MM-DD');
      let selectedStudent = component.get('selectedStudent');
      component
        .get('classActivitiesService')
        .addActivityToClass(classId, contentId, contentType, date)
        .then(newContentId => {
          component.saveUsersToCA(newContentId, selectedStudent);
          content.set('isAdded', true);
        });
    },

    /**
     * Action get triggered when schedule content to CA got clicked
     */
    onScheduleContentToDCA(content) {
      let component = this;
      let datepickerEle = component.$('.ca-datepicker-schedule-container');
      datepickerEle.show();
      component.set('selectedContentForSchedule', content);
      component.set('endDate', null);
    },

    /**
     * It will takes care of content will schedule for the specific date.
     * @param  {String} scheduleDate
     */
    onScheduleDate(scheduleDate, scheduleEndDate) {
      let component = this;
      let classId = component.get('class.id');
      let contentType = component.get('selectedContentForSchedule.format');
      let contentId = component.get('selectedContentForSchedule.id');
      let datepickerEle = component.$('.ca-datepicker-schedule-container');
      datepickerEle.hide();
      let forMonth = moment(scheduleDate).format('MM');
      let forYear = moment(scheduleDate).format('YYYY');
      component
        .get('classActivitiesService')
        .addActivityToClass(
          classId,
          contentId,
          contentType,
          scheduleDate,
          forMonth,
          forYear,
          scheduleEndDate
        )
        .then(newContentId => {
          let selectedStudent = component.get('selectedStudent');
          component.saveUsersToCA(newContentId, selectedStudent);
          component.set('selectedContentForSchedule.isScheduled', true);
        });
    },

    /**
     * It will takes care of content will schedule for the specific month.
     * @param  {Moment} Month
     * @param  {Moment} Year
     */
    onScheduleForMonth(forMonth, forYear) {
      let component = this;
      let classId = component.get('classId');
      let contentType = component.get('selectedContentForSchedule.format');
      let contentId = component.get('selectedContentForSchedule.id');
      let datepickerEle = component.$('.ca-datepicker-schedule-container');
      datepickerEle.hide();
      component
        .get('classActivitiesService')
        .addActivityToClass(
          classId,
          contentId,
          contentType,
          null,
          forMonth,
          forYear
        )
        .then(newContentId => {
          let selectedStudent = component.get('selectedStudent');
          component.saveUsersToCA(newContentId, selectedStudent);
          component.set('selectedContentForSchedule.isScheduled', true);
        });
    },

    /**
     * Action triggered when the user click on close
     */
    onCloseDatePicker() {
      let datepickerEle = Ember.$('.ca-datepicker-schedule-container');
      datepickerEle.hide();
    },

    // action trigger when close struggling competency pull up
    onClosePullUp(isCloseAll) {
      if (isCloseAll) {
        this.set('isShowOtherGradeCompetency', false);
        this.set('isShowGradeCompetency', false);
      }
      this.set('isShowContentPreview', false);
      this.set('isShowStrugglingCompetencyReport', false);
      this.set('isShowCompetencyStudentList', false);
    }
  },

  // ---------------------------------------------------------------------
  // Hooks

  didInsertElement() {
    if (this.get('selectedCompetency')) {
      this.fetchUsersListByCompetency();
      this.fetchLearningMapsContent();
    }
    this.set('isShowCompetencyStudentList', true);
  },

  // --------------------------------------------------------------------
  // Methods

  fetchUsersListByCompetency() {
    let component = this;
    component.set('isLoading', true);
    let params = {
      classId: component.get('class.id'),
      competency: component.get('selectedCompetency.competencyCode')
    };
    component
      .get('competencyService')
      .fetchStudentsByCompetency(params)
      .then(usersList => {
        component.set('isLoading', false);
        component.set('activeCompetency', usersList);
        component.$('.student-standard-list-container').toggleClass('pullUp');
        component.set(
          'filteredWeekLocal',
          getObjectsDeepCopy(usersList.students)
        );
      });
  },

  suggestContent() {
    const component = this;
    let userId = component.get('selectedStudent.firstObject').userId;
    let collection = component.get('suggestedCollection');
    let collectionType = component.get('suggestedContentType');
    let competencyCode = component.get('selectedCompetency.competencyCode');
    let contextParams = {
      user_id: userId,
      class_id: component.get('class.id'),
      suggested_content_id: collection.get('id'),
      suggestion_origin: 'teacher',
      suggestion_originator_id: component.get('session.userId'),
      suggestion_criteria: 'performance',
      suggested_content_type: collectionType,
      suggested_to: 'student',
      suggestion_area: 'proficiency',
      tx_code: competencyCode,
      tx_code_type: 'competency'
    };
    component.get('suggestService').suggestContent(contextParams);
  },

  /**
   * @function fetchLearningMapsContent
   * Method to fetch learning maps content
   */
  fetchLearningMapsContent() {
    let component = this;
    let searchService = component.get('searchService');
    let competencyCode = component.get('selectedCompetency.competencyCode');
    let filters = {
      isDisplayCode: true
    };
    return Ember.RSVP.hash({
      learningMapData: searchService.fetchLearningMapsContent(
        competencyCode,
        filters
      )
    }).then(({ learningMapData }) => {
      if (!(component.get('isDestroyed') || component.get('isDestroying'))) {
        let signatureContentList = learningMapData.signatureContents;
        let showSignatureAssessment =
          component.get('showSignatureAssessment') &&
          signatureContentList.assessments.length > 0;
        component.set('showSignatureAssessment', showSignatureAssessment);
        let signatureContent = showSignatureAssessment
          ? signatureContentList.assessments
          : signatureContentList.collections;
        let content = signatureContent.objectAt(0);
        if (content) {
          component.set('suggestedCollection', Ember.Object.create(content));
          component.set(
            'suggestedContentType',
            showSignatureAssessment ? 'assessment' : 'collection'
          );
        }
      }
    });
  },

  saveUsersToCA(newContentId, selectedStudent) {
    let component = this;
    let classId = component.get('class.id');
    let contentId = newContentId;
    let students = selectedStudent;
    let users = students.map(student => {
      return student.get('userId');
    });
    component
      .get('classActivitiesService')
      .addUsersToActivity(classId, contentId, users);
  }
});
