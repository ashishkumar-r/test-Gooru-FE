import Ember from 'ember';
import { CONTENT_TYPES } from 'gooru-web/config/config';
import { cleanFilename } from 'gooru-web/utils/utils';
import ConfigurationMixin from 'gooru-web/mixins/configuration';

export default Ember.Component.extend(ConfigurationMixin, {
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['add-data', 'add-student-performance-data'],

  /**
   * @property {I2dService} Media service API SDK
   */
  i2dService: Ember.inject.service('api-sdk/i2d'),

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * Action triggered when teacher close the pull up.
     */
    onClosePullUp() {
      this.sendAction('onClosePullUp');
    },

    /**
     * Action triggered when teacher selected a option.
     */
    onSelectOption(option) {
      this.set('selectedOption', option.name);
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * It maintains the assessment Id.
   * @prop {String}
   */
  collectionId: Ember.computed.alias('collection.id'),

  /**
   * It maintains the format
   * @prop {String}
   */
  format: Ember.computed.alias('collection.format'),

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
   * It maintains the class id.
   * @prop {String}
   */
  classId: Ember.computed.alias('class.id'),

  /**
   * It maintains the class code.
   * @prop {String}
   */
  classCode: Ember.computed.alias('class.code'),

  /**
   * It maintains the uploaded files.
   * @prop {Array}
   */
  uploadedFiles: Ember.A([]),

  /**
   * It maintains the content is whether assessment or not
   * @prop {String}
   */
  isAsessmentAddData: Ember.computed('contentType', function() {
    const component = this;
    const contentType = component.get('contentType');
    return (
      contentType === CONTENT_TYPES.ASSESSMENT ||
      contentType === CONTENT_TYPES.EXTERNAL_ASSESSMENT
    );
  }),

  /**
   * It decides whether we need to allow i2d flow or not
   * @prop {Boolean}
   */
  allowI2D: Ember.computed.alias('configuration.GRU_FEATURE_FLAG.i2dFlow'),

  /**
   * It maintains the state of selected option
   * @prop {String}
   */
  selectedOption: Ember.computed('allowI2D', function() {
    return !this.get('allowI2D') ? 'question' : null;
  }),

  // -------------------------------------------------------------------------
  // Events
  init() {
    const component = this;
    component._super(...arguments);
    if (component.get('isAsessmentAddData') && component.get('allowI2D')) {
      component.searchImageUpload();
    }
    component.set('uploadedFiles', Ember.A());
  },
  // -------------------------------------------------------------------------
  //Methods

  /**
   * It fetch uploaded data for the selected add-data content
   */
  searchImageUpload() {
    const component = this;
    component.set('isLoading', true);
    component
      .get('i2dService')
      .searchImage(component.serializeUploadContext())
      .then(result => {
        component.set('isLoading', false);
        if (result.length) {
          const errorList = result.filter(item => {
            return item.status < 4;
          });
          if (errorList.length) {
            component.set('errorOnConversion', true);
          } else {
            component.set('selectedOption', 'upload-image');
          }
          component.set('showScoreReview', true);
          component.set('showToggle', true);
          component.serializeUploadedFiles(result);
        }
      });
  },

  /**
   * Serialize data of uploaded images
   */
  serializeUploadedFiles(uploads) {
    const component = this;
    let uploadedFiles = Ember.A([]);
    uploads.map(item => {
      uploadedFiles.pushObject(
        Ember.Object.create({
          url: item.get('imagePath'),
          isUploadSuccess: true,
          id: item.get('id'),
          name: cleanFilename(item.get('imagePath'))
        })
      );
    });
    component.set('uploadedFiles', uploadedFiles);
  },

  /**
   * Serialize context of image upload
   * @return {Object}
   */
  serializeUploadContext() {
    const component = this;
    let imageUploadContext = Ember.Object.create({
      ctx_class_id: component.get('classId'),
      ctx_class_code: component.get('classCode'),
      ctx_source: 'ca',
      item_real_id: component.get('collectionId'),
      item_code: `${component.get('classCode')}${component.get('activityId')}`,
      item_type: component.get('format'),
      ctx_course_id: null,
      ctx_item_id: component.get('activityId'),
      ctx_unit_id: null,
      ctx_lesson_id: null,
      ctx_collection_id: null,
      ctx_path_id: 0,
      ctx_path_type: null
    });
    component.set('imageUploadContext', imageUploadContext);
    return imageUploadContext;
  }
});
