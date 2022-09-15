import Ember from 'ember';
import Collection from 'gooru-web/models/content/collection';
import Lesson from 'gooru-web/models/content/lesson';
import Unit from 'gooru-web/models/content/unit';
import Course from 'gooru-web/models/content/course';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @property {ClassService} Class service API SDK
   */
  classService: Ember.inject.service('api-sdk/class'),

  /**
   * @property {CourseService} Course service API SDK
   */
  courseService: Ember.inject.service('api-sdk/course'),

  /**
   * @property {UnitService} Unit service API SDK
   */
  unitService: Ember.inject.service('api-sdk/unit'),

  /**
   * @property {LessonService} Lesson service API SDK
   */
  lessonService: Ember.inject.service('api-sdk/lesson'),

  /**
   * @property {CollectionService} Collection service API SDK
   */
  collectionService: Ember.inject.service('api-sdk/collection'),

  /**
   * @property {Service} I18N service
   */
  i18n: Ember.inject.service(),

  /**
   * @property {Service} Notifications service
   */
  notifications: Ember.inject.service(),

  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'modals', 'gru-collection-new'],

  classNameBindings: ['component-class'],

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    create: function() {
      const component = this;
      const modelValue = component.get('model');
      component
        .get('validate')
        .call(component)
        .then(
          function({ validations }) {
            if (validations.get('isValid')) {
              component.set('isLoading', true);
              let assessmentOrCollectionId;
              if (modelValue && modelValue.isQuickstart) {
                const course = this.get('course');
                const unit = this.get('unit');
                const lesson = this.get('lesson');
                let classId = modelValue.class.id;
                let courseId;
                let unitId;
                let lessonId;

                component
                  .get('courseService')
                  .createCourse(course)
                  .then(function(newCourse) {
                    courseId = newCourse.get('id');
                    return component
                      .get('classService')
                      .associateCourseToClass(courseId, classId);
                  })
                  .then(function() {
                    return component
                      .get('unitService')
                      .createUnit(courseId, unit);
                  })
                  .then(function(newUnit) {
                    unitId = newUnit.get('id');
                    return component
                      .get('lessonService')
                      .createLesson(courseId, unitId, lesson);
                  })
                  .then(function(newLesson) {
                    lessonId = newLesson.get('id');
                    return component
                      .get('createAssessmentOrCollection')
                      .call(component);
                  })
                  .then(function(newAssessmentOrCollection) {
                    assessmentOrCollectionId = newAssessmentOrCollection.get(
                      'id'
                    );
                    return component
                      .get('associateToLesson')
                      .call(
                        component,
                        courseId,
                        unitId,
                        lessonId,
                        assessmentOrCollectionId
                      );
                  })
                  .then(
                    function() {
                      component.set('isLoading', false);
                      component
                        .get('closeModal')
                        .call(component, assessmentOrCollectionId);
                    },
                    function() {
                      component.set('isLoading', false);
                      component.get('showErrorMessage').bind(component)();
                    }
                  );
              } else {
                component
                  .get('createAssessmentOrCollection')
                  .call(component)
                  .then(function(newAssessmentOrCollection) {
                    assessmentOrCollectionId = newAssessmentOrCollection.get(
                      'id'
                    );
                    if (modelValue && modelValue.associateLesson) {
                      return component
                        .get('associateToLesson')
                        .call(
                          component,
                          modelValue.courseId,
                          modelValue.unitId,
                          modelValue.lessonId,
                          assessmentOrCollectionId
                        );
                    } else {
                      return Ember.RSVP.resolve(true);
                    }
                  })
                  .then(
                    function() {
                      component.set('isLoading', false);
                      component
                        .get('closeModal')
                        .call(component, assessmentOrCollectionId);
                    },
                    function() {
                      component.set('isLoading', false);
                      component.get('showErrorMessage')();
                    }
                  );
              }
            }
            this.set('didValidate', true);
          }.bind(this)
        );
    }
  },

  validate: function() {
    const collection = this.get('collection');
    return collection.validate();
  },

  createAssessmentOrCollection: function() {
    this.get('parseEventService').postParseEvent(
      PARSE_EVENTS.CLICK_CREATE_COLLECTION
    );
    return this.get('collectionService').createCollection(
      this.get('collection')
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
      true
    );
  },

  closeModal: function(collectionId) {
    this.set('isLoading', false);
    this.triggerAction({ action: 'closeModal' });
    const queryParams = { queryParams: { editing: true } };
    this.get('router').transitionTo(
      'content.collections.edit',
      collectionId,
      queryParams
    );
  },

  showErrorMessage: function(error) {
    Ember.Logger.error(error);
    const message = this.get('i18n').t('common.errors.collection-not-created')
      .string;
    this.get('notifications').error(message);
  },

  // -------------------------------------------------------------------------
  // Events

  init() {
    this._super(...arguments);
    if (this.get('model') && this.get('model').isQuickstart) {
      let className = this.get('model').class.title;
      let courseTitle = this.get('i18n').t('common.untitled-course').string;
      let courseName = `${className} - ${courseTitle}`;
      let unitName = this.get('i18n').t('common.untitled-unit').string;
      let lessonName = this.get('i18n').t('common.untitled-lesson').string;
      var course = Course.create(Ember.getOwner(this).ownerInjection(), {
        title: courseName
      });
      this.set('course', course);
      var unit = Unit.create(Ember.getOwner(this).ownerInjection(), {
        title: unitName
      });
      this.set('unit', unit);
      var lesson = Lesson.create(Ember.getOwner(this).ownerInjection(), {
        title: lessonName
      });
      this.set('lesson', lesson);
    }
    var collection = Collection.create(Ember.getOwner(this).ownerInjection(), {
      title: null
    });
    this.set('collection', collection);
  },

  // -------------------------------------------------------------------------
  // Properties
  /**
   * @type {?String} specific class
   */
  'component-class': null,

  /**
   * @type {Collection} collection
   */
  collection: null,

  /**
   * @type {Lesson} lesson
   */
  lesson: null,

  /**
   * @type {Unit} unit
   */
  unit: null,

  /**
   * @type {Course} course
   */
  course: null,

  /**
   * Indicate if it's waiting for createCollection callback
   */
  isLoading: false
});
