import Ember from 'ember';
import RemixBaseModal from 'gooru-web/components/content/modals/gru-base-remix';

export default RemixBaseModal.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @property {Service} User service API SDK
   */
  courseService: Ember.inject.service('api-sdk/course'),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'modals', 'gru-course-remix'],

  // -------------------------------------------------------------------------
  // Actions

  copyContent: function(course) {
    return this.get('courseService').copyCourse(course.get('id'));
  },

  updateContent: function(course) {
    return this.get('courseService').updateCourseTitle(
      course.get('id'),
      course.get('title')
    );
  },

  showSuccessNotification: function(course) {
    var component = this;
    var successMsg = component
      .get('i18n')
      .t('common.remix-course-success', { courseTitle: course.get('title') });
    var courseEditUrl = component
      .get('router')
      .generate('content.courses.edit', course.get('id'));
    var edit = component.get('i18n').t('common.edit');
    component
      .get('notifications')
      .success(
        `${successMsg} <a class="btn btn-success" href="${courseEditUrl}">${edit}</a>`
      );
  },

  showFailureNotification: function() {
    const message = this.get('i18n').t('common.errors.course-not-copied')
      .string;
    this.get('notifications').error(message);
  },

  // -------------------------------------------------------------------------
  // Methods
  /**
   * Overwrite beforeCopy
   */
  beforeCopy: function() {
    const component = this;
    component.closeModal();
  },
  /**
   * Overwrite afterCopy
   */
  afterCopy: function(contentModel) {
    const component = this;
    component.notifyCopy(contentModel);
  }
});
