import Ember from 'ember';
import {
  I2D_CONVERSION_STATUS
} from 'gooru-web/config/config';
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['gru-i2d-preview'],

  /**
   * @property {I2dService} Media service API SDK
   */
  i2dService: Ember.inject.service('api-sdk/i2d'),

  /**
   * @type {i18nService} Service to retrieve translations information
   */
  i18n: Ember.inject.service(),

  /**
   * @requires service:notifications
   */
  notifications: Ember.inject.service(),

  // -------------------------------------------------------------------------
  // Properties
  /**
   * It maintains the images which needs to display
   * @prop {Array}
   */
  previewContents: null,

  /**
   * List of valid file extensions.
   * @prop {String}
   */
  mimeType: 'image/*',

  /**
   * It maintains the preview content
   * @prop {Array}
   */
  activeContent: null,

  /**
   * It maintains the question maxscores
   * @prop {Array}
   */
  questionsMaxScore: Ember.computed('questions.[]', function() {
    return this.get('questions').map(question => question.maxScore);
  }),

  /**
   * It maintains the whether to show reupload option or not
   * @prop {Boolean}
   */
  showReUpload: Ember.computed(
    'activeContent.isUploadReadyForReview',
    'activeContent.conversionErros',
    function() {
      return (
        this.get('activeContent.isUploadReadyForReview') ||
        this.get('activeContent.conversionErros')
      );
    }
  ),

  /**
   * It maintains the whether to show student score table or not
   * @prop {Boolean}
   */
  showStudentScore: Ember.computed(
    'activeContent.isUploadReadyForReview',
    'activeContent.conversionErros',
    function() {
      return (
        this.get('activeContent.isUploadReadyForReview') &&
        !this.get('activeContent.conversionErros')
      );
    }
  ),

  // -------------------------------------------------------------------------
  // Events

  didRender() {
    const component = this;
    component.send('slideTo', component.get('activePreviewIndex'));
    component.$('[data-toggle="popover"]').popover({
      trigger: 'hover'
    });
  },

  didInsertElement() {
    const component = this;
    if (component.get('showScoreReview')) {
      component.fetchImageData();
    }
  },

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * Action triggered when we click on previous
     */
    onClickPrev() {
      const component = this;
      component
        .$(
          '.image-to-data-preview-container #image-preview-carousel-wrapper .carousel-control'
        )
        .addClass('in-active');
      let selectedElement = component.$(
        '.image-to-data-preview-container #image-preview-carousel-wrapper .item.active'
      );
      const previewContents = component.get('previewContents');
      let currentIndex = selectedElement.data('item-index');
      let selectedIndex = currentIndex - 1;
      if (currentIndex === 0) {
        selectedIndex = previewContents.length - 1;
      }
      component.set('activePreviewIndex', selectedIndex);
      component
        .$('.image-to-data-preview-container #image-preview-carousel-wrapper')
        .carousel('prev');
    },

    /**
     * Action triggered when we click on next
     */
    onClickNext() {
      const component = this;
      component
        .$(
          '.image-to-data-preview-container #image-preview-carousel-wrapper .carousel-control'
        )
        .addClass('in-active');
      let selectedElement = component.$(
        '.image-to-data-preview-container #image-preview-carousel-wrapper .item.active'
      );
      const previewContents = component.get('previewContents');
      let currentIndex = selectedElement.data('item-index');
      let selectedIndex = currentIndex + 1;
      if (previewContents.length - 1 === currentIndex) {
        selectedIndex = 0;
      }
      component.set('activePreviewIndex', selectedIndex);
      component
        .$('.image-to-data-preview-container #image-preview-carousel-wrapper')
        .carousel('next');
    },

    /**
     * Action triggered when we click on thumbnail
     */
    slideTo(index) {
      const component = this;
      component
        .$(
          '.image-to-data-preview-container #image-preview-carousel-wrapper .carousel-control'
        )
        .addClass('in-active');
      component
        .$('.image-to-data-preview-container #image-preview-carousel-wrapper')
        .carousel(index);
    },

    /**
     * Action triggered when we click on thumbnail
     */
    onSelectImage(content, index) {
      const component = this;
      component.set('activeContent', content);
      component.set('activePreviewIndex', index);
      if (component.get('showScoreReview')) {
        component.fetchImageData();
      } else {
        component.send('slideTo', index);
      }
    },

    /**
     * Action triggered when we click on confirm upload button
     */
    onConfirmUpload() {
      const component = this;
      component.sendAction('onConfirmUpload');
    },

    /**
     * Action triggered when we click on confirm score button
     */
    onConfirmScore() {
      const component = this;
      let isInvalidScore = false;
      const students = component.get('studentList');
      students.forEach((student) => {
        student.get('questions').forEach((question) => {
          if (question.get('score') == null) {
            isInvalidScore = true;
            question.set('invalidScore', true);
          } else {
            question.set('invalidScore', false);
          }
        });
      });
      if (isInvalidScore) {
        component.get('notifications').setOptions({
          positionClass: 'toast-top-full-width',
          toastClass: 'gooru-toast',
          timeOut: 10000
        });
        const message = component.get('i18n').t('notifications.invalid-score');
        component.get('notifications').error(`${message}`);
      } else {
        component.sendAction('onConfirmScore');
      }
    },

    /**
     * Action triggered when user clicks on reupload button
     */
    onReUpload() {
      const component = this;
      component.set('selectedFile', component.get('activeContent'));
    },

    /**
     * Action triggered when file loaded from file picker
     */
    prepareForReUpload(file) {
      const component = this;
      component.sendAction('onPrepareForReUpload', file);
    }
  },

  // -------------------------------------------------------------------------
  // Methods
  /**
   * Method is used to fetch image data
   */
  fetchImageData() {
    const component = this;
    const uploadContent = component.get('activeContent');
    if (uploadContent.get('id')) {
      component.set('isLoading', true);
      component
        .get('i2dService')
        .fetchImageData(uploadContent.get('id'))
        .then(content => {
          const uploadStatus = content.get('uploadInfo.status');
          const parsedData = content.get('parsedData');
          const conversionErros = content.get('conversionInfo.errorCodes');
          uploadContent.set('conversionErros', conversionErros);
          component.set(
            'questions',
            component.parseQuestions(parsedData).sortBy('sequence')
          );
          component.set('studentList', component.parseScores(parsedData));
          uploadContent.set('uploadStatus', uploadStatus);
          uploadContent.set(
            'isUploadReadyForReview',
            uploadStatus === I2D_CONVERSION_STATUS.READY_FOR_REVIEW
          );
          component.set('isLoading', false);
        });
    }
  },

  /**
   * Method is used to parse questions
   * @return {Array}
   */
  parseQuestions(data) {
    let questions = data.uniqBy('questionId');
    return questions.map(question => {
      return Ember.Object.create({
        id: question.questionId,
        title: question.questionTitle,
        type: question.questionType,
        maxScore: question.maxScore,
        sequence: question.questionSequence
      });
    });
  },

  /**
   * Method is used to parse scores
   * @return {Array}
   */
  parseScores(data) {
    const component = this;
    let users = data
      .uniqBy('userId')
      .filter(user => user && user.get('userId'));
    return users.map(user => {
      let student = component.parseUserDetails(user);
      let studentData = data.filterBy('userId', student.get('userId'));
      student.set('questions', studentData);
      return student;
    });
  },

  /**
   * Method is used to parse user details
   * @return {Object}
   */
  parseUserDetails(user) {
    return Ember.Object.create({
      userId: user.get('userId'),
      username: user.get('username'),
      email: user.get('email'),
      firstName: user.get('firstName'),
      lastName: user.get('lastName')
    });
  }
});
