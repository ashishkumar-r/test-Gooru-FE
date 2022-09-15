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

  classNames: ['content', 'modals', 'gru-add-to'],

  classNameBindings: ['component-class'],

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Action triggered when a collection/assessment is selected
     */
    selectCollection: function(collection) {
      this.set('selectedCollection', collection);
      $('.gru-add-to .selected').removeClass('selected');
      $(`.${collection.id}`).addClass('selected');
    },

    /**
     * Action triggered when clicking add to
     */
    addTo: function() {
      this.$('.modal-footer button.add-to').prop('disabled', true);
      this.get('copyContent')
        .call(this)
        .then(this.get('addContent').bind(this))
        .then(this.get('successMessage').bind(this))
        .catch(this.get('errorMessage').bind(this));
    },

    /**
     * Action triggered to redirect to the collection/assessment player
     */
    openCollectionPlayer: function(collectionId) {
      this.get('router').transitionTo('player', collectionId);
      this.triggerAction({ action: 'closeModal' });
    }
  },
  // -------------------------------------------------------------------------
  // Events

  init() {
    this._super(...arguments);
    this.set('collections', this.get('model.collections'));
    this.set('content', this.get('model.content'));
  },

  // -------------------------------------------------------------------------
  // Properties
  /**
   * @type {?String} specific class
   */
  'component-class': null,

  /**
   * @type {String} selected collection/assessment ID
   */
  selectedCollection: null,

  /**
   * @type {String} selected collection/assessment ID
   */
  hasSelectedCollection: Ember.computed.notEmpty('selectedCollection'),

  /**
   * @type {List} user collections
   */
  collections: null,

  /**
   * @type {Resource/Question} resource, question or lesson needed to add
   */
  content: null,

  /**
   * @type {String} name of the collection type
   */
  collectionType: Ember.computed('selectedCollection', function() {
    return this.get('selectedCollection.isCollection')
      ? this.get('i18n').t('common.collection').string
      : this.get('i18n').t('common.assessment').string;
  })
});
