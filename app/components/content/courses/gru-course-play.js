import Ember from 'ember';
import ModalMixin from 'gooru-web/mixins/modal';
import TaxonomyTag from 'gooru-web/models/taxonomy/taxonomy-tag';

export default Ember.Component.extend(ModalMixin, {
  // -------------------------------------------------------------------------
  // Dependencies
  session: Ember.inject.service('session'),
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'courses', 'gru-course-play'],

  classNameBindings: ['view'],

  tagName: 'article',

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    view: function(viewName) {
      this.set('view', viewName);
    },

    remix: function() {
      if (this.get('session.isAnonymous')) {
        this.send('showModal', 'content.modals.gru-login-prompt');
      } else {
        var model = {
          content: this.get('course')
        };
        this.send('showModal', 'content.modals.gru-course-remix', model);
      }
    },

    /**
     * Sets the current course builder location
     * @param unitId
     * @param lessonId
     */
    setLocation: function(unitId, lessonId = undefined) {
      this.sendAction('onLocationChange', unitId, lessonId);
    },

    onCloseWindow() {
      window.close();
    },

    /**
     * Course button logic for send to previous page state
     */
    coursePlayBackButton: function() {
      let component = this;
      if (component.get('classId') && !component.get('isLibraryContent')) {
        component
          .get('router')
          .transitionTo('teacher.class.course-map', component.get('classId'));
      } else {
        component.get('router').transitionTo('library-search', {
          queryParams: {
            profileId: component.get('session.userId'),
            type: 'my-content'
          }
        });
      }
    }
  },

  // -------------------------------------------------------------------------
  // Events
  didRender() {
    var component = this;
    component.$('[data-toggle="tooltip"]').tooltip({ trigger: 'hover' });
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * Course model as instantiated by the route.
   * @property {Course}
   */
  course: null,

  /**
   * @property {Profile[]} remixedUsers
   */
  remixedUsers: null,

  /**
   * @property {Profile[]} createdUsers
   */
  createdUsers: null,

  /**
   * @property {TaxonomyTag[]} List of taxonomy tags
   */
  tags: Ember.computed('course.taxonomy.[]', function() {
    return TaxonomyTag.getTaxonomyTags(this.get('course.taxonomy'), false);
  }),

  /**
   * @property {Boolean} isOwner
   */
  isOwner: null,

  /**
   * @property {string} action name when the location is changed
   */
  onLocationChange: null,

  /**
   * @property {string} selected lesson id
   */
  selectedLessonId: null
});
