import Ember from 'ember';
import ModalMixin from 'gooru-web/mixins/modal';
import TaxonomyTag from 'gooru-web/models/taxonomy/taxonomy-tag';

/**
 * Course card
 *
 * Component responsible of showing the course information in cards, so that most useful information is summarized there.
 * @module
 * @see controllers/profile/about.js
 */
export default Ember.Component.extend(ModalMixin, {
  // -------------------------------------------------------------------------
  // Dependencies
  session: Ember.inject.service('session'),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['cards', 'gru-course-card'],

  classNameBindings: ['isSmall:small'],

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     *Action triggered when select edit the course
     */
    editCourse: function() {
      this.sendAction('onEditCourse', this.get('course'));
    },

    /**
     *Action triggered when select play the course
     */
    playCourse: function() {
      this.playCourse();
    },

    /**
     *Action triggered when select remix the course
     */
    remixCourse: function() {
      if (this.get('session.isAnonymous')) {
        this.send('showModal', 'content.modals.gru-login-prompt');
      } else {
        this.sendAction('onRemixCourse', this.get('course'));
      }
    },

    /**
     * Action triggered to preview the course
     * @param course
     */
    previewCourse: function(course) {
      let component = this;
      let isTeacher = this.get('isTeacher');

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
  // -------------------------------------------------------------------------
  // Properties
  /**
   * @property {Course} course
   */
  course: null,

  /**
   * Bookmark course action
   * @property {string}
   */
  onBookmarkCourse: null,

  /**
   * Edit course action
   * @property {string}
   */
  onEditCourse: null,

  /**
   * Remix course action
   * @property {string}
   */
  onRemixCourse: null,

  /**
   * default tagsVisible
   * @property {number}
   */
  tagsVisible: 2,

  /**
   * flag that tells if you are owner of card or not.
   * @property {Boolean}
   */
  isOwner: false,
  /**
   * Edit enabled is a flag for whether the edit button is enabled or not.
   * @property {Boolean}
   */
  isEditEnabled: false,
  /**
   * Edit enabled is a flag for whether the remix button is enabled or not.
   * @property {Boolean} course
   */
  isRemixEnabled: true,
  /**
   * Edit enabled is a flag for whether the preview button is enabled or not.
   * @property {Boolean} course
   */
  isPreviewEnabled: false,

  /**
   * Show if the visibility icon is visible or not.
   * @property {Boolean}
   */
  isEyeVisible: true,

  /**
   * Indicates if it is a small card
   * @property {boolean}
   */
  isSmall: false,

  /**
   * Indicates if it is from student/teacher landing page
   * @property {boolean}
   */
  isFromLandingPage: false,

  /**
   * Show if the taxonomy tags are visible or not.
   * @property {Boolean}
   */
  showTaxonomy: true,

  /**
   * @property {Array} users
   */
  users: Ember.computed('course', function() {
    return this.get('course.remixedBy');
  }),
  /**
   * @property {String} subjects
   */
  subjects: Ember.computed('course', function() {
    // TODO Verify if this method is required
    /*
    var subjectsList = this.get("course.subjects");
    var subjects = "";
    subjectsList.forEach(function(object){
      subjects+=" "+object+" |";
    });
    return subjects.substr(0, subjects.length-1);
    */
    return '';
  }),

  /**
   * @property {TaxonomyTag[]} List of taxonomy tags
   */
  tags: Ember.computed('course.taxonomy.[]', function() {
    return TaxonomyTag.getTaxonomyTags(this.get('course.taxonomy'));
  }),

  /**
   * Indicates if the teacher is seeing the card
   * @property {boolean}
   */
  isTeacher: Ember.computed.equal('profile.role', 'teacher'),

  /**
   * @property {Profile} user profile
   */
  profile: null,

  // -------------------------------------------------------------------------
  // Events

  didRender() {
    $('[data-toggle="tooltip"]').tooltip();
  },

  // -------------------------------------------------------------------------
  // Methods
  /**
   * Selecting to bookmark a course
   */
  bookmarkCourse: function() {
    this.sendAction('onBookmarkCourse', this.get('course'));
  },

  /**
   * Selecting to play a course
   */
  playCourse: function() {
    this.sendAction('onPlayCourse', this.get('course'));
  },

  /**
   * Selecting to remix a course
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
  }
});
