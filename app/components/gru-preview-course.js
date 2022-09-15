import Ember from 'ember';
import SessionMixin from 'gooru-web/mixins/session';
import TaxonomyTag from 'gooru-web/models/taxonomy/taxonomy-tag';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';

export default Ember.Component.extend(SessionMixin, TenantSettingsMixin, {
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['gru-preview-course'],

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Action triggered to remix the course
     * @param content
     */
    remixCourse: function() {
      this.get('model').remixCourse();
    },

    /**
     * Action triggered to bookmark the course
     * @param content
     */
    bookmarkCourse: function() {
      this.get('model').bookmarkCourse();
    },

    /**
     * Action triggered to play the course
     * @param content
     */
    playCourse: function() {
      this.get('model').playCourse();
      this.triggerAction({ action: 'closeModal' });
    }
  },

  // -------------------------------------------------------------------------
  // Events

  init() {
    var component = this;
    component._super(...arguments);
    component.set('course', component.get('model.content'));
    component.set('isTeacher', component.get('model.isTeacher'));
    component.set('isStudent', component.get('model.isStudent'));
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Course} course
   */
  course: null,

  /**
   * @property {TaxonomyTag[]} List of taxonomy tags
   */
  tags: Ember.computed('course.taxonomy.[]', function() {
    return TaxonomyTag.getTaxonomyTags(this.get('course.taxonomy'));
  }),

  /**
   * Indicates if the teacher is seeing the course card
   * @property {boolean}
   */
  isTeacher: null,

  /**
   * Indicates if the student is seeing the course card
   * @property {boolean}
   */
  isStudent: null
});
