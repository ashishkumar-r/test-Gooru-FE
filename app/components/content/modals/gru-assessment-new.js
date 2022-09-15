import Ember from 'ember';
import NewCollectionModal from 'gooru-web/components/content/modals/gru-collection-new';
import Assessment from 'gooru-web/models/content/assessment';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default NewCollectionModal.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @property {AssessmentService} Assessment service API SDK
   */
  assessmentService: Ember.inject.service('api-sdk/assessment'),

  /**
   * @property {Service} I18N service
   */
  i18n: Ember.inject.service(),

  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'modals', 'gru-assessment-new'],

  // -------------------------------------------------------------------------
  // Actions

  validate: function() {
    const assessment = this.get('assessment');
    return assessment.validate();
  },

  createAssessmentOrCollection: function() {
    this.get('parseEventService').postParseEvent(
      PARSE_EVENTS.CLICK_CREATE_ASSESSMENT
    );
    return this.get('assessmentService').createAssessment(
      this.get('assessment')
    );
  },

  associateToLesson: function(
    courseId,
    unitId,
    lessonId,
    assessmentOrCollectionId
  ) {
    return this.get('lessonService').associateAssessmentOrCollectionToLesson(
      courseId,
      unitId,
      lessonId,
      assessmentOrCollectionId,
      false
    );
  },

  closeModal: function(assessmentId) {
    this.set('isLoading', false);
    this.triggerAction({ action: 'closeModal' });
    const queryParams = { queryParams: { editing: true } };
    this.get('router').transitionTo(
      'content.assessments.edit',
      assessmentId,
      queryParams
    );
  },

  showErrorMessage: function(error) {
    Ember.Logger.error(error);
    const message = this.get('i18n').t('common.errors.assessment-not-created')
      .string;
    this.get('notifications').error(message);
  },

  // -------------------------------------------------------------------------
  // Events

  init() {
    this._super(...arguments);
    var assessment = Assessment.create(Ember.getOwner(this).ownerInjection(), {
      title: null,
      classroom_play_enabled: false
    });
    this.set('assessment', assessment);
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @type {Assessment} assessment
   */
  assessment: null
});
