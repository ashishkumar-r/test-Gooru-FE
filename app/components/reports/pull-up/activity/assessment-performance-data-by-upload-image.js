import Ember from 'ember';
import TaxonomyTag from 'gooru-web/models/taxonomy/taxonomy-tag';
import TaxonomyTagData from 'gooru-web/models/taxonomy/taxonomy-tag-data';
import {
  addProtocolIfNecessary,
  generateUUID,
  isCompatibleVW
} from 'gooru-web/utils/utils';
import ModalMixin from 'gooru-web/mixins/modal';
import {
  SCREEN_SIZES,
  I2D_SUPPORTED_IMAGE_TYPES
} from 'gooru-web/config/config';
export default Ember.Component.extend(ModalMixin, {
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['assessment-performance-data-by-upload-image'],

  /**
   * @property {MediaService} Media service API SDK
   */
  mediaService: Ember.inject.service('api-sdk/media'),

  /**
   * @property {AssessmentService} assessment service API SDK
   */
  assessmentService: Ember.inject.service('api-sdk/assessment'),

  /**
   * @property {PerformanceService} performance service API SDK
   */
  performanceService: Ember.inject.service('api-sdk/performance'),

  /**
   * @property {SessionService} session service API SDK
   */
  session: Ember.inject.service('session'),

  /**
   * @requires service:notifications
   */
  notifications: Ember.inject.service(),

  /**
   * @type {i18nService} Service to retrieve translations information
   */
  i18n: Ember.inject.service(),

  /**
   * @property {I2dService} Media service API SDK
   */
  i2dService: Ember.inject.service('api-sdk/i2d'),

  // -------------------------------------------------------------------------
  // Properties
  /**
   * List of selected files
   * @prop {Array}
   */
  selectedFiles: Ember.A([]),

  /**
   * @property {String} timeZone
   */
  timeZone: Ember.computed(function() {
    return moment.tz.guess() || null;
  }),

  /**
   * @property {String} contentSource
   */
  contentSource: 'dailyclassactivity',

  /**
   * It maintains the preview content
   * @prop {Array}
   */
  activeContent: Ember.computed('activePreviewIndex', function() {
    const component = this;
    const activeIndex = component.get('activePreviewIndex');
    return component.get('selectedFiles').objectAt(activeIndex);
  }),

  /**
   * List of assessment questions
   * @prop {Array}
   */
  questions: Ember.A([]),

  /**
   * List of valid file extensions.
   * @prop {String}
   */
  mimeType: 'image/*',

  /**
   * It maintains the assessment Id.
   * @prop {String}
   */
  assessmentId: Ember.computed.alias('assessment.id'),

  /**
   * @property {Boolean} isMobileView
   * Property to handle is mobile view
   */
  isMobileView: isCompatibleVW(SCREEN_SIZES.MEDIUM),

  /**
   * It maintains the format
   * @prop {String}
   */
  format: Ember.computed.alias('assessment.format'),

  /**
   * It maintains the id of course.
   * @prop {String}
   */
  courseId: Ember.computed.alias('course.id'),

  /**
   * It maintains the activity id.
   * @prop {String}
   */
  activityId: Ember.computed.alias('activityData.id'),

  /**
   * It maintains the whether button is disable or not.
   * @prop {Boolean}
   */
  isDisableButton: false,

  /**
   * It maintains the index position of current preview image.
   * @prop {Integer}
   */
  activePreviewIndex: 0,

  /**
   * It maintains the whether we need to show confirm button or not.
   * @prop {Boolean}
   */
  showConfirm: false,

  /**
   * It maintains the whether we need to show toggle buttons or not.
   * @prop {Boolean}
   */
  showToggle: false,

  /**
   * @property {TaxonomyTag[]} List of taxonomy tags
   */
  taxonomyTags: Ember.computed('assessment.standards.[]', function() {
    var standards = this.get('assessment.standards');
    if (standards) {
      standards = standards.filter(function(standard) {
        return !TaxonomyTagData.isMicroStandardId(standard.get('id'));
      });
    }
    return TaxonomyTag.getTaxonomyTags(standards);
  }),

  // -------------------------------------------------------------------------
  // Observers
  resetPicker: Ember.observer('mimeType', function() {
    // Clear any previous errors
    this.get('filePickerErrors').clear();
  }),

  onError: Ember.observer('filePickerErrors.[]', function() {
    const errorMsg = this.get('i18n').t('common.errors.file-max-size');
    this.notifyInvalidFileType(errorMsg);
  }),
  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * Action triggered when user select any file.
     */
    prepareForSubmission(file) {
      const component = this;
      component.set('showConfirm', true);
      let selectedFiles = component.get('selectedFiles');
      component.readFile(file).then(function(fileData) {
        let uploadedFile = Ember.Object.create({
          file: fileData,
          url: fileData.data,
          name: fileData.name,
          isUploadSuccess: false
        });
        selectedFiles.pushObject(uploadedFile);
      });
    },

    /**
     * Action triggered when user select any file for re-upload.
     */
    prepareForReUpload(file) {
      const component = this;
      component.set('showConfirm', true);
      let selectedFile = component.get('selectedFile');
      component.readFile(file).then(function(fileData) {
        selectedFile.set('file', fileData);
        selectedFile.set('url', fileData.data);
        selectedFile.set('name', fileData.name);
        selectedFile.set('isUploadSuccess', false);
        selectedFile.set('isUploadReadyForReview', false);
        selectedFile.set('conversionErros', null);
        selectedFile.set('uploadStatus', 1);
      });
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
    },

    /**
     * Action triggered when user click re-upload button.
     */
    onReUpload(selectedFile) {
      const component = this;
      component.set('selectedFile', selectedFile);
    },

    /**
     * Action triggered when user confirms the upload.
     */
    onConfirmUpload() {
      const component = this;
      component.set('isDisableButton', true);
      component.uploadImageFiles();
    },

    /**
     * Action triggered when user select student score button.
     */
    showStudentScores() {
      const component = this;
      component.set('showScoreReview', true);
    },

    /**
     * Action triggered when user select image preview button.
     */
    showImagePreview() {
      const component = this;
      component.set('showScoreReview', false);
    },

    /**
     * Action triggered when user clicks on Ingore button.
     */
    onIgnore(selectedFile) {
      const component = this;
      component.get('selectedFiles').removeObject(selectedFile);
    },

    /**
     * Action triggered when user select confirm score button.
     */
    onConfirmScore() {
      const component = this;
      const performanceService = component.get('performanceService');
      const activeContent = component.get('activeContent');
      let students = component.get('studentList');
      let performancePromises = students.map(student => {
        return performanceService.updateCollectionOfflinePerformance(
          component.getAssessmentDataParams(student)
        );
      });
      Promise.all(performancePromises).then(() => {
        component
          .get('i2dService')
          .markImageReviewed(activeContent.get('id'))
          .then(() => {
            if (component.get('selectedFiles').length === 1) {
              component.sendAction('onClosePullUp');
            }
          });
      });
    }
  },

  // -------------------------------------------------------------------------
  // Methods
  init: function() {
    this._super(...arguments);
    this.set('filePickerErrors', Ember.A());
  },

  // -------------------------------------------------------------------------
  // Methods

  /**
   * It is used to convert the selected file to data url
   * @return {Promise Object}
   */
  readFile(file) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = function() {
        file.data = reader.result;
        resolve(file);
      };
      if (I2D_SUPPORTED_IMAGE_TYPES.validTypes.contains(file.type)) {
        reader.readAsDataURL(file);
      } else {
        const warningMsg = this.get('i18n').t(
          'common.errors.file-upload-missing',
          {
            extensions: I2D_SUPPORTED_IMAGE_TYPES.validExtensions
          }
        );
        this.notifyInvalidFileType(warningMsg);
        reject();
      }
    });
  },

  /**
   * It is used to upload the selected filees to s3 and BE
   */
  uploadImageFiles() {
    const component = this;
    if (component.get('isMobileView')) {
      component.handleMobileViewControl();
      component.set('isUpload', true);
    }
    let selectedFiles = component.get('selectedFiles').filterBy('file');
    let filePromises = selectedFiles.map(selectedFile => {
      return new Ember.RSVP.Promise(function(resolve, reject) {
        return component
          .get('mediaService')
          .uploadContentFile(selectedFile.get('file'))
          .then(
            imageId => {
              selectedFile.set('isUploadSuccess', true);
              selectedFile.set('isUploadFailed', false);
              resolve(
                Ember.Object.create({
                  url: addProtocolIfNecessary(imageId),
                  id: selectedFile.get('id')
                })
              );
            },
            error => {
              selectedFile.set('isUploadSuccess', false);
              selectedFile.set('isUploadFailed', true);
              component.set('showError', true);
              reject(error);
            }
          );
      });
    });
    Promise.all(filePromises).then(imagePaths => {
      let reUploadedFiles = imagePaths.filterBy('id');
      let uploadedFiles = imagePaths
        .rejectBy('id')
        .map(image => image.get('url'));
      if (reUploadedFiles.length) {
        reUploadedFiles.map(uploadFile => {
          let request = Ember.Object.create({
            image_path: uploadFile.get('url')
          });
          component
            .get('i2dService')
            .replaceImage(uploadFile.get('id'), request)
            .then(() => {
              component.notifyUploadSuccess();
            });
        });
      }
      if (uploadedFiles.length) {
        const imageUploadContext = component.get('imageUploadContext');
        imageUploadContext.set('image_path', uploadedFiles);
        component
          .get('i2dService')
          .uploadImage(imageUploadContext)
          .then(() => {
            let model = {
              onConfirm: function() {
                component.sendAction('onClosePullUp');
              }
            };
            component.actions.showModal.call(
              component,
              'content.modals.i2d-message-dialog',
              model
            );
          });
      }
    });
  },

  /**
   * This method is used to handle mobile view
   */
  handleMobileViewControl() {
    const component = this;
    component.$('.left-panel').show();
    component.$('.right-panel').hide();
  },

  /**
   * This method is used to trigger toast message
   */
  notifyUploadSuccess() {
    const component = this;
    component.get('notifications').setOptions({
      positionClass: 'toast-top-full-width',
      toastClass: 'gooru-toast',
      timeOut: 10000
    });
    const successMsg = component.get('i18n').t('upload-success');
    component.get('notifications').success(`${successMsg}`);
  },

  /**
   * This method is used to trigger toast message
   */
  notifyInvalidFileType(message) {
    const component = this;
    component.get('notifications').setOptions({
      positionClass: 'toast-top-full-width',
      toastClass: 'gooru-toast',
      timeOut: 10000
    });
    component.get('notifications').warning(`${message}`);
  },

  /**
   * @function getAssessmentDataParams
   */
  getAssessmentDataParams(student) {
    let component = this;
    let questions = student.get('questions');
    let assessmentResources = Ember.A([]);
    let activityData = component.get('activityData');
    let activityId = activityData.get('id');
    let conductedOn = component.get('activityData.activation_date')
      ? new Date(component.get('activityData.activation_date'))
      : new Date();
    let classId = component.get('classId');
    let assessment = component.get('assessment');
    let courseId = component.get('course') ? component.get('course').id : null;
    questions.map(question => {
      let resourceData = {
        resource_id: question.get('questionId'),
        resource_type: 'question',
        question_type: question.get('questionType'),
        score: Number(question.get('score')) || 0,
        max_score: question.get('maxScore')
      };
      assessmentResources.push(resourceData);
    });
    let studentPerformanceData = {
      tenant_id: component.get('session.tenantId') || null,
      student_id: student.get('userId'),
      session_id: generateUUID(),
      class_id: classId,
      collection_id: assessment.get('id'),
      collection_type: 'assessment',
      content_source: component.get('contentSource'),
      time_zone: component.get('timeZone'),
      conducted_on: conductedOn.toISOString(),
      path_id: 0,
      path_type: null,
      resources: assessmentResources,
      course_id: courseId,
      additionalContext: btoa(
        JSON.stringify({
          dcaContentId: activityId
        })
      )
    };
    return studentPerformanceData;
  }
});
