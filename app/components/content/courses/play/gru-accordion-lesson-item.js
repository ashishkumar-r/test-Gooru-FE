import Ember from 'ember';
import tenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';
import lessonItem from 'gooru-web/mixins/lesson-item-mixin';

/**
 * Content Builder: Accordion Lesson Item
 *
 * Component responsible for presenting a collection/assessment within a lesson.
 * It is meant to be used inside of an {@link ./gru-accordion-unit|Accordion Lesson}
 *
 * @module
 * @augments Ember/Component
 */
export default Ember.Component.extend(tenantSettingsMixin, lessonItem, {
  // -------------------------------------------------------------------------
  // Dependencies

  session: Ember.inject.service('session'),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'courses', 'gru-accordion-lesson-item', 'view'],

  tagName: 'li',

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @prop {String} courseId -  ID of the course this collection/assessment belongs to
   */
  courseId: null,

  /**
   * @prop {String} unitId - ID of the unit this collection/assessment belongs to
   */
  unitId: null,

  /**
   * @prop {String} lessonId - ID of the lesson this collection/assessment belongs to
   */
  lessonId: null,

  /**
   * @prop {Content/Collection-Assessment} model
   */
  model: null,

  /**
   * @prop {String} role Get current use role from session
   */
  role: Ember.computed.alias('session.role'),

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    openPlayerContent: function() {
      const component = this;
      const model = component.get('model');
      let format = model.get('format');
      let id = model.get('id');
      let type = model.get('collectionType');
      let queryParams = {
        offlineActivityId: id,
        type: type,
        role: component.get('role'),
        isPreview: true,
        isIframeMode: true
      };
      if (format === 'offline-activity') {
        component.set(
          'playerUrl',
          component
            .get('router')
            .generate('player-offline-activity', id, { queryParams })
        );
      } else {
        component.set(
          'playerUrl',
          component.get('router').generate('player', id, { queryParams })
        );
      }
      component.set('isOpenPlayer', true);
      component.set('playerContent', model);
    },

    closePullUp() {
      const component = this;
      component.set('isOpenPlayer', false);
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
  }
});
