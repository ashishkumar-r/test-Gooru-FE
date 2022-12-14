import Ember from 'ember';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

/**
 * File picker
 *
 * Component responsible for letting the user select a file using a
 * system file browser dialog. Only certain file types are allowed;
 * otherwise an error is presented to the user.
 *
 * @module
 * @augments ember/Component
 */
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'gru-file-picker'],

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * @function actions:enableButtons
     */
    prepareForSubmission(file) {
      this.set('selectedFile', file);
      this.get('onSelectFile')(file, this);
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.PROFILE_ABOUT_UPLOAD_IMAGE
      );
    },

    /**
     * @function actions:disableButtons
     */
    resetFileSelection() {
      // Reset the input element in the file picker
      // http://stackoverflow.com/questions/1043957/clearing-input-type-file-using-jquery/13351234#13351234
      var $fileInput = this.$('input[type="file"]');
      $fileInput
        .wrap('<form>')
        .closest('form')
        .get(0)
        .reset();
      $fileInput.unwrap();

      this.set('selectedFile', null);
      this.get('onSelectFile')(null);
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.PROFILE_ABOUT_REMOVE_IMAGE
      );
    }
  },

  init: function() {
    this._super(...arguments);
    this.set('filePickerErrors', Ember.A());
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * Selected file
   * @prop {Object}
   */
  selectedFile: null,

  /**
   * Has a file been selected and loaded into the file picker?
   * @prop {Bool}
   */
  isFileLoaded: Ember.computed.notEmpty('selectedFile'),

  /**
   * List of error messages to present to the user for conditions that the loaded image does not meet
   * @prop {String[]}
   */
  filePickerErrors: null,

  /**
   * List of valid file extensions.
   * @prop {String}
   */
  validMimeType: '',

  // -------------------------------------------------------------------------
  // Observers

  resetPicker: Ember.observer('validMimeType', function() {
    // Clear any previous errors
    this.get('filePickerErrors').clear();
  })
});
