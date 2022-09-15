import Ember from 'ember';
import BuilderItem from 'gooru-web/models/content/builder/item';
import BuilderMixin from 'gooru-web/mixins/content/builder';
import TaxonomyTag from 'gooru-web/models/taxonomy/taxonomy-tag';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';

/**
 * Course content viewer: Accordion Unit
 *
 * Component responsible for behaving as an accordion and listing a set of lessons.
 * It is meant to be used inside of an {@link ./gru-accordion-course|Accordion Course}
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
   * @requires service:notifications
   */
  notifications: Ember.inject.service(),

  /**
   * @requires service:api-sdk/unit
   */
  unitService: Ember.inject.service('api-sdk/unit'),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'courses', 'gru-accordion', 'gru-accordion-unit'],

  classNameBindings: ['model.isEditing:edit:view'],

  tagName: 'li',

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    toggle: function() {
      var toggleValue = !this.get('model.isExpanded');
      const id = this.get('model.data.id');

      this.set('viewUnitDetails', false);
      this.loadData();
      this.get('onExpandUnit')(id, toggleValue);
      this.set('model.isExpanded', toggleValue);
    },

    expandLesson: function(lessonId, expanded) {
      const id = this.get('model.data.id');
      this.get('onExpandLesson')(id, lessonId, expanded);
    }
  },

  // -------------------------------------------------------------------------
  // Events
  onDidInsertElement: Ember.on('didInsertElement', function() {
    const expanded = this.get('model.isExpanded');
    if (expanded) {
      this.scrollHere();
      this.loadData();
    }
  }),

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @prop {String} course - Course this unit belongs to
   */
  course: null,

  /**
   * @prop {Boolean} isLoaded - Has the data for the unit already been loaded
   */
  isLoaded: false,

  /**
   * @prop {Content/Unit} unit
   */
  unit: Ember.computed.alias('model.data'),

  /**
   * @property {string} selected lesson id
   */
  selectedLessonId: null,

  /**
   * When a unit is expanded/collapsed
   */
  onExpandUnit: null,

  /**
   * When a lesson within this unit is expanded/collapsed
   */
  onExpandLesson: null,

  /**
   * @property {TaxonomyTag[]} List of taxonomy tags
   */
  tags: Ember.computed('unit.taxonomy.[]', function() {
    return TaxonomyTag.getTaxonomyTags(this.get('unit.taxonomy'), false);
  }),

  /**
   * @property {Boolean} view unit details
   */
  viewUnitDetails: false,

  // -------------------------------------------------------------------------
  // Methods

  /**
   * Load data for the unit
   *
   * @function actions:loadData
   * @returns {undefined}
   */
  loadData: function() {
    const component = this;
    if (!component.get('isLoaded')) {
      let courseId = component.get('course.id');
      let unitId = component.get('unit.id');
      let lessonId = component.get('selectedLessonId');
      return component
        .get('unitService')
        .fetchById(courseId, unitId)
        .then(function(unit) {
          component.set('model.data', unit);

          // Wrap every lesson inside of a builder item
          var children = unit.get('children').map(function(lesson) {
            return BuilderItem.create({
              data: lesson,
              isExpanded: lessonId === lesson.get('id')
            });
          });
          component.set('items', children);
          component.set('isLoaded', true);
        })
        .catch(function(error) {
          var message = component.get('i18n').t('common.errors.unit-not-loaded')
            .string;
          component.get('notifications').error(message);
          Ember.Logger.error(error);
        });
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
  }
});
