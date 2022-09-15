import Ember from 'ember';
import {
  alphabeticalStringSort,
  formatTime,
  getAnswerResultIcon,
  getScoreString,
  getReactionIcon
} from 'gooru-web/utils/utils';
import {
  averageReaction,
  correctPercentage,
  totalTimeSpent
} from 'gooru-web/utils/question-result';
import ConfigurationMixin from 'gooru-web/mixins/configuration';

/**
 * Class assessment table view
 *
 * Component responsible for filtering and transforming the class assessment data
 * into a format readily consumable by the gru-two-tier-header-table component.
 *
 * @module
 * @augments ember/Component
 */
export default Ember.Component.extend(ConfigurationMixin, {
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @requires service:i18n
   */
  i18n: Ember.inject.service(),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['reports', 'class-assessment', 'gru-table-view'],

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * @function actions:selectQuestion
     * @param {Number} questionId
     */
    selectQuestion: function(questionId) {
      this.get('onSelectQuestion')(questionId);
    },

    /**
     * @function actions:selectStudent
     * @param {string} studentId
     */
    selectStudent: function(studentId) {
      this.get('onSelectStudent')(studentId);
    }
  },

  // -------------------------------------------------------------------------
  // Events

  init: function() {
    this._super(...arguments);

    this.set('questionProperties', this.initQuestionProperties());
    this.set('studentsHeader', this.initStudentsHeader());
  },

  willDestroyElement: function() {
    this.set('questionProperties', null);
    this.set('studentsHeader', null);
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @prop { Collection } assessment
   */
  assessment: null,

  /**
   * @prop { Object[] } assessmentQuestions - An array made up of all the questions in the assessment
   *
   * Each question object will consist of:
   * - label: visual representation of the header
   * - value: internal header identifier
   *
   * The questions will be ordered in the array in ascending order per the order value
   */
  assessmentQuestions: Ember.computed('assessment.resources.[]', function() {
    const labelPrefix = this.get('i18n').t(
      'reports.gru-table-view.first-tier-header-prefix'
    ).string;

    var questions = this.get('assessment.resources')
      .sortBy('order')
      .map(function(question, index) {
        return {
          value: question.get('id'),
          label: labelPrefix + (index + 1)
        };
      });

    // Add column used for showing totals at the beginning of the array
    questions.unshift({
      value: -1,
      label: this.get('i18n').t('reports.gru-table-view.totals').string
    });
    return questions;
  }),

  /**
   * @prop { String[] } assessmentQuestionsIds - An array with the ids of all the questions in the assessment
   */
  assessmentQuestionsIds: Ember.computed('assessmentQuestions.[]', function() {
    return this.get('assessmentQuestions').map(function(question) {
      return question.value;
    });
  }),

  /**
   * @prop { Object[] } questionProperties - An array made up of question properties
   *
   * Each property object will consist of:
   * - filter: information to use for the corresponding filter checkbox
   * - label: visual representation of the header
   * - value: internal header identifier
   * - visible: should the property be visible or not?
   * - renderFunction: function to process values of this property for output
   * - aggregateFunction: if there's an aggregate column, this function will be
   *   used to aggregate all the values for this property that are in the same row
   * - aggregateRenderFunction: if there's an aggregate column, this function will
   *   take the result of the aggregateFunction and process it for output
   * - sortFunction: sort function for values of this property
   */
  questionProperties: null,

  /**
   * @prop { String[] } questionPropertiesIds - An array with the ids of all the question properties
   */
  questionPropertiesIds: Ember.computed('questionProperties', function() {
    return this.get('questionProperties').map(function(questionProperty) {
      return questionProperty.value;
    });
  }),

  /**
   * @prop { ReportData } reportData - Unordered 3D matrix of data to use as content for the table component
   */
  reportData: null,

  /**
   * Indicates if the report is displayed in anonymous mode
   * @property {boolean} anonymous
   */
  anonymous: false,

  /**
   * @prop { User[] } students - Students taking the assessment
   */
  students: null,

  /**
   * @prop { String? } studentsHeader - Header for the students names
   */
  studentsHeader: null,

  /**
   * @prop { String[] } studentsIds - An array with the ids of all the students taking the assessment
   */
  studentsIds: Ember.computed('students.[]', function() {
    return this.get('students').map(function(student) {
      return student.id;
    });
  }),

  /**
   * @prop { Object[] } tableData - Ordered data to use as content for the table component
   * It merges the existing table frame with any updated table data.
   *
   * Each object in the array will consist of:
   * - id: row id
   * - header: row header
   * - content: an array of objects making up the row content where each object is made up of:
   *   - value: table cell un-formatted content
   *   - output: table cell content formatted for output (the formatting is done by
   *             the question property's render function)
   */
  tableData: Ember.computed(
    'anonymous',
    'tableFrame',
    'reportData.data',
    function() {
      const studentsIds = this.get('studentsIds');
      const studentsIdsLen = studentsIds.length;
      const questionsIds = this.get('assessmentQuestionsIds');
      const questionsIdsLen = questionsIds.length;
      const questionProperties = this.get('questionProperties');
      const questionPropertiesIds = this.get('questionPropertiesIds');
      const questionPropertiesIdsLen = questionPropertiesIds.length;
      const reportData = this.get('reportData.data');

      // Copy the table frame contents
      var data = this.get('tableFrame').slice(0);
      var totalIndex, propertyValues;

      // function start after the complete data recieved from previous component
      Ember.run.schedule('afterRender', this, function() {
        // Get the value of each question property, for each question, for each student
        for (let i = 0; i < studentsIdsLen; i++) {
          // Array for storing all values of the same question property
          propertyValues = [];

          for (let k = 0; k < questionPropertiesIdsLen; k++) {
            // Put all values for the same property into an array
            propertyValues[k] = [];
          }

          for (let j = 0; j < questionsIdsLen; j++) {
            const labelPrefix = this.get('i18n').t(
              'reports.gru-table-view.first-tier-header-prefix'
            ).string;

            if (questionsIds[j] === -1) {
              // Save this position to fill it in last (cells with propertyValues)
              totalIndex = j;
              continue;
            }
            for (let k = 0; k < questionPropertiesIdsLen; k++) {
              let renderFunction = questionProperties[k].renderFunction;
              let questionResult = reportData[studentsIds[i]][questionsIds[j]];
              let value = questionResult[questionPropertiesIds[k]];
              let label;

              //label used for the score tooltip
              if (k === 0) {
                label = labelPrefix + j;
              }

              data[i].content[j * questionPropertiesIdsLen + k] = {
                label: label,
                value: value,
                output: !renderFunction ? value : renderFunction(value)
              };

              propertyValues[k].push(questionResult);
            }
          }

          for (let k = 0; k < questionPropertiesIdsLen; k++) {
            // Set the value in the aggregate (totals) column;
            let value = questionProperties[k].aggregateFunction(
              propertyValues[k]
            );
            let aggregateRenderFunction =
              questionProperties[k].aggregateRenderFunction;

            // For displaying the aggregate value, use the question property's aggregateRenderFunction.
            // If there's no aggregateRenderFunction, use the property's renderFunction by default.
            data[i].content[totalIndex * questionPropertiesIdsLen + k] = {
              value: value,
              output: aggregateRenderFunction
                ? aggregateRenderFunction(value)
                : questionProperties[k].renderFunction(value)
            };
          }
          // Compute the aggregate values
        }
      });

      return data;
    }
  ),

  /**
   * @prop {Object[]} tableFrame - The table frame that encloses the table data
   * @return {Object[]}
   */
  tableFrame: Ember.computed('anonymous', 'students.[]', function() {
    let anonymous = this.get('anonymous');
    return this.get('students').map(function(student) {
      return {
        id: student.get('id'),
        header: anonymous ? student.get('code') : student.get('fullName'),
        lastFirstName: anonymous
          ? student.get('code')
          : student.get('lastFirstName'),
        content: []
      };
    });
  }),

  // -------------------------------------------------------------------------
  // Methods

  /**
   * Initialize the question properties array with values -including i18n labels
   * @return {Object[]}
   */
  initQuestionProperties: function() {
    return [
      Ember.Object.create({
        filter: {
          label: this.get('i18n').t('reports.gru-table-view.scores').string,
          disabled: true
        },
        label: this.get('i18n').t('reports.gru-table-view.score').string,
        value: 'correct',
        visible: true,
        renderFunction: getAnswerResultIcon,
        aggregateFunction: correctPercentage,
        aggregateRenderFunction: getScoreString
      }),
      Ember.Object.create({
        filter: {
          label: this.get('i18n').t('reports.gru-table-view.study-time').string
        },
        label: this.get('i18n').t('reports.gru-table-view.time').string,
        value: 'timeSpent',
        renderFunction: formatTime,
        aggregateFunction: totalTimeSpent
      }),
      Ember.Object.create({
        filter: {
          label: this.get('i18n').t('reports.gru-table-view.reactions').string
        },
        label: this.get('i18n').t('reports.gru-table-view.reaction').string,
        value: 'reaction',
        renderFunction: function(value) {
          return getReactionIcon(value);
        },
        aggregateFunction: averageReaction
      })
    ];
  },

  /**
   * Initialize the students header object with values including an i18n label
   * @return {Object[]}
   */
  initStudentsHeader: function() {
    return {
      label: this.get('i18n').t('reports.gru-table-view.student').string,
      value: 'fullName',
      sortFunction: alphabeticalStringSort
    };
  }
});
