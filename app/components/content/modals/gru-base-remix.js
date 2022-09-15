import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

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

  classNames: ['content', 'modals', 'gru-base-remix'],

  classNameBindings: ['component-class'],
  // -------------------------------------------------------------------------
  // Actions

  actions: {
    remix: function() {
      const component = this;
      const contentModel = this.get('contentModel');
      contentModel.validate().then(function({ validations }) {
        if (validations.get('isValid')) {
          component.beforeCopy();
          component
            .get('copyContent')
            .call(component, contentModel)
            .then(function(contentId) {
              contentModel.set('id', contentId);
              return component
                .get('updateContent')
                .call(component, contentModel)
                .then(function() {
                  component.afterCopy(contentModel);
                }, component.get('showFailureNotification').bind(component));
            });
        }
        component.set('didValidate', true);
      });
    }
  },

  // -------------------------------------------------------------------------
  // Events

  init() {
    this._super(...arguments);
    this.set('contentModel', this.get('model.content').copy());
    this.set('onRemix', this.get('model.onRemixSuccess'));
  },

  // -------------------------------------------------------------------------
  // Methods
  beforeCopy: function() {
    Ember.Logger.warn('This function can be overwrite');
  },

  afterCopy: function(contentModel) {
    const component = this;
    component.closeModal();
    component.notifyCopy(contentModel);
  },

  closeModal: function() {
    const component = this;
    component.triggerAction({
      action: component.get('onCloseModal')
    });
  },

  notifyCopy: function(contentModel) {
    const component = this;
    component.get('notifications').setOptions({
      positionClass: 'toast-top-full-width',
      toastClass: 'gooru-toast',
      timeOut: 10000
    });
    if (component.get('onRemix')) {
      component.get('onRemix')(contentModel);
    }
    component.get('showSuccessNotification').call(component, contentModel);
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @type {?String} specific class
   */
  'component-class': null,

  /**
   * @type {Course/Collection/Assessment} contentModel
   */
  contentModel: null,

  /**
   * Function to call on remix success
   */
  onRemix: null,

  /**
   * Class handling the actions from the component.
   * This value will be set on instantiation by gru-modal.
   *
   * @type {Ember.Component}
   * @private
   */
  target: null,

  onCloseModal: 'closeModal'
});
