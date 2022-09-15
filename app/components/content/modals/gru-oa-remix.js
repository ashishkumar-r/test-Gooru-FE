import Ember from 'ember';
import RemixBaseModal from 'gooru-web/components/content/modals/gru-base-remix';

export default RemixBaseModal.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @property {Service} OfflineActivity service API SDK
   */
  oaService: Ember.inject.service('api-sdk/offline-activity/offline-activity'),

  /**
   * @property {Service} Lesson service API SDK
   */
  lessonService: Ember.inject.service('api-sdk/lesson'),
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'modals', 'gru-oa-remix'],

  // -------------------------------------------------------------------------
  // Actions

  copyContent: function(offlineActivity) {
    this.set('isLoading', true);
    return this.get('oaService').copyActivity(offlineActivity.get('id'));
  },

  updateContent: function(offlineActivity) {
    const component = this;
    return component
      .get('oaService')
      .updateActivityTitle(
        offlineActivity.get('id'),
        offlineActivity.get('title')
      )
      .then(function() {
        let courseId = component.get('courseId');
        let unitId = component.get('unitId');
        let lessonId = component.get('lessonId');
        let oaId = component.get('contentModel.id');
        let isCollection = component.get('isCollection');
        let oaType = 'offline-activity';
        return lessonId && component.get('contentModel.format') !== oaType
          ? component
            .get('lessonService')
            .associateAssessmentOrCollectionToLesson(
              courseId,
              unitId,
              lessonId,
              oaId,
              isCollection,
              oaType
            )
          : Ember.RSVP.resolve({});
      });
  },

  showSuccessNotification: function(offlineActivity) {
    const component = this;
    const successMsg = component.get('i18n').t('oa.remix.success', {
      oaTitle: offlineActivity.get('title')
    });
    const oaEditUrl = component
      .get('router')
      .generate('content.activity.edit', offlineActivity.get('id'));
    let edit = component.get('i18n').t('common.edit');
    component
      .get('notifications')
      .success(
        `${successMsg} <a class="btn btn-success" href="${oaEditUrl}">${edit}</a>`
      );
  },

  showFailureNotification: function() {
    const message = this.get('i18n').t('errors.oa-not-copied').string;
    this.get('notifications').error(message);
  },

  init: function() {
    this._super(...arguments);
    this.set('courseId', this.get('model.courseId'));
    this.set('unitId', this.get('model.unitId'));
    this.set('lessonId', this.get('model.lessonId'));
    this.set('isCollection', this.get('model.isCollection'));
  },

  /**
   * Disable remix button once user clicked it
   */
  isLoading: false
});
