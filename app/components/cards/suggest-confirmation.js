import Ember from 'ember';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['cards', 'suggest-confirmation'],

  session: Ember.inject.service('session'),

  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  // -------------------------------------------------------------------------
  // Events

  didInsertElement() {
    let component = this;
    component.$('[data-toggle=popover]').popover({
      html: true,
      content: function() {
        return component.$('#suggestion-profile-details').html();
      }
    });
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * collection object
   * @type {Object}
   */
  collection: null,

  /**
   * Students list for suggestion
   * @type {Array}
   */
  students: Ember.A([]),

  /**
   * Maintains collection type
   * @type {String}
   */
  contentType: null,

  /**
   * more items number
   * @type {Number}
   */
  moreStudentsNumber: Ember.computed('students', function() {
    return this.get('students').length - this.get('defaultListStudentNumbers');
  }),

  /**
   * default list student count
   * @type {Number}
   */
  defaultListStudentNumbers: 3,

  /**
   * Defalut list students
   * @return {Array}
   */
  defaultStudentList: Ember.computed('students', function() {
    return this.get('students').slice(0, this.get('defaultListStudentNumbers'));
  }),

  /**
   * Checking is demo account
   */
  isGuestAccount: Ember.computed.alias('session.isGuest'),

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Trigger when cancel suggest  popup
     */
    onCancelSuggest() {
      this.sendAction('onCancelSuggest');
    },

    /**
     * Trigger when confirm suggest co popup
     */
    onConfirmSuggest() {
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.LEARNING_CHALLENGE_SUGGEST_TO_STUDENT
      );
      this.sendAction('onConfirmSuggest');
    }
  }
});
