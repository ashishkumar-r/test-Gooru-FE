import Ember from 'ember';
import BuilderItem from 'gooru-web/models/content/builder/item';
import TaxonomyTag from 'gooru-web/models/taxonomy/taxonomy-tag';
import TaxonomyTagData from 'gooru-web/models/taxonomy/taxonomy-tag-data';
import Lesson from 'gooru-web/models/content/lesson';
import PlayerAccordionUnit from 'gooru-web/components/content/courses/play/gru-accordion-unit';
import ModalMixin from 'gooru-web/mixins/modal';
import { CONTENT_TYPES } from 'gooru-web/config/config';
import { etlSecCalculation } from 'gooru-web/utils/utils';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';

/**
 * Content Builder: Accordion Unit
 *
 * Component responsible for behaving as an accordion and listing a set of lessons.
 * It is meant to be used inside of an {@link ./gru-accordion-course|Accordion Course}
 *
 * @module
 * @augments components/content/courses/play/gru-accordion-unit
 *
 */
export default PlayerAccordionUnit.extend(ModalMixin, TenantSettingsMixin, {
  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @requires service:api-sdk/unit
   */
  unitService: Ember.inject.service('api-sdk/unit'),

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    add: function() {
      this.loadData().then(
        function() {
          this.actions.addLesson.call(this);
          this.get('onExpandUnit')(this.get('unit.id'), true);
          this.set('model.isExpanded', true);
        }.bind(this)
      );
    },

    addLesson: function() {
      var lesson = Lesson.create(Ember.getOwner(this).ownerInjection(), {
        title: null
      });
      var builderItem = BuilderItem.create({
        isEditing: true,
        data: lesson
      });
      this.get('items').pushObject(builderItem);
      this.refreshOrderList();
    },

    cancelAddLesson: function(builderItem) {
      this.get('items').removeObject(builderItem);
      builderItem.destroy();
      this.refreshOrderList();
    },

    /**
     * Load the data for this unit (data should only be loaded once)
     *
     * @function actions:selectUnit
     */
    cancelEdit: function() {
      if (this.get('model.isNew')) {
        this.get('onCancelAddUnit')(this.get('model'));
      } else {
        this.set('model.isEditing', false);
      }
    },

    copy: function() {
      var model = {
        content: this.get('unit'),
        courseId: this.get('course.id'),
        onRemixSuccess: this.get('onRemixUnit')
      };
      this.send('showModal', 'content.modals.gru-unit-remix', model);
    },

    /**
     * Delete selected unit
     *
     */
    deleteItem: function(builderItem) {
      let component = this;
      var model = {
        content: this.get('unit'),
        index: this.get('index'),
        parentName: this.get('course.title'),
        deleteMethod: function() {
          return this.get('unitService').deleteUnit(
            this.get('course.id'),
            this.get('unit.id')
          );
        }.bind(this),
        type: CONTENT_TYPES.UNIT,
        callback: {
          success: function() {
            component.get('onDeleteUnit')(builderItem);
          }
        }
      };
      this.actions.showModal.call(
        this,
        'content.modals.gru-delete-content',
        model
      );
    },

    edit: function() {
      this.loadData().then(
        function() {
          var unitForEditing = this.get('unit').copy();
          this.set('tempUnit', unitForEditing);
          this.set('model.isEditing', true);
        }.bind(this)
      );
    },

    openDomainPicker: function() {
      var component = this;
      var domains = this.get('tempUnit.taxonomy').slice(0);
      var subject = this.get('course.mainSubject');
      var subjectDomains = TaxonomyTagData.filterBySubject(subject, domains);
      var notInSubjectDomains = TaxonomyTagData.filterByNotInSubject(
        subject,
        domains
      );
      var shortcuts = TaxonomyTagData.filterBySubject(
        subject,
        this.get('course.taxonomy')
      );

      var model = {
        selected: subjectDomains,
        shortcuts: shortcuts,
        subject: subject,
        callback: {
          success: function(selectedTags) {
            var taxonomyList = component.get('tempUnit.taxonomy');
            var dataTags = selectedTags.map(function(taxonomyTag) {
              return taxonomyTag.get('data');
            });

            Ember.beginPropertyChanges();
            taxonomyList.clear();
            taxonomyList.pushObjects(dataTags);
            taxonomyList = taxonomyList.uniqBy('id');
            taxonomyList.pushObjects(notInSubjectDomains);
            Ember.endPropertyChanges();
          }
        }
      };

      this.actions.showModal.call(
        this,
        'taxonomy.modals.gru-domain-picker',
        model,
        null,
        'gru-domain-picker'
      );
    },

    /**
     * Remove Lesson from a list of lessons
     */
    removeLesson: function(builderItem) {
      this.get('items').removeObject(builderItem);
      this.refreshOrderList();
    },

    /**
     * Remove tag data from the taxonomy list in tempUnit
     */
    removeTag: function(taxonomyTag) {
      var tagData = taxonomyTag.get('data');
      this.get('tempUnit.taxonomy').removeObject(tagData);
    },

    /**
     * Remix Lesson from a list of lessons
     */
    remixLesson: function(lesson) {
      var builderItem = BuilderItem.create({
        isEditing: false,
        data: lesson
      });
      this.get('items').pushObject(builderItem);
      this.refreshOrderList();
    },

    saveUnit: function() {
      var courseId = this.get('course.id');
      var editedUnit = this.get('tempUnit');
      var unitService = this.get('unitService');
      const etlHrs = editedUnit.get('expectedhours');
      const etlMins = editedUnit.get('expectedminutes');
      etlSecCalculation(editedUnit, etlHrs, etlMins);
      editedUnit.validate().then(
        function({ validations }) {
          if (validations.get('isValid')) {
            // Saving an existing unit or a new unit (false id)?
            let savePromise = editedUnit.get('id')
              ? unitService.updateUnit(courseId, editedUnit)
              : unitService.createUnit(courseId, editedUnit);

            savePromise
              .then(
                function() {
                  this.get('unit').merge(editedUnit, [
                    'id',
                    'title',
                    'bigIdeas',
                    'essentialQuestions',
                    'expectedhours',
                    'expectedminutes'
                  ]);
                  this.set(
                    'unit.taxonomy',
                    editedUnit.get('taxonomy').toArray()
                  );
                  this.set('model.isEditing', false);
                }.bind(this)
              )
              .catch(
                function(error) {
                  var message = this.get('i18n').t(
                    'common.errors.unit-not-created'
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

    sortLessons: function() {
      this.loadData();
      var items = this.get('items');
      items.forEach(function(item) {
        item.set('isExpanded', false);
      });
      this.actions.sortItems.call(this);
    },

    saveLessonsOrder: function() {
      var courseId = this.get('course.id');
      var unitId = this.get('unit.id');
      var orderList = this.get('orderList');

      if (orderList && orderList.length > 1) {
        this.get('unitService')
          .reorderUnit(courseId, unitId, orderList)
          .then(
            function() {
              this.actions.finishSort.call(this);
            }.bind(this)
          );
      } else {
        this.actions.finishSort.call(this);
      }
    }
  },

  // -------------------------------------------------------------------------
  // Events

  init() {
    this._super(...arguments);
    if (this.get('unit') && !this.get('unit.id')) {
      // If this a new unit, set the tempUnit value so things don't break in edit mode
      let unitForEditing = this.get('unit').copy();
      this.set('tempUnit', unitForEditing);
    }
  },

  // -------------------------------------------------------------------------
  // Attributes

  attributeBindings: ['data-id'],

  'data-id': Ember.computed.alias('unit.id'),

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {TaxonomyTag[]} selectedTags - List of domain tags assigned to this unit
   */
  selectedTags: Ember.computed('tempUnit.taxonomy.[]', function() {
    return this.get('tempUnit.taxonomy').map(function(tagData) {
      return TaxonomyTag.create({
        isActive: true,
        isReadonly: true,
        isRemovable: true,
        data: tagData
      });
    });
  }),

  /**
   * @prop {Content/Unit} tempUnit - Temporary unit model used for editing
   */
  tempUnit: null
});
