import Ember from 'ember';
import Collection from 'gooru-web/models/content/collection';
import BuilderMixin from 'gooru-web/mixins/content/builder';
import ModalMixin from 'gooru-web/mixins/modal';

/**
 * Collection List
 *
 * Component responsible for listing a set of resources/questions
 *
 * @module
 * @augments content/courses/gru-accordion-course
 *
 */
export default Ember.Component.extend(BuilderMixin, ModalMixin, {
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @requires service:api-sdk/assessment
   */
  assessmentService: Ember.inject.service('api-sdk/assessment'),

  /**
   * @requires service:api-sdk/collection
   */
  collectionService: Ember.inject.service('api-sdk/collection'),

  /**
   * @property {Service} tenant service
   */
  tenantService: Ember.inject.service('api-sdk/tenant'),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'collections', 'gru-collection-list'],
  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Remove collection item
     */
    removeCollectionItem: function(builderItem) {
      const indexOfObject = this.get('items').findIndex(object => {
        return object.id === builderItem.id;
      });

      if (indexOfObject) {
        this.get('items').splice(indexOfObject, 1);
      }
      this.refreshOrderList();
    },

    /**
     * Remix collection item
     */
    remixCollectionItem: function(builderItem) {
      this.get('items').addObject(builderItem);
      this.refreshOrderList();
    },

    /**
     * Save reorder collection items
     */
    saveCollectionItemsOrder: function() {
      var component = this;
      const orderList = component.get('orderList');
      if (orderList) {
        if (this.get('isCollection')) {
          component
            .get('collectionService')
            .reorderCollection(
              component.get('model.id'),
              component.get('orderList')
            )
            .then(function() {
              component.actions.finishSort.call(component);
            });
        } else {
          component
            .get('assessmentService')
            .reorderAssessment(
              component.get('model.id'),
              component.get('orderList')
            )
            .then(function() {
              component.actions.finishSort.call(component);
            });
        }
      } else {
        component.actions.finishSort.call(component);
      }
    },

    openQuestion() {
      this.sendAction('updateContent');
      this.send(
        'showModal',
        'content.modals.gru-question-new',
        this.get('model'),
        null,
        'gru-question-new'
      );
    },

    openResource() {
      this.sendAction('updateContent');
      this.send(
        'showModal',
        'content.modals.gru-resource-new',
        this.get('model'),
        null,
        'gru-resource-new'
      );
    }
  },

  // -------------------------------------------------------------------------
  // Events

  /**
   * WillDestroyElement ember event
   */
  didRender() {
    $('[data-toggle="tooltip"]').tooltip();
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Boolean} isCollection - is this a listing for a collection or for an assessment
   */
  isCollection: Ember.computed('model', function() {
    return this.get('model') instanceof Collection;
  }),

  isShowMiniLesson: Ember.computed(function() {
    let tenantSettings = JSON.parse(
      this.get('tenantService').getStoredTenantSetting()
    );
    return (
      tenantSettings &&
      tenantSettings.ui_element_visibility_settings &&
      tenantSettings.ui_element_visibility_settings
        .show_mini_lesson_button_ca_card &&
      tenantSettings.ui_element_visibility_settings
        .show_mini_lesson_button_ca_card === true
    );
  })
});
