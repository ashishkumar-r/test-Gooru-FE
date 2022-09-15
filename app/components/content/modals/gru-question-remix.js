import Ember from 'ember';
import RemixBaseModal from 'gooru-web/components/content/modals/gru-base-remix';

export default RemixBaseModal.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @property {Service} Assessment service API SDK
   */
  assessmentService: Ember.inject.service('api-sdk/assessment'),

  /**
   * @property {Service} Collection service API SDK
   */
  collectionService: Ember.inject.service('api-sdk/collection'),

  /**
   * @property {Service} Question service API SDK
   */
  questionService: Ember.inject.service('api-sdk/question'),

  fluencyService: Ember.inject.service('api-sdk/fluency'),

  tenantService: Ember.inject.service('api-sdk/tenant'),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'modals', 'gru-question-remix'],

  isShowFluencyLevel: Ember.computed(function() {
    let tenantSettings = JSON.parse(
      this.get('tenantService').getStoredTenantSetting()
    );
    return tenantSettings && tenantSettings.fluency_level === 'on';
  }),
  // -------------------------------------------------------------------------
  // Actions

  copyContent: function(question) {
    return this.get('questionService').copyQuestion(question.get('id'));
  },

  updateContent: function(question) {
    const component = this;
    return component
      .get('questionService')
      .updateQuestionTitle(question.get('id'), question.get('title'))
      .then(function() {
        let collectionId = component.get('collectionId');
        const format = component.get('isCollection')
          ? 'collections'
          : 'assessments';
        if (
          component.get('model').collection.metadata &&
          component.get('model').collection.metadata.fluency &&
          component.get('isShowFluencyLevel')
        ) {
          const fluData = Ember.Object.create({});
          fluData.fluency = component.get('model').collection.metadata.fluency;
          component
            .get('fluencyService')
            .updateFluencyLevel(fluData, format, collectionId);
        }
        let parentService = component.get('isCollection')
          ? component.get('collectionService')
          : component.get('assessmentService');
        return collectionId
          ? parentService.addQuestion(collectionId, question.get('id'))
          : Ember.RSVP.resolve();
      });
  },

  showSuccessNotification: function(question) {
    var component = this;
    var successMsg = component.get('i18n').t('common.remix-question-success', {
      questionTitle: question.get('title')
    });
    var questionEditUrl = component
      .get('router')
      .generate('content.questions.edit', question.get('id'));
    var edit = component.get('i18n').t('common.edit');
    component
      .get('notifications')
      .success(
        `${successMsg} <a class="btn btn-success" href="${questionEditUrl}">${edit}</a>`
      );
  },

  showFailureNotification: function() {
    const message = this.get('i18n').t('common.errors.question-not-copied')
      .string;
    this.get('notifications').error(message);
  },

  init: function() {
    this._super(...arguments);
    this.set('collectionId', this.get('model.collectionId'));
    this.set('isCollection', this.get('model.isCollection'));
  },

  collectionId: null,

  isCollection: null
});
