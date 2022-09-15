import Ember from 'ember';

export default Ember.Component.extend({
  /**
   * Added class attributes
   */
  classNames: ['gru-add-content-popup-card'],

  /**
   * @property {Object} activeActivityContent hold the active content details
   */
  activeActivityContent: null,

  /**
   * @property {Object} isUpdateCard used to check update
   */
  isUpdateCard: false,

  /**
   * @property {Boolean} isAddActivity used to toggle activity popup
   */
  isAddActivity: false,

  /**
   * @property {Boolean} isAddActivity used to toggle activity popup
   */
  isConferenceAllow: false,

  /**
   * @property {Boolean} hasVideoConference used to toggle activity popup
   */
  hasVideoConference: Ember.computed('isUpdateCard', function() {
    return !!this.get('isUpdateCard');
  }),

  /**
   * @property {String} updateThumbanil
   */
  updateThumbnailUrl: Ember.computed('isUpdateCard', function() {
    let content = this.get('activeActivityContent');
    return content.get('collection.thumbnailUrl');
  }),

  actions: {
    /**
     * @function onClose
     */
    onClose() {
      this.set('isAddActivity', false);
    },

    /**
     * @function onAddActivity  add class activity
     */
    onAddActivity(content) {
      this.set('isAddActivity', false);
      this.sendAction('onAddActivity', content);
    },

    /**
     * @function onToggleCheckbox  action trigger when click toggle checkbox
     */
    onToggleCheckbox() {
      this.set('isConferenceAllow', true);
    },

    /**
     * @function onDeny  action trigger when click deny
     */
    onDeny() {
      this.set('isConferenceAllow', false);
      this.set('hasVideoConference', false);
    },
    /**
     * @function onDeny  action trigger when click deny
     */
    onAllow() {
      this.set('isConferenceAllow', false);
      this.set('hasVideoConference', true);
    }
  }
});
