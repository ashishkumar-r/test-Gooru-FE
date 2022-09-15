import Ember from 'ember';
import ModalMixin from 'gooru-web/mixins/modal';

/**
 * Player navigator
 *
 * Component responsible for enabling more flexible navigation options for the player.
 * For example, where {@link player/gru-navigation.js}} allows selecting only
 * the previous or the next content item, the navigator allows navigation to
 * any of the content items available.
 *
 * @module
 * @see controllers/player.js
 * @augments ember/Component
 */
export default Ember.Component.extend(ModalMixin, {
  // -------------------------------------------------------------------------
  // Dependencies
  session: Ember.inject.service('session'),

  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['gru-navigator'],

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     *
     * Triggered when an item is selected
     * @param item
     */
    selectItem: function(item) {
      this.selectItem(item.resource);
    },
    /**
     * Action triggered when the user close the content player
     */
    closePlayer: function() {
      this.sendAction('onClosePlayer');
    },
    /**
     * Action triggered when the user close de navigator panel
     */
    closeNavigator: function() {
      this.sendAction('onCloseNavigator');
    },

    /**
     * Action triggered when the user clicks at see usage report
     */
    seeUsageReport: function() {
      this.sendAction('onFinishCollection');
    },

    /**
     * Action triggered to remix a collection
     */
    remixCollection: function() {
      if (this.get('session.isAnonymous')) {
        this.send('showModal', 'content.modals.gru-login-prompt');
      } else {
        let collection = this.get('originalCollection')
          ? this.get('originalCollection')
          : this.get('collection');
        this.sendAction('onRemixCollection', collection);
      }
    },
    /**
     * Action triggered when the user wants to finish the collection
     */
    finishCollection: function() {
      this.sendAction('onFinishCollection');
    }
  },

  // -------------------------------------------------------------------------
  // Events

  /**
   * DidInsertElement ember event
   */
  setupSubscriptions: Ember.on('didInsertElement', function() {
    /*TODO: Try to reduce the scope of this method binding

     Ember uses a technique called event delegation. This allows the framework to set up a global, shared event listener instead of requiring each view to do it manually. For example, instead of each view registering its own mousedown listener on its associated element, Ember sets up a mousedown listener on the body.

     If a mousedown event occurs, Ember will look at the target of the event and start walking up the DOM node tree, finding corresponding views and invoking their mouseDown method as it goes.
     */
    /* TODO: Remove due to conflicts when there's an input in a question?
    this.$(document).on('keyup', { _self: this }, this.navigateOnKeyUp);
    */
  }),

  removeSubscriptions: Ember.on('willDestroyElement', function() {
    /* TODO: Remove due to conflicts when there's an input in a question?
    this.$(document).off('keyup');
     */
  }),

  // -------------------------------------------------------------------------
  // Properties
  /**
   * @property {Collection} collection
   */
  collection: null,

  /**
   * Should resource links in the navigator be disabled?
   * @property {Lesson}
   */
  isNavigationDisabled: false,

  /**
   * @property {String|Function} onItemSelected - event handler for when an item is selected
   */
  onItemSelected: null,

  /**
   * @property {String} selectedResourceId - resource Id selected
   */

  selectedResourceId: null,

  /**
   * Resource result for the selected resource
   * @property {ResourceResult}
   */
  resourceResults: Ember.A([]),

  /**
   * A convenient structure to render the menu
   * @property
   */
  resourceItems: Ember.computed(
    'collection',
    'resourceResults.[]',
    'selectedResourceId',
    function() {
      let component = this;
      let collection = component.get('collection');
      let resourceResults = component.get('resourceResults');
      let items = resourceResults.map(function(resourceResult) {
        let resourceId = resourceResult.get('resource.id');
        return {
          resource: collection.getResourceById(resourceId),
          started: resourceResult.get('started'),
          selected: resourceId === component.get('selectedResourceId')
        };
      });
      return items;
    }
  ),

  /**
   * Indicates if the remix button is shown or not
   * @property {boolean}
   */
  showRemixButton: Ember.computed(
    'hasContext',
    'isTeacher',
    'showRemix',
    function() {
      return (
        (this.get('hasContext') && this.get('isTeacher')) ||
        (!this.get('hasContext') && this.get('showRemix'))
      );
    }
  ),

  /**
   * Contains the lesson title for this navigation, it is passed as a parameter
   * @property {string}
   */

  lessonTitle: null,

  /**
   * @property {string} on content player action
   */
  onClosePlayer: 'onClosePlayer',

  /**
   * @property {string} on finish collection, having type = 'collection'
   */
  onFinishCollection: null,

  /**
   * Indicates when the collection is already submitted
   * @property {boolean}
   */
  submitted: false,

  /**
   * Indicates if the report is visible
   * @property {boolean} showReportLink
   */
  showReportLink: true,

  /**
   * Indicates if the back link is visible
   * @property {boolean} showBackLink
   */
  showBackLink: true,

  /**
   * Indicates if the remix button is visible
   * @property {boolean} showRemix
   */
  showRemix: true,

  /**
   * Indicates if the collection name is visible
   * @property {boolean} showCollectionName
   */
  showCollectionName: true,

  /**
   * Indicates if the resource number is visible
   * @property {boolean} showResourceNumber
   */
  showResourceNumber: true,

  /**
   * Indicates if the navigator menu is going to be collapsed
   * @property {Boolean}
   */
  collapsedMenu: false,

  // -------------------------------------------------------------------------
  // Observers

  // -------------------------------------------------------------------------

  // Methods

  /* TODO: Remove due to conflicts when there's an input in a question?
  navigateTo: function(directionMethod) {
    const collection = this.get("collection");
    const resource = collection.getResourceById(this.get('selectedResourceId'));
    this.selectItem(collection[directionMethod](resource));
  },
  */

  /**
   * Triggered when a key is released from press
   * @param {Event object} event
   */
  /* TODO: Remove due to conflicts when there's an input in a question?
  navigateOnKeyUp: function(e) {
    if (e.which === KEY_CODES.RIGHT || e.which === KEY_CODES.LEFT){
      e.preventDefault();
      if (e.which === KEY_CODES.RIGHT){
        e.data._self.navigateTo('nextResource');
      }else if (e.which === KEY_CODES.LEFT){
        e.data._self.navigateTo('prevResource');
      }
      return false;
    }
  },
  */

  /**
   * Triggered when a resource item is selected
   * @param {Resource} resource
   */
  selectItem: function(resource) {
    if (resource && !this.get('isNavigationDisabled')) {
      if (this.get('onItemSelected')) {
        this.sendAction('onItemSelected', resource);
      }
      this.sendAction('onCloseNavigator');
    }
  }
});
