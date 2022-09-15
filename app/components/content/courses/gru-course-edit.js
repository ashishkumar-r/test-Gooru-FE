import Ember from 'ember';
import ContentEditMixin from 'gooru-web/mixins/content/edit';
import ModalMixin from 'gooru-web/mixins/modal';
import { CONTENT_TYPES } from 'gooru-web/config/config';
import { etlSecCalculation } from 'gooru-web/utils/utils';

export default Ember.Component.extend(ContentEditMixin, ModalMixin, {
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @requires service:notifications
   */
  notifications: Ember.inject.service(),

  /**
   * @requires service:i18n
   */
  i18n: Ember.inject.service(),

  /**
   * @requires service:api-sdk/course
   */
  courseService: Ember.inject.service('api-sdk/course'),

  /**
   * @property {ProfileService} Profile service API SDK
   */
  profileService: Ember.inject.service('api-sdk/profile'),

  /**
   * @property {MediaService} Media service API SDK
   */
  mediaService: Ember.inject.service('api-sdk/media'),

  /**
   * @type {SessionService} Service to retrieve session information
   */
  session: Ember.inject.service('session'),

  /**
   * @requires service:taxonomy
   */
  taxonomyService: Ember.inject.service('taxonomy'),
  /**
   * @property {limit}
   */
  // this should come from config json
  limit: 400,
  /**
   * @property {offset}
   */
  offset: 0,

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'courses', 'gru-course-edit'],

  tagName: 'article',

  selfId: Ember.computed.alias('session.userId'),

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Toggle section when user click on add icon
     */
    onToggleAddCollaborator() {
      let component = this;
      component.$('.sub-sec-coteach .add-collaborator-panel').slideToggle();
    },

    /**
     * Triggered from a co-teacher card of class mgt
     */
    removeCoteacher: function(collaborator) {
      const component = this;
      let courseCollaborators = component.get('collaborators');
      courseCollaborators = courseCollaborators.removeObject(collaborator);
      let courseCollaboratorIds = courseCollaborators.map(
        collaborator => collaborator.id
      );
      component
        .updateCollaboratorsForCourse(courseCollaboratorIds)
        .then(function() {
          component.set('collaborators', courseCollaborators);
        });
    },

    /**
     * Action triggered when add list of users as co-teacher
     */
    onAddCollaborators(selectedCollaborators = Ember.A([])) {
      const component = this;
      const collaborators = component.get('collaborators') || Ember.A([]);
      let courseCollaborators = collaborators.concat(selectedCollaborators);
      let courseCollaboratorIds = courseCollaborators.map(collaborator =>
        collaborator.get('id')
      );
      component
        .updateCollaboratorsForCourse(courseCollaboratorIds)
        .then(function() {
          component.set('collaborators', courseCollaborators);
        });
      component.send('onToggleAddCollaborator');
    },
    /**
     * Course Edit page back button logic for send to previous page state
     */
    courseEditBackButton: function() {
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
    },

    /**
     * Edit Content
     */
    editContent: function() {
      var courseForEditing = this.get('course').copy();
      this.set('tempCourse', courseForEditing);
      this.set('isEditing', true);
    },

    /**
     * Cancel edit content
     */
    cancelEdit: function() {
      var courseForCancelEditing = this.get('course').copy();
      this.set('isEditing', false);
      this.set('tempCourse', courseForCancelEditing);
    },

    /**
     * Delete course
     */
    deleteCourse: function() {
      const myId = this.get('session.userId');
      var model = {
        content: this.get('course'),
        deleteMethod: function() {
          return this.get('courseService').deleteCourse(this.get('course.id'));
        }.bind(this),
        type: CONTENT_TYPES.COURSE,
        redirect: {
          route: 'library-search',
          params: {
            profileId: myId,
            type: 'my-content'
          }
        }
      };

      this.actions.showModal.call(
        this,
        'content.modals.gru-delete-content',
        model,
        null,
        null,
        null,
        false
      );
    },

    /**
     * Save Content
     */
    updateContent: function() {
      let component = this;
      var editedCourse = component.get('tempCourse');
      let course = component.get('course');
      const etlHrs = editedCourse.get('hours');
      const etlMins = editedCourse.get('minutes');
      etlSecCalculation(editedCourse, etlHrs, etlMins);
      editedCourse.validate().then(function({ validations }) {
        if (validations.get('isValid')) {
          let imageIdPromise = new Ember.RSVP.resolve(
            editedCourse.get('thumbnailUrl')
          );
          if (
            editedCourse.get('thumbnailUrl') &&
            editedCourse.get('thumbnailUrl') !== course.get('thumbnailUrl')
          ) {
            imageIdPromise = component
              .get('mediaService')
              .uploadContentFile(editedCourse.get('thumbnailUrl'));
          }
          imageIdPromise.then(function(imageId) {
            editedCourse.set('thumbnailUrl', imageId);
            component
              .get('courseService')
              .updateCourse(editedCourse)
              .then(function() {
                course.merge(editedCourse, [
                  'title',
                  'isVisibleOnProfile',
                  'thumbnailUrl',
                  'description',
                  'taxonomy',
                  'subject',
                  'mainSubject',
                  'audience',
                  'useCase',
                  'hours',
                  'minutes',
                  'summary',
                  'primaryLanguage',
                  'metadata'
                ]);
                component.set('isEditing', false);
              })
              .catch(function(error) {
                var message = component
                  .get('i18n')
                  .t('common.errors.course-not-updated').string;
                component.get('notifications').error(message);
                Ember.Logger.error(error);
              });
          });
          component.set('didValidate', true);
        }
      });
    },

    /**
     * Save setting for visibility of collection in profile
     */
    publishToProfile: function() {
      var courseForEditing = this.get('course').copy();
      this.set('tempCourse', courseForEditing);
      this.actions.updateContent.call(this);
    },

    /**
     *
     * @param {TaxonomyRoot} subject
     */
    selectSubject: function(subject) {
      this.set('tempCourse.mainSubject', subject);
    },

    /**
     *
     * @param {TaxonomyTagData[]} taxonomy
     */
    selectTaxonomy: function(taxonomy) {
      this.set('tempCourse.taxonomy', taxonomy);
    },

    /**
     * Sets the current course builder location
     * @param unitId
     * @param lessonId
     */
    setLocation: function(unitId, lessonId = undefined) {
      this.sendAction('onLocationChange', unitId, lessonId);
    },

    onSelected: function(publisher) {
      this.set('selectedPublisher', publisher);
      this.set('tempCourse.publisherId', publisher.id);
    },
    removePublish: function() {
      this.set('selectedPublisher', null);
      this.set('tempCourse.publisherId', null);
    }
  },

  // -------------------------------------------------------------------------
  // Events
  init() {
    const component = this;
    this._super(...arguments);
    component.setMainSubject();
    if (component.get('collaborators')) {
      component.readCollaboratorsProfile();
    }
  },
  didInsertElement() {
    let component = this;
    const Pubisherlimit = {
      offset: this.get('offset'),
      limit: this.get('limit')
    };
    component
      .get('courseService')
      .getPublisherList(Pubisherlimit)
      .then(pubisherList => {
        component.set('publisherAll', pubisherList);
        let selectedPublisher = pubisherList.findBy(
          'id',
          this.get('tempCourse.publisherId')
        );
        this.set('selectedPublisher', selectedPublisher);
        Ember.run.scheduleOnce('afterRender', function() {
          if (component.get('tempCourse.publisherId')) {
            component
              .$(
                `.publish-list input[value = ${component.get(
                  'tempCourse.publisherId'
                )}]`
              )
              .prop('checked', true);
          }
        });
      });
  },
  // -------------------------------------------------------------------------
  // Properties

  /**
   * Course model as instantiated by the route. This is the model used when not editing
   * or after any course changes have been saved.
   * @property {Course}
   */
  course: null,

  hasCollaborator: false,

  /**
   * @property {Array} collaborators
   * Property for list of class collaborators
   */
  collaborators: Ember.computed.alias('course.collaborator'),

  /**
   * Copy of the course model used for editing.
   * @property {Course}
   */
  tempCourse: {},

  /**
   * @property {string} action name when the location is changed
   */
  onLocationChange: null,

  /**
   * @property {dummy} this handles undefined parent property setting ember upgrade fix
   */
  tempCourseAudience: Ember.observer('tempCourse.audience', function() {
    Ember.Logger.log('audience', this.get('tempCourse.audience'));
  }),

  /**
   * @property {dummy} this to find isCollaborator
   */
  isCollaborator: Ember.observer(
    'tempCourse.audience',
    'collaborators',
    function() {
      let collaborators = this.get('collaborators');
      let userId = this.get('selfId');
      let found = collaborators.findBy('id', userId);
      if (found) {
        this.set('hasCollaborator', true);
      }
    }
  ),

  /**
   * @property {string} selected lesson id
   */
  selectedLessonId: null,

  publisherAll: Ember.A(),

  selectedPublisher: {},

  // -------------------------------------------------------------------------
  // Methods

  setMainSubject: function() {
    var component = this;
    var subjectId = component.get('course.subject');
    if (subjectId) {
      component
        .get('taxonomyService')
        .findSubjectById(subjectId)
        .then(function(subject) {
          component.get('course').set('mainSubject', subject);
        });
    } else {
      component.get('course').set('mainSubject', null);
    }
  },

  /**
   * @function updateCollaborators
   * Method to update collaborator list
   */
  updateCollaboratorsForCourse(collaborators) {
    const component = this;
    const courseService = component.get('courseService');
    const courseId = component.get('course.id');
    collaborators = collaborators.length ? collaborators : null;
    return courseService.updateCollaborators(courseId, collaborators);
  },

  readCollaboratorsProfile() {
    const component = this;

    let collaborators = component.get('collaborators');
    if (component.get('selfId') === component.get('course.creatorId')) {
      collaborators.push(component.get('selfId'));
    }
    component
      .get('profileService')
      .readMultipleProfiles(component.get('collaborators'))
      .then(collaboratorProfiles => {
        component.set('collaborators', collaboratorProfiles);
      });
  }
});
