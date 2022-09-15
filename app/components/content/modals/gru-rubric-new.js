import Ember from 'ember';
import Rubric from 'gooru-web/models/rubric/rubric';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies
  /**
  /**
   * @property {RubricService} Rubric service API SDK
   */
  rubricService: Ember.inject.service('api-sdk/rubric'),

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

  classNames: ['content', 'modals', 'gru-rubric-new'],

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Create Rubric
     */
    create: function() {
      const component = this;
      const rubric = component.get('rubric');
      component
        .get('validate')
        .call(component)
        .then(
          function({ validations }) {
            if (validations.get('isValid')) {
              component.set('isLoading', true);
              component
                .get('rubricService')
                .createRubric(rubric)
                .then(function(rubricId) {
                  component.closeModal(rubricId);
                  component
                    .get('parseEventService')
                    .postParseEvent(PARSE_EVENTS.CLICK_CREATE_RUBRIC);
                })
                .catch(function(error) {
                  var message = component
                    .get('i18n')
                    .t('common.errors.rubric-not-created').string;
                  component.get('notifications').error(message);
                  Ember.Logger.error(error);
                });
            }
            this.set('didValidate', true);
          }.bind(this)
        );
    }
  },
  // -------------------------------------------------------------------------
  // Methods
  /**
   * Validate rubric element
   */
  validate: function() {
    const rubric = this.get('rubric');
    return rubric.validate();
  },
  /**
   * Close gru-rubric-new modal
   */
  closeModal: function(rubricId) {
    this.set('isLoading', false);
    this.triggerAction({ action: 'closeModal' });
    const queryParams = { queryParams: { editing: true } };
    this.get('router').transitionTo(
      'content.rubric.edit',
      rubricId,
      queryParams
    );
  },
  /**
   * Show error message
   */
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
    var rubric = Rubric.create(Ember.getOwner(this).ownerInjection(), {
      title: null
    });
    this.set('rubric', rubric);
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @type {Rubric} rubric
   */
  rubric: null,

  /**
   * Indicate if it's waiting for createRubric callback
   */
  isLoading: false
});
