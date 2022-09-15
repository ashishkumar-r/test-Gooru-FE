import Ember from 'ember';
import BuilderMixin from 'gooru-web/mixins/content/builder';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';

/**
 * Course content viewer: Accordion Lesson
 *
 * Component responsible for behaving as an accordion and listing a set of collections/assessments.
 * It is meant to be used inside of an {@link ./gru-accordion-unit|Accordion Unit}
 *
 * @module
 * @augments Ember/Component
 * @mixes mixins/content/builder
 */
export default Ember.Component.extend(BuilderMixin, TenantSettingsMixin, {
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @requires service:i18n
   */
  i18n: Ember.inject.service(),

  /**
   * @requires service:api-sdk/lesson
   */
  lessonService: Ember.inject.service('api-sdk/lesson'),

  /**
   * @requires service:notifications
   */
  notifications: Ember.inject.service(),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'courses', 'gru-accordion', 'gru-accordion-lesson'],

  classNameBindings: ['model.isEditing:edit:view'],

  tagName: 'li',

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    toggle: function() {
      const toggleValue = !this.get('model.isExpanded');
      const id = this.get('model.data.id');
      this.get('onExpandLesson')(id, toggleValue);
      this.loadData();
      this.set('model.isExpanded', toggleValue);
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @prop {String} course - Course this lesson belongs to
   */
  course: null,

  /**
   * @prop {Boolean} isLoaded - Has the data for the lesson already been loaded
   */
  isLoaded: false,

  /**
   * @prop {Content/Lesson} lesson
   */
  lesson: Ember.computed.alias('model.data'),

  /**
   * @prop {String} unitId - ID of the unit this lesson belongs to
   */
  unitId: null,

  /**
   * When a lesson within this unit is expanded/collapsed
   */
  onExpandLesson: null,

  // -------------------------------------------------------------------------
  // Methods

  /**
   * Load data for the unit
   *
   * @function actions:loadData
   * @returns {undefined}
   */
  loadData: function() {
    if (!this.get('isLoaded')) {
      let courseId = this.get('course.id');
      let unitId = this.get('unitId');
      let lessonId = this.get('lesson.id');

      return this.get('lessonService')
        .fetchById(courseId, unitId, lessonId)
        .then(
          function(lesson) {
            this.set('model.data', lesson);
            this.set('items', lesson.get('children'));
            this.set('isLoaded', true);
          }.bind(this)
        )
        .catch(
          function(error) {
            var message = this.get('i18n').t('common.errors.lesson-not-loaded')
              .string;
            this.get('notifications').error(message);
            Ember.Logger.error(error);
          }.bind(this)
        );
    } else {
      return Ember.RSVP.resolve(true);
    }
  },

  scrollHere: function() {
    const $component = Ember.$(this.get('element'));
    Ember.$('html, body').animate(
      {
        scrollTop: $component.offset().top - 200
      },
      100
    );
  },

  // -------------------------------------------------------------------------
  // Events

  /**
   * DidInsertElement ember event
   */
  didInsertElement: function() {
    const component = this;
    let unitId = this.get('unitId');
    let lessonId = this.get('lesson.id');
    const isEdit = unitId && lessonId;

    const expand =
      component.get('model.isExpanded') && isEdit && !this.get('isSorting');
    if (expand) {
      component.scrollHere();
      component.loadData();
    }
  }
});
