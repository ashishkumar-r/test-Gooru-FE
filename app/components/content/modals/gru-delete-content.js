import Ember from 'ember';
import { CONTENT_TYPES } from 'gooru-web/config/config';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

/**
 * Delete content component
 *
 * Component responsible for delete a content from content builder
 *
 * @module
 * @augments ember/Component
 */
export default Ember.Component.extend({
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

  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'modals', 'gru-delete-content'],
  // -------------------------------------------------------------------------
  // Events
  init() {
    this._super(...arguments);
    // 'validator' should never be set as a param except for testing
    var validator = this.get('validator');
    if (!validator) {
      this.set(
        'validator',
        Ember.Object.create({
          confirm: '',
          check1: false,
          check2: false,
          check3: false
        })
      );
    } else {
      this.set('validator', validator);
    }
  },
  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Delete Content
     */
    deleteContent: function(model) {
      let component = this;
      component.set('isLoading', true);
      let contentKey;
      if (model.type === 'course') {
        contentKey = PARSE_EVENTS.COURSE_DELETE;
      } else if (model.type === 'collection') {
        contentKey = PARSE_EVENTS.COLLECTION_DELETE;
      } else if (model.type === 'assessment') {
        contentKey = PARSE_EVENTS.ASSESSMENT_DELETE;
      } else if (model.type === 'activity') {
        contentKey = PARSE_EVENTS.OA_ACTIVITY;
      }
      this.get('parseEventService').postParseEvent(contentKey);

      // This deleteMethod will be a wrapper around the actual delete method that is particular to
      // each question type.
      model
        .deleteMethod()
        .then(function() {
          if (model.callback) {
            model.callback.success();
          }
          component.set('isLoading', false);
          component.triggerAction({
            action: 'closeModal'
          });

          if (model.redirect) {
            component.get('router').transitionTo(model.redirect.route, {
              queryParams: {
                profileId: model.redirect.params.profileId,
                type: model.redirect.params.type,
                activeContentType: model.type
              }
            });
          }
        })
        .catch(function(error) {
          var message = component
            .get('i18n')
            .t('content.modals.delete-content.delete-error', {
              type: component
                .get('i18n')
                .t(`common.${model.type}`)
                .string.toLowerCase()
            }).string;
          component.get('notifications').error(message);
          Ember.Logger.error(error);
        });
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * This is the model used to delete.
   * @property {model}
   */
  model: null,

  /**
   * Content types.
   */
  types: CONTENT_TYPES,

  /**
   * Object to control when the delete button becomes enabled
   * @property {model}
   */
  validator: null,

  /**
   * Indicate if it's waiting for deleteMethod callback
   */
  isLoading: false,

  /**
   * Indicate if delete button is disabled
   */
  isDisabled: Ember.computed(
    'validator.{confirm,check1,check2,check3}',
    function() {
      var areChecked =
        this.get('validator.check1') && this.get('validator.check2');
      if (!this.get('hasNoWarning')) {
        areChecked = areChecked && this.get('validator.check3');
      }
      const isConfirm =
        this.get('validator.confirm').toUpperCase() === 'DELETE';
      return !(areChecked && isConfirm);
    }
  ),
  /**
   * Indicate if the modal has warning
   */
  hasNoWarning: Ember.computed('model.type', function() {
    return (
      this.get('model.type') === 'question' ||
      this.get('model.type') === 'resource'
    );
  })
});
