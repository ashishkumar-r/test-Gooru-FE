import Ember from 'ember';
import Question from 'gooru-web/models/content/question';
import Collection from 'gooru-web/models/content/collection';
import { QUESTION_CONFIG, QUESTION_TYPES } from 'gooru-web/config/question';
import {
  SERP_PREFIX,
  SCIENTIFIC_TYPES,
  H5P_TOOL_QUESTION_TYPES
} from 'gooru-web/config/config';
import ScientificFillInTheBlank from 'gooru-web/utils/question/scientific-fill-in-the-blank';
import { etlSecCalculation } from 'gooru-web/utils/utils';
import Answer from 'gooru-web/models/content/answer';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend(ConfigurationMixin, {
  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @property {QuestionService} Question service API SDK
   */
  questionService: Ember.inject.service('api-sdk/question'),

  /**
   * @property {CollectionService} Collection service API SDK
   */
  collectionService: Ember.inject.service('api-sdk/collection'),

  /**
   * @property {AssessmentService} Assessment service API SDK
   */
  assessmentService: Ember.inject.service('api-sdk/assessment'),

  /**
   * @property {Service} I18N service
   */
  i18n: Ember.inject.service(),

  /**
   * Maintains the session object.
   */
  session: Ember.inject.service('session'),

  /**
   * @property {Service} Notifications service
   */
  notifications: Ember.inject.service(),

  /**
   * @property {Service} tenant service
   */
  tenantService: Ember.inject.service('api-sdk/tenant'),

  fluencyService: Ember.inject.service('api-sdk/fluency'),

  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  showSERP: false,

  showBackBtn: false,

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'modals', 'gru-question-new'],

  classNameBindings: ['component-class', 'contentURL:h5p-container'],

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    goBack() {
      this.set('showBackBtn', false);
      this.set('questionTypes', this.getQuestionTypeForSerp(false));
    },

    createQuestion: function() {
      const component = this;
      const question = component.get('question');
      const isComprehension = component.get('isComprehension');
      if (question.type === 'SERP_RQ' || question.type === 'SERP_IB') {
        this.createReadingQuestion();
        return;
      }
      if (question.type === 'SE_FRQ' || question.type === 'SE_FIB') {
        let array = Ember.A(Object.values(SCIENTIFIC_TYPES));
        let hintList = Ember.A([]);
        if (question.type === 'SE_FIB') {
          let answerDetails = array.map(function(choice) {
            let data = Ember.Object.create({
              answer_text: '',
              answer_type: 'text',
              correct_answer: '',
              answer_category: choice
            });
            return data;
          });
          let parsedAnswers = ScientificFillInTheBlank.getQuestionAnswers(
            answerDetails
          );
          parsedAnswers = parsedAnswers.map(parseAnswer => {
            return Answer.create(
              Ember.getOwner(this).ownerInjection(),
              parseAnswer
            );
          });
          question.set('answers', parsedAnswers);
        } else {
          let answerDetails = array.map(function(choice) {
            let data = Ember.Object.create({
              answer_type: 'text',
              answer_category: choice
            });
            return data;
          });
          let answerData = answerDetails.map(function(data) {
            let values = Ember.Object.create({
              answer_category: data.answer_category,
              answer_type: data.answer_type,
              sequence: 0
            });
            return values;
          });
          question.set('answers', answerData);
        }
        array.map(function(choice) {
          let data = Ember.Object.create({
            answer_category: choice,
            hints: ''
          });
          hintList.pushObject(data);
        });
        question.set('hints', hintList);
      }
      question.set(
        'title',
        component.get('i18n').t('common.new-question').string
      ); //Default title

      if (question.get('text')) {
        question.set('description', question.get('text')); //Default description
      }
      const etlHrs = question.get('questionHrs');
      const etlMins = question.get('questionMins');
      etlSecCalculation(question, etlHrs, etlMins);
      //TODO temporal fix
      question.validate().then(function({ validations }) {
        if (validations.get('isValid')) {
          component.set('isLoading', true);
          let questionId;
          component
            .get('questionService')
            .createQuestion(question)
            .then(function(newQuestion) {
              if (
                component.get('model.metadata') &&
                component.get('model.metadata.fluency') &&
                component.get('isShowFluencyLevel')
              ) {
                const format =
                  component.get('model') instanceof Collection
                    ? 'collections'
                    : 'assessments';
                const fluData = Ember.Object.create({});
                fluData.fluency = component.get('model.metadata.fluency');
                component
                  .get('fluencyService')
                  .updateFluencyLevel(
                    fluData,
                    format,
                    component.get('model.id')
                  );
              }
              questionId = newQuestion.get('id');
              if (component.get('model')) {
                let service =
                  component.get('model') instanceof Collection
                    ? component.get('collectionService')
                    : component.get('assessmentService');
                service = isComprehension
                  ? component.get('questionService')
                  : service;
                return service.addQuestion(
                  component.get('model').get('id'),
                  questionId
                );
              } else {
                return Ember.RSVP.resolve(true);
              }
            })
            .then(
              function() {
                component.closeModal(questionId);
              },
              function() {
                component.set('isLoading', false);
                const message = component
                  .get('i18n')
                  .t('common.errors.question-not-created').string;
                component.get('notifications').error(message);
              }
            );
        }
        component
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.CLICK_CREATE_QUESTION);
        component.set('didValidate', true);
      });
    },

    selectType: function(type) {
      this.set('selectedType', type);
      this.set('question.type', this.get('selectedType'));
      if (type === SERP_PREFIX) {
        this.set('showBackBtn', true);
        this.set(
          'questionTypes',
          Ember.computed(function() {
            var question = Question.create(
              Ember.getOwner(this).ownerInjection(),
              {
                title: null,
                type: QUESTION_TYPES.encodingAssessment
              }
            );
            this.set('question', question);
            this.set('selectedType', QUESTION_TYPES.encodingAssessment);
            return this.getQuestionTypeForSerp(true);
          })
        );
      }
    },

    h5pContent: function() {
      this.set('isH5PContent', true);
    },

    generateContentURL: function(contentType, format) {
      let accessToken = this.get('accessToken');
      let contentURL = `${window.location.protocol}//${window.location.host}/tools/h5p/new?accessToken=${accessToken}&contentType=${contentType}&format=${format}`;
      this.set('contentURL', contentURL);
      this.set('isLoading', true);
    }
  },
  getQuestionTypeForSerp(value) {
    var values = [];
    let tenantSettings = JSON.parse(
      this.get('tenantService').getStoredTenantSetting()
    );
    let visibilityContentTypes =
      tenantSettings &&
      tenantSettings.ui_element_visibility_settings &&
      tenantSettings.ui_element_visibility_settings.visibility_content_types
        ? tenantSettings.ui_element_visibility_settings.visibility_content_types
        : this.get('visibilityContentTypes');
    for (var property in QUESTION_CONFIG) {
      if (QUESTION_CONFIG.hasOwnProperty(property)) {
        if (
          QUESTION_CONFIG[property].serpType === value &&
          !QUESTION_CONFIG[property].isHiddenType &&
          (!QUESTION_CONFIG[property].isComprehensionType ||
            this.get('isComprehension')) &&
          (!QUESTION_CONFIG[property].hiddenComprehension ||
            !this.get('isComprehension'))
        ) {
          const question = {
            name: property,
            isShow: value
              ? visibilityContentTypes.learning_skills[
                QUESTION_CONFIG[property].apiType
              ]
              : visibilityContentTypes.other_questions[
                QUESTION_CONFIG[property].apiType
              ]
          };
          if (property === 'SERP_RQ' && value) {
            question.isShow =
              visibilityContentTypes.learning_skills.serp_reading_passage;
          }
          values.push(question);
        }
      }
    }
    if (!value && this.showSERP) {
      const isShowValue = Object.values(
        visibilityContentTypes.learning_skills
      ).includes(true);
      values.push({ name: SERP_PREFIX, isShow: isShowValue });
    }
    return values;
  },
  // -------------------------------------------------------------------------
  // Events

  init() {
    this._super(...arguments);
    var question = Question.create(Ember.getOwner(this).ownerInjection(), {
      title: null,
      type: QUESTION_TYPES.multipleChoice
    });
    this.set('question', question);
  },

  didInsertElement() {
    var component = this;
    if (component && component.$() && component.$().length) {
      setTimeout(function() {
        if (component && component.$() && component.$().length) {
          component
            .$()
            .attr('tabindex', 0)
            .focus();
        }
      }, 400);
      component
        .$()
        .off('keyup')
        .on('keyup', function() {
          var keyCode = event.keyCode ? event.keyCode : event.which;
          if (keyCode === 13) {
            component.$('button[type=submit]').trigger('click');
          }
        });
    }
    component.getTenantSetting();
  },

  getTenantSetting() {
    var component = this;
    component
      .get('tenantService')
      .getActiveTenantSetting()
      .then(function(tenantSettings) {
        if (
          tenantSettings.hasOwnProperty('enable_serp_questions') &&
          tenantSettings.enable_serp_questions === 'on'
        ) {
          component.set('showSERP', true);
        }
      });
  },

  didReceiveAttrs() {
    const component = this;
    const isComprehension = component.get('isComprehension');
    /**
     * method used to listen the events from iframe.
     **/
    function receiveMessage(event) {
      if (event.data === 'loading_completed') {
        if (!component.get('isDestroyed')) {
          component.set('isLoading', false);
        }
      } else if (
        event.data.message === 'cancel_event' ||
        event.data.message === 'submit_event'
      ) {
        if (event.data.message === 'submit_event') {
          if (!component.get('isDestroyed')) {
            if (component.get('model')) {
              let questionId = event.data.clonedEvent.content.contentId;
              let service =
                component.get('model') instanceof Collection
                  ? component.get('collectionService')
                  : component.get('assessmentService');
              service = isComprehension
                ? component.get('questionService')
                : service;
              component.triggerAction({ action: 'closeModal' });
              component.get('router').router.refresh();
              return service.addQuestion(
                component.get('model').get('id'),
                questionId
              );
            } else {
              component.get('router').router.refresh();
            }
          }
        }
        component.triggerAction({
          action: 'closeModal'
        });
      }
    }

    window.addEventListener('message', receiveMessage, false);
  },

  // -------------------------------------------------------------------------
  // Properties
  /**
   * @type {?String} specific class
   */
  'component-class': null,

  /**
   * @type {Question} question
   */
  question: null,

  isComprehension: Ember.computed('model', function() {
    return !!this.get('model.isComprehension');
  }),

  /**
   * @type {String} selectedType
   */
  selectedType: Ember.computed('question.type', function() {
    return this.get('question.type');
  }),

  /**
   * @type {Array[]} questionTypes
   */
  questionTypes: Ember.computed('showSERP', function() {
    return this.getQuestionTypeForSerp(false);
  }),

  /**
   * @property {boolean} isSerp help to identify serp question types
   */
  isSerp: Ember.computed('question.type', function() {
    return this.get('question.type').includes('SERP');
  }),

  isShowFluencyLevel: Ember.computed(function() {
    let tenantSettings = JSON.parse(
      this.get('tenantService').getStoredTenantSetting()
    );
    return tenantSettings && tenantSettings.fluency_level === 'on';
  }),

  /**
   * Indicate if it's waiting for createQuestion callback
   */
  isLoading: false,

  /**
   * Indicate if it's H5p tool content
   */
  isH5PContent: false,

  /**
   * @property {String}
   */
  accessToken: Ember.computed.alias('session.token-api3'),

  visibilityContentTypes: Ember.computed.alias(
    'configuration.visibility_content_types'
  ),

  h5pContentTypes: Ember.computed(function() {
    let tenantSettings = JSON.parse(
      this.get('tenantService').getStoredTenantSetting()
    );
    const visibilityContentTypes =
      tenantSettings &&
      tenantSettings.ui_element_visibility_settings &&
      tenantSettings.ui_element_visibility_settings.visibility_content_types
        ? tenantSettings.ui_element_visibility_settings.visibility_content_types
        : this.get('visibilityContentTypes');
    H5P_TOOL_QUESTION_TYPES.map(function(h5p) {
      h5p.isShow = visibilityContentTypes.interactive_resources[h5p.id];
    });
    return H5P_TOOL_QUESTION_TYPES;
  }),

  contentURL: null,

  //Methods
  closeModal: function(questionId) {
    const component = this;
    component.set('isLoading', false);
    component.triggerAction({ action: 'closeModal' });
    let isComprehension = component.get('isComprehension');

    let collectionId = component.get('model.id');
    let isCollection = component.get('model.isCollection');
    let baseResource = component.get('model.baseResource');
    let subQuestionId = baseResource ? questionId : null;

    if (baseResource) {
      questionId = collectionId;
      collectionId = baseResource.get('id');
      isCollection = baseResource.get('isCollection');
    }

    if ((collectionId && !isComprehension) || baseResource) {
      const queryParams = { queryParams: { editingContent: questionId } };
      if (subQuestionId) {
        queryParams.queryParams.editingSubContent = subQuestionId;
      }
      if (isCollection) {
        component
          .get('router')
          .transitionTo('content.collections.edit', collectionId, queryParams);
      } else {
        component
          .get('router')
          .transitionTo('content.assessments.edit', collectionId, queryParams);
      }
    } else {
      const queryParams = {
        queryParams: { editing: true }
      };

      if (subQuestionId || isComprehension) {
        queryParams.queryParams.editingContent = questionId;
      }

      component
        .get('router')
        .transitionTo(
          'content.questions.edit',
          isComprehension ? collectionId : questionId,
          queryParams
        );
    }
  },

  createReadingQuestion() {
    let component = this;
    let collectionId = component.get('model.id');
    let isCollection = component.get('model.isCollection');
    const isComprehension = component.get('isComprehension');
    const compQuestionId = isComprehension ? collectionId : null;
    const baseResource = component.get('model.baseResource');
    if (baseResource) {
      collectionId = baseResource.get('id');
      isCollection = baseResource.get('isCollection');
    }
    component.set('isLoading', false);
    let question = component.get('question');
    component.triggerAction({ action: 'closeModal' });
    let queryParams = { queryParams: { questionType: question.get('type') } };
    if ((!isComprehension && collectionId) || baseResource) {
      queryParams = {
        queryParams: {
          collectionId: collectionId,
          questionType: question.get('type')
        }
      };
      queryParams.queryParams.isCollection = isCollection;
    }
    if (compQuestionId) {
      queryParams.queryParams.compQuestionId = compQuestionId;
    }
    component
      .get('router')
      .transitionTo('content.questions.create', queryParams);
  },

  /*
   * Move array object into array
   * */
  move(arr, fromIndex, toIndex) {
    var element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
  }
});
