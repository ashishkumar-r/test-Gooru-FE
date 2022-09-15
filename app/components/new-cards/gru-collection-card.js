import Ember from 'ember';
import TaxonomyTag from 'gooru-web/models/taxonomy/taxonomy-tag';
import TaxonomyTagData from 'gooru-web/models/taxonomy/taxonomy-tag-data';
import ModalMixin from 'gooru-web/mixins/modal';
import { CONTENT_TYPES } from 'gooru-web/config/config';

/**
 * Collection, Assessment and Course card
 *
 * Component responsible of showing the collection assessment or rubric information in cards, so that most useful information is summarized there.
 * @module
 */
export default Ember.Component.extend(ModalMixin, {
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @requires service:api-sdk/session
   */
  session: Ember.inject.service('session'),

  /**
   * @property {Ember.Service} Service to retrieve an assessment
   */

  assessmentService: Ember.inject.service('api-sdk/assessment'),
  /**
   * @property {Ember.Service} Service to retrieve a collection
   */
  collectionService: Ember.inject.service('api-sdk/collection'),

  /**
   * @requires service:api-sdk/course
   */
  courseService: Ember.inject.service('api-sdk/course'),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['new-cards', 'gru-collection-card'],

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Action triggered to bookmark content
     * @param {Collection/Assessment} content
     * @param {Boolean} showType
     */
    bookmarkContent: function(content, showType) {
      this.sendAction('onBookmarkContent', content, showType);
    },

    /**
     * Action triggered to add to classroom or daily class activities
     */
    addToClassroom: function() {
      const component = this;

      component.addStudentCountToClasses();

      let model = Ember.Object.create({
        classroomList: this.get('classroomList'),
        classActivity: !this.get('isCourse'),
        content: this.get('content')
      });

      if (this.get('isCourse')) {
        model.set('callback', {
          success: function() {
            component.sendAction('onUpdateUserClasses');
          }
        });
      }
      component.send(
        'showModal',
        'content.modals.gru-add-to-classroom',
        model,
        null,
        'add-to'
      );
    },

    /**
     * Action triggered to edit content
     */
    editContent: function() {
      this.sendAction('onEditContent', this.get('content'));
    },

    /**
     * Action triggered to open the content player
     * @param {string} content identifier
     */
    openContentPlayer: function(content) {
      this.sendAction('onOpenContentPlayer', content);
    },

    /**
     * Action triggered to open the independent content player
     * @param {string} content identifier
     */
    playIndependent: function(content) {
      this.sendAction('onOpenIndependentPlayer', content);
    },

    /**
     * Action triggered to preview the content
     * @param content
     */
    previewContent: function(content) {
      let component = this;
      let isTeacher = this.get('isTeacher');
      let isStudent = this.get('isStudent');
      let isCourse = this.get('isCourse');
      let isCollection = content.get('isCollection');
      let contentId = content.get('id');

      let model = Ember.Object.create({
        content,
        isTeacher,
        isStudent,
        disabledBookmark: this.get('disabledBookmark')
      });

      if (isCourse) {
        component
          .get('courseService')
          .fetchById(contentId)
          .then(function(course) {
            model.set('content.children', course.children);
            model.set('remixCourse', () => component.remixCourse());
            model.set('bookmarkCourse', () =>
              component.send('bookmarkContent', content, false)
            );
            model.set('playCourse', () =>
              component.send('playIndependent', content, false)
            );
          })
          .then(function() {
            component.send('showModal', 'gru-preview-course', model);
          });
      } else {
        model.set('remixCollection', () => component.remixCollection());
        model.set('bookmarkCollection', () =>
          component.send('bookmarkContent', content, false)
        );
        model.set('playCollection', () =>
          component.send('playIndependent', content, false)
        );
        component
          .loadCollection(contentId, isCollection, model)
          .then(function() {
            component.send('showModal', 'gru-preview-collection', model);
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
   * Indicates if the edit functionality is enabled
   * @property {boolean}
   */
  addEnabled: true,

  /**
   * @property {Object} Object containing student count by class
   */
  classStudentCount: null,

  /**
   * @property {Course, Collection, Assessment} content
   */
  content: null,

  /**
   * @property {contentType} content type
   */
  contentType: Ember.computed('content', function() {
    return this.get('content.isCollection')
      ? CONTENT_TYPES.COLLECTION
      : CONTENT_TYPES.ASSESSMENT;
  }),

  /**
   * Indicates if bookmark action is disabled
   * @property {boolean}
   */
  disabledBookmark: Ember.computed(
    'isTeacher',
    'session.isAnonymous',
    function() {
      return this.get('session.isAnonymous') || this.get('isTeacher');
    }
  ),

  /**
   * Indicates if is on the user Profile in order to enable edit functions
   * @property {boolean}
   */
  isMyProfile: false,

  /**
   * Indicates if the publish icon is visible
   * @property {boolean}
   */
  publishVisible: false,

  /**
   * Indicates if is the card is showing on profile
   * @property {boolean}
   */
  isOnProfile: false,

  /**
   * @property {boolean} Indicates if collection has 1 or more resources
   */
  hasResources: Ember.computed.gt('content.resourceCount', 0),

  /**
   * @property {boolean} Indicates if collection has 1 or more questions
   */
  hasCollections: Ember.computed.gt('collectionCount', 0),

  /**
   * @property {boolean} Indicates if collection has 1 or more resources
   */
  hasAssessments: Ember.computed.gt('assessmentCount', 0),

  /**
   * @property {boolean} Indicates if collection has 1 or more questions
   */
  hasQuestions: Ember.computed.gt('content.questionCount', 0),

  /**
   * @property {boolean}
   */
  isAssessment: Ember.computed.alias('content.isAssessment'),

  /**
   * @property {boolean} isCourse indicate if the card is showing a course
   */
  isCourse: false,

  /**
   * Indicates if the teacher is seeing the card
   * @property {boolean}
   */
  isTeacher: Ember.computed.equal('profile.role', 'teacher'),

  /**
   * Indicates if the student is seeing the card
   * @property {boolean}
   */
  isStudent: Ember.computed.equal('profile.role', 'student'),

  /**
   * @property {string} bookmark content action
   */
  onBookmarkContent: null,

  /**
   * @property {string} edit action
   */
  onEditContent: null,

  /**
   * @property {string} on content player action
   */
  onOpenContentPlayer: null,

  /**
   * @property {string} on independent player action
   */
  onOpenIndependentPlayer: null,

  /**
   * @property {Profile} user profile
   */
  profile: null,

  /**
   * @property {TaxonomyTag[]} List of taxonomy tags
   */
  tags: Ember.computed(
    'content.standards.[]',
    'isCourse',
    'course.taxonomy.[]',
    function() {
      if (!this.get('isCourse')) {
        var standards = this.get('content.standards');
        standards = standards.filter(function(standard) {
          // Filter out learning targets (they're too long for the card)
          return !TaxonomyTagData.isMicroStandardId(standard.get('id'));
        });
        return TaxonomyTag.getTaxonomyTags(standards);
      } else {
        return TaxonomyTag.getTaxonomyTags(this.get('content.taxonomy'));
      }
    }
  ),

  // -------------------------------------------------------------------------
  // Methods

  remixCourse: function() {
    if (this.get('session.isAnonymous')) {
      this.send('showModal', 'content.modals.gru-login-prompt');
    } else {
      var remixModel = {
        content: this.get('content')
      };
      this.send('showModal', 'content.modals.gru-course-remix', remixModel);
    }
  },

  remixCollection: function() {
    if (this.get('session.isAnonymous')) {
      this.send('showModal', 'content.modals.gru-login-prompt');
    } else {
      var remixModel = {
        content: this.get('content')
      };
      if (this.get('content.isCollection')) {
        this.send(
          'showModal',
          'content.modals.gru-collection-remix',
          remixModel
        );
      } else {
        this.send(
          'showModal',
          'content.modals.gru-assessment-remix',
          remixModel
        );
      }
    }
  },

  /**
   * Loads the collection/assessment
   * @param {string} contentId
   * @param {boolean} isCollection
   * @param {Object} model
   * @returns {Promise.<Collection>}
   */
  loadCollection: function(contentId, isCollection, model) {
    const component = this;

    if (isCollection) {
      return component
        .get('collectionService')
        .readCollection(contentId)
        .then(function(collection) {
          model.set('content.children', collection.children);
        });
    }
    return component
      .get('assessmentService')
      .readAssessment(contentId)
      .then(function(collection) {
        model.set('content.children', collection.children);
      });
  },

  /**
   * Add student count to classes
   */
  addStudentCountToClasses: function() {
    let component = this;
    let classStudentCount = component.get('classStudentCount');
    let classRoomList = component.get('classroomList');
    if (classRoomList) {
      classRoomList.forEach(function(classroom) {
        let studentCount = component.studentCount(classStudentCount, classroom);
        classroom.set('studentCount', studentCount);
      });
    }
  },

  /**
   * @property {Number} Count of students in the class
   */
  studentCount: function(studentCount, classroom) {
    let classStudentCount = studentCount;
    return classStudentCount && Ember.keys(classStudentCount).length
      ? classStudentCount[classroom.get('id')]
        ? classStudentCount[classroom.get('id')]
        : 0
      : 0;
  }
});
