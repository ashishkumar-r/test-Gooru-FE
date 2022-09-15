import Ember from 'ember';
import ModalMixin from 'gooru-web/mixins/modal';

/**
 * teacher featured courses component
 *
 *
 * @module
 * @augments ember/Component
 */
export default Ember.Component.extend(ModalMixin, {
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @requires service:notifications
   */
  notifications: Ember.inject.service(),

  /**
   * @property {Service} I18N service
   */
  i18n: Ember.inject.service(),

  // -------------------------------------------------------------------------
  // Attributes

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * Action triggered to preview the course
     * @param course
     */
    previewCourse: function(course) {
      let component = this;
      let isTeacher = this.get('isTeacher');
      this.set('course', course);
      var model = Ember.Object.create({
        content: course,
        isTeacher
      });

      model.set('remixCourse', () => component.remixCourse());
      model.set('playCourse', () => component.playCourse());
      model.set('bookmarkCourse', () => component.bookmarkCourse());
      component.send('showModal', 'gru-preview-course', model);
    }
  },

  /**
   *Action triggered when select remix the course
   */
  remixCourse: function() {
    if (this.get('session.isAnonymous')) {
      this.send('showModal', 'content.modals.gru-login-prompt');
    } else {
      var remixModel = {
        content: this.get('course')
      };
      this.send('showModal', 'content.modals.gru-course-remix', remixModel);
    }
  },

  // -------------------------------------------------------------------------
  // Properties
  /**
   * @property {Array[]} - courses
   */
  courses: null,

  /**
   * @property {Profile} user profile
   */
  profile: null
});
