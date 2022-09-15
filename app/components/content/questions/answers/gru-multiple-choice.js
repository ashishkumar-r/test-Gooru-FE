import Ember from 'ember';
import Answer from 'gooru-web/models/content/answer';
import { getSubjectId } from 'gooru-web/utils/taxonomy';
import { SUBJECT_CODE } from 'gooru-web/config/config';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'questions', 'answers', 'gru-multiple-choice'],

  strugglingCompetencyService: Ember.inject.service(
    'api-sdk/struggling-competency'
  ),

  /**
   * @requires service:api-sdk/question
   */
  questionService: Ember.inject.service('api-sdk/question'),

  /**
   * @property {Service} tenant service
   */
  tenantService: Ember.inject.service('api-sdk/tenant'),

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    //Add new answer choice
    addNewChoice: function() {
      var newChoice = Answer.create(Ember.getOwner(this).ownerInjection(), {
        text: null,
        isCorrect: false,
        type: 'text'
      });
      this.get('answers').pushObject(newChoice);
    },
    onstruggleView(answer = null) {
      let component = this;
      if (answer) {
        this.set('answerText', answer);
      }
      const tempModel = this.get('tempModel') || [];
      if (
        !tempModel.standard &&
        !tempModel.standards.length &&
        !component.get('isQuestion')
      ) {
        tempModel.set('standards', this.get('collection.standards'));
      }
      let standard = tempModel.get('standards');
      let subjectCode = standard.length
        ? getSubjectId(this.get('tempModel.standards.firstObject').id)
        : null;
      if (subjectCode) {
        subjectCode = subjectCode.split('.');
        subjectCode.shift();
        subjectCode = subjectCode.join('.');
      }
      let param = {
        data: {}
      };
      let compCodes = standard.map(item => {
        let fmComp = item.id.split('.');
        fmComp.shift();
        return fmComp.join('.');
      });
      let param1 = {
        data: {
          compCodes
        }
      };

      if (subjectCode) {
        Ember.RSVP.hash({
          studentStruggle: component
            .get('strugglingCompetencyService')
            .fetchAnswerStuggling(param1, subjectCode),
          allStruggle: component
            .get('strugglingCompetencyService')
            .fetchAnswerStuggling(param, subjectCode)
        }).then(({ studentStruggle, allStruggle }) => {
          component.set('studentStruggle', studentStruggle);
          component.set('totalStruggle', allStruggle);
          component.set('struggleFrame', true);
        });
      } else {
        this.set('struggleFrame', true);
      }
    },

    onStruggleConfirm() {
      this.set('tempModel.standards', this.get('collection.standards'));
      this.send('onstruggleView', this.get('answerText'));
    },

    onSelectedStruggle(studentStruggle, newStruggleLists) {
      this.set('selectedStruggle', newStruggleLists);
      let struggleList = this.get('answerText.struggles')
        ? this.get('answerText.struggles')
        : Ember.A();
      struggleList = struggleList.concat(studentStruggle);
      this.set('answerText.struggles', struggleList.uniqBy('struggleCode'));
    },

    onRemoveStruggle(answer, struggle) {
      answer.set(
        'struggles',
        answer.struggles.filter(
          item => item.struggleCode !== struggle.struggleCode
        )
      );
    },

    //Remove existing answer
    removeChoice: function(answer) {
      this.get('answers').removeObject(answer);
    },
    //Select correct answer
    setCorrect: function(answer) {
      var correctAnswer = this.get('answers').findBy('isCorrect', true);
      if (correctAnswer) {
        Ember.set(correctAnswer, 'isCorrect', false);
      }
      Ember.set(answer, 'isCorrect', true);
    }
  },
  // -------------------------------------------------------------------------
  // Events

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {boolean} struggleFrame
   */
  struggleFrame: false,

  /**
   * Multiple Cservice:api-sdk/questionhoice Question Answers
   * */

  answers: null,
  /**
   * Multiple Choice max answers
   * */
  maxAnswers: 10,

  answerText: null,

  tempModel: null,

  // isShowAll: null,

  totalStruggle: [],

  /**
   * Is in edit mode
   */
  editMode: false,

  studentStruggle: [],

  standards: [],

  disableCorrect: false,

  isShowTagStuggle: Ember.computed(function() {
    let tenantSettings = JSON.parse(
      this.get('tenantService').getStoredTenantSetting()
    );
    let standard = this.get('tempModel.standards');
    let subjectCode =
      standard && standard.length
        ? getSubjectId(standard.get('firstObject').id)
        : null;
    if (subjectCode) {
      subjectCode = subjectCode.split('.');
      subjectCode.shift();
      subjectCode = subjectCode.join('.');
    }
    return (
      (tenantSettings &&
        tenantSettings.struggle_applicable_subjects &&
        tenantSettings.struggle_applicable_subjects.indexOf(subjectCode) !==
          -1) ||
      SUBJECT_CODE === subjectCode
    );
  }),
  /**
   * @property {Number} number of items loaded, used to load more
   */

  /**
   * @property {boolean}
   */
  disableEditorButtons: Ember.computed.not('showAdvancedEditor'),

  /**
   * @type {Ember.A}
   */
  hasLimitAnswers: Ember.computed('answers.[]', function() {
    return this.get('answers').length >= this.get('maxAnswers');
  }),

  selectedStruggle: Ember.A(),
  /**
   * @function fetchAnswerStuggling
   * Method to fetach struggling competency
   */

  fetchAnswerStuggling(params, subjectCode, isLoadMore = false) {
    let component = this;
    component
      .get('strugglingCompetencyService')
      .fetchAnswerStuggling(params, subjectCode)
      .then(data => {
        if (isLoadMore) {
          component.set(
            'studentStruggle',
            component.get('studentStruggle').concat(data)
          );
          return;
        }
        this.set('struggleFrame', true);
        component.set('studentStruggle', data);
      });
  }
});
