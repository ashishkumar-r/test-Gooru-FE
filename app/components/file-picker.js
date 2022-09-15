import Ember from 'ember';
import FilePicker from 'ember-cli-file-picker/components/file-picker';
import { inferUploadType } from 'gooru-web/utils/utils';
import {
  OA_TASK_SUBMISSION_TYPES,
  FILE_MAX_SIZE_IN_MB
} from 'gooru-web/config/config';
import ConfigurationMixin from 'gooru-web/mixins/configuration';

export default FilePicker.extend(ConfigurationMixin, {
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @requires service:i18n
   */
  i18n: Ember.inject.service(),

  // -------------------------------------------------------------------------
  // Properties

  /**
   * Default handler when a file is removed
   * @type {Function}
   */
  onRemoveFile: null,

  // -------------------------------------------------------------------------
  // Methods

  /*
   * Validate the files per:
   * https://github.com/funkensturm/ember-cli-file-picker#validations
   */
  filesAreValid: function(files) {
    var file = files[0];
    var valid = true;

    // Clear any previous error messages
    this.get('errors').clear();
    const fileMaxSize =
      this.get('configuration.FILE_UPLOAD.MAX_SIZE_IN_MB') ||
      FILE_MAX_SIZE_IN_MB;
    const fileMaxSizeInBytes = parseInt(fileMaxSize) * 1024 * 1024;
    if (file.size > fileMaxSizeInBytes) {
      let errorMessage = this.get('i18n').t('common.errors.file-max-size', {
        fileMaxSize
      }).string;
      this.get('errors').addObject(errorMessage);
      valid = false;
    }

    if (!valid) {
      // Remove the image preview and run the handler for removing the image
      this.clearPreview();
      if (this.get('onRemoveFile')) {
        this.get('onRemoveFile')();
      }
    }

    return valid;
  },

  /**
   * When the file input changed (a file got selected)
   * Override original method to restore preview after selecting 'cancel' from the browser file dialog
   * @see https://github.com/funkensturm/ember-cli-file-picker/pull/18
   * @param  {Event} event The file change event
   */
  filesSelected: function(event) {
    var files = event.target.files;
    var extraParams = this.extraParams;
    if (files.length) {
      for (let i = 0; i < files.length; i++) {
        files[0].extraParam = extraParams;
      }
      this.handleFiles(files, extraParams);
    } else {
      // The user chose to cancel the image selection from the browser file window
      // so preview will be cleared along with any error messages there might have been
      this.clearPreview();
      this.get('errors').clear();
      if (this.get('onRemoveFile')) {
        this.get('onRemoveFile')();
      }
    }
  },

  /**
   * @override
   * @function addPreviewImage
   * @param file uploaded file object
   * Method to add preview thumbnail container to show image and other type based icons
   */
  addPreviewImage(file) {
    let fileType = inferUploadType(file.filename, OA_TASK_SUBMISSION_TYPES);
    fileType = fileType || OA_TASK_SUBMISSION_TYPES.findBy('value', 'others');
    let previewContainer = '';
    if (fileType.value === 'image') {
      previewContainer = this.$(
        `<img src="${file.data}" class="file-picker__preview__image ${
          this.get('multiple') ? 'multiple' : 'single'
        }">`
      );
    } else {
      previewContainer = this.$(
        `<i class="fa ${fileType.icon} file-preview-type-icon"></i>`
      );
    }

    this.hideProgress();
    this.$('.file-picker__preview').append(previewContainer);
  }
});
