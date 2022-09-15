import PlayerAccordionLessonItem from 'gooru-web/components/content/courses/play/gru-accordion-lesson-item';
import { CONTENT_TYPES } from 'gooru-web/config/config';
import ModalMixin from 'gooru-web/mixins/modal';
import Ember from 'ember';
import lessonItem from 'gooru-web/mixins/lesson-item-mixin';

/**
 * Course content viewer: Accordion Lesson Item
 *
 * Component responsible for presenting a collection/assessment within a lesson.
 * It is meant to be used inside of an {@link ./gru-accordion-unit|Accordion Lesson}
 *
 * @module
 * @augments Ember/Component
 */
export default PlayerAccordionLessonItem.extend(ModalMixin, lessonItem, {
  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @requires service:api-sdk/collection
   */
  collectionService: Ember.inject.service('api-sdk/collection'),

  /**
   * @requires service:api-sdk/assessment
   */
  assessmentService: Ember.inject.service('api-sdk/assessment'),

  /**
   * @requires service:api-sdk/lesson
   */
  lessonService: Ember.inject.service('api-sdk/lesson'),

  /**
   * @requires service:api-sdk/offline-activity/offline-activity
   */
  oaService: Ember.inject.service('api-sdk/offline-activity/offline-activity'),

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    edit: function(item) {
      const component = this;
      const format = item.get('format') || item.get('collectionType');
      let route = 'content.collections.edit';
      if (format === CONTENT_TYPES.OFFLINE_ACTIVITY) {
        route = 'content.activity.edit';
      } else if (format === CONTENT_TYPES.ASSESSMENT) {
        route = 'content.assessments.edit';
      } else if (format === CONTENT_TYPES.EXTERNAL_COLLECTION) {
        route = 'content.external-collections.edit';
      } else if (format === CONTENT_TYPES.EXTERNAL_ASSESSMENT) {
        route = 'content.external-assessments.edit';
      }
      component.get('router').transitionTo(route, item.get('id'), {
        queryParams: {
          editingContent: true,
          hasCollaborator: component.get('hasCollaborator')
        }
      });
    },

    /**
     * Remove selected item
     *
     */
    removeItem: function(builderItem) {
      let component = this;
      var model = {
        content: this.get('model'),
        index: this.get('index'),
        parentName: this.get('lessonTitle'),
        callback: {
          success: function() {
            component.get('onRemoveLessonItem')(builderItem);
          }
        }
      };
      var lessonItem = null;
      lessonItem = {
        removeMethod: function() {
          return this.get(
            'lessonService'
          ).disassociateAssessmentOrCollectionToLesson(
            this.get('courseId'),
            this.get('unitId'),
            this.get('lessonId'),
            this.get('model.id'),
            builderItem.get('isCollection')
          );
        }.bind(this),
        type: builderItem.get('isCollection')
          ? CONTENT_TYPES.COLLECTION
          : CONTENT_TYPES.ASSESSMENT
      };
      if (this.get('model').format === 'offline-activity') {
        lessonItem.type = 'oa.offline_activity.label';
      }
      let format = builderItem.get('format');
      model.type = format;
      this.actions.showModal.call(
        this,
        'content.modals.gru-remove-content',
        $.extend(model, lessonItem)
      );
    },

    /**
     * Delete selected unit
     *
     */
    deleteItem: function(builderItem) {
      let component = this;
      var model = {
        content: this.get('model'),
        index: this.get('index'),
        parentName: this.get('course.title'),
        callback: {
          success: function() {
            component.get('onDeleteLessonItem')(builderItem);
          }
        }
      };
      var lessonItem = null;
      let format = builderItem.get('format');
      if (
        format === CONTENT_TYPES.COLLECTION ||
        format === CONTENT_TYPES.EXTERNAL_COLLECTION
      ) {
        lessonItem = {
          deleteMethod: function() {
            return this.get('collectionService').deleteCollection(
              this.get('model.id')
            );
          }.bind(this),
          type: CONTENT_TYPES.COLLECTION
        };
      } else if (
        format === CONTENT_TYPES.ASSESSMENT ||
        format === CONTENT_TYPES.EXTERNAL_ASSESSMENT
      ) {
        lessonItem = {
          deleteMethod: function() {
            return this.get('assessmentService').deleteAssessment(
              this.get('model')
            );
          }.bind(this),
          type: CONTENT_TYPES.ASSESSMENT
        };
      } else if (format === CONTENT_TYPES.OFFLINE_ACTIVITY) {
        lessonItem = {
          deleteMethod: function() {
            return this.get('oaService').deleteActivity(this.get('model'));
          }.bind(this),
          type: CONTENT_TYPES.OFFLINE_ACTIVITY
        };
      }
      model.type = format;
      this.actions.showModal.call(
        this,
        'content.modals.gru-delete-content',
        $.extend(model, lessonItem)
      );
    },

    copy: function() {
      const component = this;
      const isCollection = component.get('model.isCollection');
      const format = component.get('model.format');
      if (format === CONTENT_TYPES.COLLECTION) {
        component
          .get('collectionService')
          .readCollection(component.get('model.id'))
          .then(function(result) {
            let model = {
              content: result,
              lessonId: component.get('lessonId'),
              unitId: component.get('unitId'),
              courseId: component.get('courseId'),
              isCollection: isCollection,
              onRemixSuccess: component.get('onRemixLessonItem')
            };
            component.send(
              'showModal',
              'content.modals.gru-collection-remix',
              model
            );
          });
      } else if (format === CONTENT_TYPES.ASSESSMENT) {
        component
          .get('assessmentService')
          .readAssessment(component.get('model.id'))
          .then(function(result) {
            let model = {
              content: result,
              lessonId: component.get('lessonId'),
              unitId: component.get('unitId'),
              courseId: component.get('courseId'),
              isCollection: isCollection,
              onRemixSuccess: component.get('onRemixLessonItem')
            };
            component.send(
              'showModal',
              'content.modals.gru-assessment-remix',
              model
            );
          });
      } else if (format === CONTENT_TYPES.OFFLINE_ACTIVITY) {
        component
          .get('oaService')
          .readActivity(component.get('model.id'))
          .then(function(result) {
            let model = {
              content: result,
              lessonId: component.get('lessonId'),
              unitId: component.get('unitId'),
              courseId: component.get('courseId'),
              isCollection: isCollection,
              onRemixSuccess: component.get('onRemixLessonItem')
            };
            component.send('showModal', 'content.modals.gru-oa-remix', model);
          });
      }
    }
  },

  didInsertElement() {
    const controller = this;
    let content = controller.get('model');
    if (
      content.get('format') === 'assessment-external' ||
      content.get('format') === 'collection-external'
    ) {
      controller.generateLuUrl(content);
    }
  },

  didRender() {
    $('[data-toggle="tooltip"]').tooltip();
  },

  // -------------------------------------------------------------------------
  // Attributes

  attributeBindings: ['data-id'],

  'data-id': Ember.computed.alias('model.id'),

  // -------------------------------------------------------------------------
  // Properties

  isCollectionOrAssessment: Ember.computed('model.collectionType', function() {
    return (
      this.get('model.collectionType') === 'collection' ||
      this.get('model.collectionType') === 'assessment' ||
      this.get('model.collectionType') === 'collection-external' ||
      this.get('model.collectionType') === 'assessment-external'
    );
  }),
  /**
   * @prop {String} course - Course this lesson item belongs to
   */
  course: null
});
