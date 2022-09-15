import Ember from 'ember';
import ExternalAssessment from 'gooru-web/models/content/external-assessment';

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
   * @property {externalAssessmentService} Assessment service API SDK
   */
  externalAssessmentService: Ember.inject.service(
    'api-sdk/external-assessment'
  ),

  /**
   * @type {SessionService} Service to retrieve session information
   */
  session: Ember.inject.service('session'),

  /**
   * @property {MediaService} Media service API SDK
   */
  mediaService: Ember.inject.service('api-sdk/media'),

  /**
   * @property {Service} I18N service
   */
  i18n: Ember.inject.service(),

  /**
   * @property {Service} Notifications service
   */
  notifications: Ember.inject.service(),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'modals', 'gru-external-assessment-new'],

  selectedType: 1,

  isLoadings: false,

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
    },

    selectType(type) {
      this.set('selectedType', type);
    },

    selectFile: function(file) {
      let component = this;
      component.set('isErrorScormFile', false);
      if (file) {
        component.set('isLoadings', true);
        component
          .get('mediaService')
          .uploadScormFile(file)
          .then(function(response) {
            let tempCollection = component.get('assessment');
            if (
              response &&
              response.scorm_file_info &&
              response.scorm_file_info.resources &&
              response.scorm_file_info.resources.length
            ) {
              const url =
                component.get('session.cdnUrls.content') +
                response.filepath +
                response.scorm_file_info.resources[0].filename;

              tempCollection.set('url', url);
              const scorm = {
                scorm: {
                  originalFilename:
                    response.scorm_file_info.resources[0].filename,
                  filepath: response.filepath,
                  fileName: response.original_filename
                }
              };
              tempCollection.set('metadata', scorm);
              const selectedType = component.get('selectedType');
              tempCollection.set(
                'subFormat',
                selectedType === 1 ? 'url' : 'scorm'
              );
              component.set('isErrorScormFile', false);
            } else {
              component.set('isErrorScormFile', true);
            }
            component.set('isLoadings', false);
          });
      }
    }
  },

  validate: function() {
    const assessment = this.get('assessment');
    return assessment.validate();
  },

  createAssessmentOrCollection: function() {
    return this.get('externalAssessmentService').createExternalAssessment(
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
    this.triggerAction({
      action: 'closeModal'
    });
    const queryParams = {
      queryParams: {
        editing: true
      }
    };
    this.get('router').transitionTo(
      'content.external-assessments.edit',
      assessmentId,
      queryParams
    );
  },

  showErrorMessage: function(error) {
    Ember.Logger.error(error);
    const message = this.get('i18n').t(
      'common.errors.external-assessment-not-created'
    ).string;
    this.get('notifications').error(message);
  },

  // -------------------------------------------------------------------------
  // Events

  init() {
    this._super(...arguments);
    var assessment = ExternalAssessment.create(
      Ember.getOwner(this).ownerInjection(),
      {
        title: null
      }
    );
    this.set('assessment', assessment);
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @type {Assessment} assessment
   */
  assessment: null,

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
   * Indicate if it's waiting for createExternalCollection callback
   */
  isLoading: false
});
