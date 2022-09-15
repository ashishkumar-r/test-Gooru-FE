import Ember from 'ember';
import ModalMixin from 'gooru-web/mixins/modal';
import PlayerAccordionLesson from 'gooru-web/components/content/courses/play/gru-accordion-lesson';
import { CONTENT_TYPES } from 'gooru-web/config/config';
import { etlSecCalculation } from 'gooru-web/utils/utils';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';
/**
 * Content Builder: Accordion Lesson
 *
 * Component responsible for behaving as an accordion and listing a set of collections/assessments.
 * It is meant to be used inside of an {@link ./gru-accordion-unit|Accordion Unit}
 *
 * @module
 * @augments content/courses/play/gru-accordion-lesson
 * @mixes mixins/modal
 */
export default PlayerAccordionLesson.extend(ModalMixin, TenantSettingsMixin, {
  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @requires service:api-sdk/lesson
   */
  lessonService: Ember.inject.service('api-sdk/lesson'),

  /**
   * @property {Service} session
   */
  session: Ember.inject.service('session'),

  /**
   * @property {Service} profile service
   */
  profileService: Ember.inject.service('api-sdk/profile'),

  isLessonLoaded: false,

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    cancelEdit: function() {
      if (this.get('model.isNew')) {
        this.get('onCancelAddLesson')(this.get('model'));
      } else {
        this.set('model.isEditing', false);
        this.set('model.isExpandEdit', false);
        this.set('model.isExpanded', false);
        this.set('editquestionErrMsg', false);
        this.set('editDescriptionErrMsg', false);
      }
    },

    edit: function() {
      var lessonForEditing = this.get('lesson').copy();
      this.set('tempLesson', lessonForEditing);
      this.set('model.isExpanded', true);
      this.set('model.isExpandEdit', true);
      this.set('lessonPlan', null);
      this.fetchLessonPlanId(
        this.get('course.id'),
        this.get('unitId'),
        this.get('lesson.id')
      ).then(lessonPlanInfo => {
        this.set('lessonPlan', lessonPlanInfo);
      });
    },
    saveLesson: function() {
      var courseId = this.get('course.id');
      this.set('isErrorMessage', false);
      var unitId = this.get('unitId');
      var editedLesson = this.get('tempLesson');
      const etlHrs = editedLesson.get('etlHrs');
      const etlMins = editedLesson.get('etlMins');
      etlSecCalculation(editedLesson, etlHrs, etlMins);
      var lessonService = this.get('lessonService');
      const lessonPlan = {
        description: editedLesson.description,
        guiding_questions: editedLesson.guiding_question
      };
      const description = $(
        `<span style="background-color:none">${lessonPlan.description}</span>`
      )
        .clone()
        .text();
      const guiding_question = $(
        `<span style="background-color:none">${lessonPlan.guiding_questions}</span>`
      )
        .clone()
        .text();

      editedLesson.validate().then(
        function({ validations }) {
          if (validations.get('isValid')) {
            // Saving an existing lesson or a new lesson (falsey id)?
            let savePromise = editedLesson.get('id')
              ? lessonService.updateLesson(courseId, unitId, editedLesson)
              : lessonService.createLesson(courseId, unitId, editedLesson);

            savePromise
              .then(
                function() {
                  this.fetchLessonPlanId(
                    courseId,
                    unitId,
                    editedLesson.id
                  ).then(lessonPlanInfo => {
                    if (lessonPlanInfo.id) {
                      if (
                        (lessonPlan.description === '' &&
                          lessonPlan.guiding_questions === '') ||
                        ($.trim(description).length === 0 &&
                          $.trim(guiding_question).length === 0)
                      ) {
                        this.get('lessonService').deleteLessonPlan(
                          courseId,
                          unitId,
                          editedLesson.id,
                          lessonPlanInfo.id
                        );
                        this.set('editquestionErrMsg', false);
                        this.set('editDescriptionErrMsg', false);
                        this.set('model.isEditing', false);
                        this.set('model.isExpandEdit', false);
                      } else {
                        if (
                          lessonPlan.description ||
                          lessonPlan.description === '' ||
                          lessonPlan.guiding_questions ||
                          lessonPlan.guiding_questions === ''
                        ) {
                          if (
                            lessonPlan.description === '' ||
                            lessonPlan.guiding_questions === '' ||
                            $.trim(description).length === 0 ||
                            $.trim(guiding_question).length === 0
                          ) {
                            if (
                              $.trim(description).length === 0 ||
                              lessonPlan.description === ''
                            ) {
                              this.set('tempLesson.description', '');
                              this.set('editDescriptionErrMsg', true);
                            }
                            if (
                              $.trim(guiding_question).length === 0 ||
                              lessonPlan.guiding_questions === ''
                            ) {
                              this.set('tempLesson.guiding_question', '');
                              this.set('editquestionErrMsg', true);
                            }
                            return;
                          } else {
                            lessonService.updateLessonPlan(
                              courseId,
                              unitId,
                              editedLesson.id,
                              lessonPlan,
                              lessonPlanInfo.id
                            );
                            this.set('editquestionErrMsg', false);
                            this.set('editDescriptionErrMsg', false);
                            this.set('model.isEditing', false);
                            this.set('model.isExpandEdit', false);
                          }
                        }
                      }
                    } else {
                      if (
                        lessonPlan.description ||
                        lessonPlan.guiding_questions
                      ) {
                        if (lessonPlan.description) {
                          lessonService.createLessonPlan(
                            courseId,
                            unitId,
                            editedLesson.id,
                            lessonPlan
                          );
                          this.set('editquestionErrMsg', false);
                          this.set('editDescriptionErrMsg', false);
                          this.set('model.isEditing', false);
                          this.set('model.isExpandEdit', false);
                        } else {
                          this.set('editDescriptionErrMsg', true);
                          return;
                        }
                      }
                    }
                    if (lessonPlanInfo.length === 0 || lessonPlanInfo.id) {
                      this.set('model.isEditing', false);
                      this.set('model.isExpandEdit', false);
                    }
                  });
                  this.get('lesson').merge(editedLesson, [
                    'id',
                    'title',
                    'etlHrs',
                    'etlMins',
                    'computedMinutes',
                    'computedHours'
                  ]);
                  this.set(
                    'newCollectionModel.lessonId',
                    this.get('lesson.id')
                  );
                }.bind(this)
              )
              .catch(
                function(error) {
                  var message = this.get('i18n').t(
                    'common.errors.lesson-not-created'
                  ).string;
                  this.get('notifications').error(message);
                  Ember.Logger.error(error);
                }.bind(this)
              );
          }
          this.set('didValidate', true);
        }.bind(this)
      );
    },
    /**
     * Remove lesson item
     */
    removeLessonItem: function(builderItem) {
      this.get('items').removeObject(builderItem);
      this.refreshOrderList();
    },
    remixLessonItem: function(builderItem) {
      this.get('items').addObject(builderItem);
      this.refreshOrderList();
    },
    /**
     * Delete selected lesson
     *
     */
    deleteItem: function(builderItem) {
      let component = this;
      var model = {
        content: this.get('lesson'),
        index: this.get('index'),
        parentName: this.get('course.title'),
        deleteMethod: function() {
          return this.get('lessonService').deleteLesson(
            this.get('course.id'),
            this.get('unitId'),
            this.get('lesson.id')
          );
        }.bind(this),
        type: CONTENT_TYPES.LESSON,
        callback: {
          success: function() {
            component.get('onDeleteLesson')(builderItem);
          }
        }
      };
      component
        .fetchLessonPlanId(
          component.get('course.id'),
          component.get('unitId'),
          component.get('lesson.id')
        )
        .then(lessonPlanInfo => {
          if (lessonPlanInfo.id) {
            component
              .get('lessonService')
              .deleteLessonPlan(
                component.get('course.id'),
                component.get('unitId'),
                component.get('lesson.id'),
                lessonPlanInfo.id
              );
          }
        });
      this.actions.showModal.call(
        this,
        'content.modals.gru-delete-content',
        model
      );
    },

    copy: function() {
      var model = {
        content: this.get('lesson'),
        courseId: this.get('course.id'),
        unitId: this.get('unitId'),
        onRemixSuccess: this.get('onRemixLesson')
      };
      this.send('showModal', 'content.modals.gru-lesson-remix', model);
    },

    /**
     * Add from my collections
     */
    fromMyCollections: function() {
      var component = this;
      component
        .get('profileService')
        .readCollections(component.get('session.userId'), {
          filterBy: 'notInCourse'
        })
        .then(function(collections) {
          component.send(
            'showModal',
            'content.modals.gru-add-to-lesson',
            {
              collections,
              content: component.get('lesson'),
              courseId: component.get('course.id'),
              unitId: component.get('unitId'),
              isCollection: true,
              onAdd: component.get('onAddItem').bind(component),
              callback: {
                success: function() {
                  component.loadData();
                  component.refreshOrderList();
                }
              }
            },
            null,
            'add-to'
          );
        });
    },

    /**
     * Add from my assessments
     */
    fromMyAssessments: function() {
      var component = this;
      component
        .get('profileService')
        .readAssessments(component.get('session.userId'), {
          filterBy: 'notInCourse',
          diagnosticAssessment: true
        })
        .then(function(assessments) {
          component.send(
            'showModal',
            'content.modals.gru-add-to-lesson',
            {
              collections: assessments,
              content: component.get('lesson'),
              courseId: component.get('course.id'),
              unitId: component.get('unitId'),
              isCollection: false,
              onAdd: component.get('onAddItem').bind(component),
              callback: {
                success: function() {
                  component.loadData();
                  component.refreshOrderList();
                }
              }
            },
            null,
            'add-to'
          );
        });
    },

    /* Show activity modal selectable
     */
    fromMyActivities: function() {
      var component = this;
      const params = {
        filterBy: 'notInCourse'
      };
      component
        .get('profileService')
        .readOfflineActivities(component.get('session.userId'), params)
        .then(function(activities) {
          component.send(
            'showModal',
            'content.modals.gru-add-to-lesson',
            {
              collections: activities,
              content: component.get('lesson'),
              courseId: component.get('course.id'),
              unitId: component.get('unitId'),
              isCollection: false,
              isOA: true,
              onAdd: component.get('onAddItem').bind(component),
              callback: {
                success: function() {
                  component.loadData();
                  component.refreshOrderList();
                }
              }
            },
            null,
            'add-to'
          );
        });
    },

    sortLessonItems: function() {
      this.loadData();
      this.actions.sortItems.call(this);
    },

    saveLessonItemsOrder: function() {
      var courseId = this.get('course.id');
      var unitId = this.get('unitId');
      var lessonId = this.get('lesson.id');
      var orderList = this.get('orderList');

      if (orderList && orderList.length > 1) {
        this.get('lessonService')
          .reorderLesson(courseId, unitId, lessonId, orderList)
          .then(
            function() {
              this.actions.finishSort.call(this);
            }.bind(this)
          );
      } else {
        this.actions.finishSort.call(this);
      }
    },

    newActivity: function(newCollectionModel) {
      this.get('router').transitionTo(
        'content.activity.edit',
        newCollectionModel
      );
    }
  },
  fetchLessonPlanId(courseId, unitId, lessonId) {
    const component = this;
    return this.get('lessonService')
      .fetchById(courseId, unitId, lessonId)
      .then(function(lesson) {
        const tempLesson = component.get('tempLesson');
        tempLesson.setProperties({
          etlHrs: lesson.etlHrs,
          etlMins: lesson.etlMins,
          author_etl_secs: lesson.author_etl_secs,
          computedHours: lesson.computedHours,
          computedMinutes: lesson.computedMinutes
        });
        component.set('isLessonLoaded', true);
        return lesson.lessonPlan;
      });
  },

  // -------------------------------------------------------------------------
  // Attributes

  attributeBindings: ['data-id'],

  'data-id': Ember.computed.alias('lesson.id'),

  // -------------------------------------------------------------------------
  // Events
  init() {
    this._super(...arguments);
    let courseId = this.get('course.id');
    let unitId = this.get('unitId');
    let lessonId = this.get('lesson.id');
    this.set('newCollectionModel', {
      courseId,
      unitId,
      lessonId,
      associateLesson: true
    });
    if (this.get('lesson') && !this.get('lesson.id')) {
      // If this a new lesson, set the tempLesson value so things don't break in edit mode
      let lessonForEditing = this.get('lesson').copy();
      this.set('tempLesson', lessonForEditing);
    }
  },

  didRender() {
    $('[data-toggle="tooltip"]').tooltip();
  },
  /**
   * After adding a collection/assessment
   */
  onAddItem: function(builderItem) {
    this.get('items').addObject(builderItem);
    this.refreshOrderList();
  },
  // -------------------------------------------------------------------------
  // Properties

  /**
   * @prop {Object} newCollectionModel - model for the new collection/assessment modals
   */
  newCollectionModel: null,

  /**
   * @prop {Content/Lesson} tempLesson - Temporary lesson model used for editing
   */
  tempLesson: null
});
