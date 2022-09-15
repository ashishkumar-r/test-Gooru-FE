import Ember from 'ember';
import GruImagePicker from 'gooru-web/components/gru-image-picker';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

/**
 * Image picker for content authoring
 *
 * Component responsible for letting the user select/preview an image using a
 * system file browser dialog. Used in the creation/edition of courses,
 * collections and assessments.
 *
 * @module
 * @augments components/gru-image-picker.js
 */
export default GruImagePicker.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'gru-image'],

  classNameBindings: [
    'isEditing:is-editing:is-viewing',
    'srcImage:has-src-image',
    'editImage:has-edit-image',
    'hasErrors:picker-error'
  ],

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * @function actions:resetImage
     */
    resetImage: function() {
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_CS_DELETE_THUMBNAIL
      );
      this.set('editImage', null);
      this.actions.resetPicker.call(this);
      this.sendAction('updateCoverImage', null);
      this.set('isFileInputEmpty', true);
    },

    prepareForSubmission: function(file) {
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_CS_UPDATE_THUMBNAIL
      );
      this.set('isFileInputEmpty', false);
      this.set('editImage', file);
      this.sendAction('updateCoverImage', file);
    },

    onAltText(e) {
      const controller = this;
      if (controller.get('model.metadata')) {
        controller.set('model.metadata.thumbnailAltText', e.target.value);
      }
    },

    onShowPreviewpop() {
      this.toggleProperty('isShowImagePreview');
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * Is the course being edited or not?
   * @property {Boolean}
   */
  isEditing: null,

  /**
   * @type {string} editImage - Edited image url
   */
  editImage: Ember.computed.alias('image'),

  /**
   * @type {boolean} hasErrors - if the picker has any errors
   */
  hasErrors: Ember.computed.notEmpty('filePickerErrors'),

  /**
   * @type {string} srcImage - Initial image url
   */
  srcImage: null,

  isShowImagePreview: false,

  enabledPreview: false,

  // -------------------------------------------------------------------------
  // Observers

  resetOnSave: function() {
    if (!this.get('isEditing')) {
      // Clear any previous errors
      this.get('filePickerErrors').clear();
      this.actions.resetPicker.call(this);
    }
  }.observes('isEditing'),

  didRender: function() {
    const $fileInput = this.$('input[type="file"]');
    if ($fileInput) {
      $fileInput.attr('title', 'uploadFile');
    }
  }
});
