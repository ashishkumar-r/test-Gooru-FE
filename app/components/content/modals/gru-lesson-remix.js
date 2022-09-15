import Ember from 'ember';
import RemixBaseModal from 'gooru-web/components/content/modals/gru-base-remix';

export default RemixBaseModal.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @property {Service} Lesson service API SDK
   */
  lessonService: Ember.inject.service('api-sdk/lesson'),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'modals', 'gru-lesson-remix'],

  // -------------------------------------------------------------------------
  // Actions

  copyContent: function(lesson) {
    return this.get('lessonService').copyLesson(
      this.get('courseId'),
      this.get('unitId'),
      lesson.get('id')
    );
  },

  updateContent: function(lesson) {
    return this.get('lessonService').updateLesson(
      this.get('courseId'),
      this.get('unitId'),
      lesson
    );
  },

  showSuccessNotification: function(lesson) {
    var component = this;
    var successMsg = component
      .get('i18n')
      .t('common.remix-lesson-success', { lessonTitle: lesson.get('title') });
    component.get('notifications').success(`${successMsg}`);
  },

  showFailureNotification: function() {
    const message = this.get('i18n').t('common.errors.lesson-not-copied')
      .string;
    this.get('notifications').error(message);
  },

  init: function() {
    this._super(...arguments);
    this.set('courseId', this.get('model.courseId'));
    this.set('unitId', this.get('model.unitId'));
  },

  courseId: null,

  unitId: null
});
