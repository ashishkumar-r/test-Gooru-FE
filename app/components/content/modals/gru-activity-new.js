import Ember from 'ember';
import NewCollectionModal from 'gooru-web/components/content/modals/gru-collection-new';
import Activity from 'gooru-web/models/content/activity';

export default NewCollectionModal.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @property {activityService} Activity service API SDK
   */
  activityService: Ember.inject.service(
    'api-sdk/offline-activity/offline-activity'
  ),

  /**
   * @property {Service} I18N service
   */
  i18n: Ember.inject.service(),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'modals', 'gru-activity-new'],

  // -------------------------------------------------------------------------
  // Actions

  validate: function() {
    const activity = this.get('activity');
    return activity.validate();
  },

  createAssessmentOrCollection: function() {
    return this.get('activityService').createActivity(this.get('activity'));
  },

  associateToLesson: function(courseId, unitId, lessonId, activityId) {
    return this.get('lessonService').associateActivityToLesson(
      courseId,
      unitId,
      lessonId,
      activityId,
      false
    );
  },

  closeModal: function(activityId) {
    this.set('isLoading', false);
    this.triggerAction({ action: 'closeModal' });
    const queryParams = { queryParams: { editing: true } };
    this.get('router').transitionTo(
      'content.activity.edit',
      activityId,
      queryParams
    );
  },

  showErrorMessage: function(error) {
    Ember.Logger.error(error);
    const message = this.get('i18n').t('common.errors.activity-not-created')
      .string;
    this.get('notifications').error(message);
  },

  // -------------------------------------------------------------------------
  // Events

  init() {
    this._super(...arguments);
    var activity = Activity.create(Ember.getOwner(this).ownerInjection(), {
      title: null,
      classroom_play_enabled: false
    });
    this.set('activity', activity);
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @type {Activity} activity
   */
  activity: null
});
