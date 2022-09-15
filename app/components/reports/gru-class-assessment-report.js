import Ember from 'ember';
import ModalMixin from 'gooru-web/mixins/modal';
import { VIEW_LAYOUT_PICKER_OPTIONS } from 'gooru-web/config/config';
import AssessmentResult from 'gooru-web/models/result/assessment';
// Private variables

export default Ember.Component.extend(ModalMixin, {
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['reports', 'gru-class-assessment-report'],

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Set a new emotion as selected and update the component appearance accordingly
     *
     * @function actions:changeView
     * @param {string} layout type @see gru-view-layout-picker
     * @returns {undefined}
     */
    changeView: function(layout) {
      const thumbnails = layout === VIEW_LAYOUT_PICKER_OPTIONS.LIST;
      this.set('isTableView', !thumbnails);
    },

    /**
     * When showing the question details
     * @param {string} questionId
     */
    viewQuestionDetail: function(questionId) {
      Ember.Logger.debug(
        `Class assessment report: question with ID ${questionId} was selected`
      );

      let question = this.get('assessment.resources').findBy('id', questionId);
      let modalModel = {
        anonymous: this.get('anonymous'),
        assessment: this.get('assessment'),
        students: this.get('students'),
        selectedQuestion: question,
        reportData: this.get('reportData')
      };
      this.actions.showModal.call(
        this,
        'reports.class-assessment.gru-questions-detail',
        modalModel,
        null,
        'gru-questions-detail-modal',
        true
      );
    },

    /**
     * When showing the student details
     * @param {string} studentId
     */
    viewAssessmentReport: function(studentId) {
      Ember.Logger.debug(
        `Class assessment report: student with ID ${studentId} was selected`
      );
      let userObj = this.get('students').findBy('id', studentId);
      if (userObj !== undefined) {
        let reportData = this.get('reportData');
        let assessment = this.get('assessment');
        let resourceResults = reportData.getResultsByStudent(studentId);
        resourceResults.forEach(function(resourceResult) {
          let resource = assessment
            .get('resources')
            .findBy('id', resourceResult.get('resourceId'));
          resourceResult.set('resource', resource);
        });

        let assessmentResult = AssessmentResult.create({
          totalAttempts: 1,
          selectedAttempt: 1,
          resourceResults: resourceResults,
          collection: assessment,
          isRealTime: this.get('isRealTime'),
          showAttempts: this.get('showAttempts')
        });

        let modalModel = {
          assessmentResult: assessmentResult,
          profile: userObj
        };
        this.actions.showModal.call(
          this,
          'reports.gru-assessment-report',
          modalModel,
          null,
          'gru-assessment-report-modal',
          true
        );
      }
    }
  },

  // -------------------------------------------------------------------------
  // Events

  // -------------------------------------------------------------------------
  // Properties

  /**
   * Indicates if the report is displayed in anonymous mode
   * @property {boolean} anonymous
   */
  anonymous: false,

  /**
   * @prop { Collection } assessment - Assessment taken by a group of students
   */
  assessment: null,

  /**
   * @prop { boolean } isTableView - is the table view currently selected?
   */
  isTableView: true,

  /**
   * @property { ReportData } report data
   */
  reportData: null,

  /**
   * @prop { User[] } students - Group of students taking an assessment
   */
  students: null,

  /**
   * @prop { boolean } isRealTime - if the report is a real time report
   */
  isRealTime: false,

  /**
   * @prop { boolean } isRealTime - if the report is a real time report
   */
  showAttempts: false
});
