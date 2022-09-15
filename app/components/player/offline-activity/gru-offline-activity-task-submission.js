import Ember from 'ember';
import { OA_TASK_SUBMISSION_TYPES } from 'gooru-web/config/config';
import { inferUploadType, cleanFilename } from 'gooru-web/utils/utils';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: [
    'offline-activity-player',
    'gru-offline-activity-task-submission'
  ],

  // -------------------------------------------------------------------------
  // Dependencies
  mediaService: Ember.inject.service('api-sdk/media'),

  session: Ember.inject.service('session'),

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  offlineActivityService: Ember.inject.service(
    'api-sdk/offline-activity/offline-activity'
  ),

  // -------------------------------------------------------------------------
  // Events
  didInsertElement() {
    const component = this;
    if (!component.get('isReadOnly')) {
      component.setFocusCurrentTask();
    }
    component.setDefaultProperties();
    component.$('div.task-description a').on('click', function(event) {
      event.preventDefault();
      if (event.currentTarget.href) {
        window.open(event.currentTarget.href, '_blank');
      }
    });
  },

  // -------------------------------------------------------------------------
  // Observer

  /**
   * Observe task submission changes
   */
  observePendingItems: Ember.observer(
    'pendingUrlSubmissions',
    'pendingUploadSubmissions',
    'savedUploadSubmissions',
    'task.submissionText',
    function() {
      const component = this;
      const pendingUploadSubmissions = component.get('savedUploadSubmissions');
      const freeeFormText = component.get('task.submissionText');
      const isFreeFormTextEntered = freeeFormText
        ? freeeFormText.length
        : false;

      const mandatoryUploads = component.get('mandatoryUploads');
      let hasAddedMandatorySubmission = false;
      if (mandatoryUploads > 0) {
        if (pendingUploadSubmissions <= 0) {
          hasAddedMandatorySubmission = true;
        }
      } else if (isFreeFormTextEntered || pendingUploadSubmissions <= 0) {
        hasAddedMandatorySubmission = true;
      }

      component.set(
        'task.isAddedMandatorySubmission',
        hasAddedMandatorySubmission
      );
    }
  ),

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    //Action triggered when select a file from picker
    onUploadFile(file) {
      const component = this;
      const task = component.get('task');
      let uploadedFiles = task.get('files');
      //add new file
      uploadedFiles.pushObject(file);
      component.get('listOfFilesUploads').pushObject(
        Ember.Object.create({
          isFileAvailable: false,
          isUploaded: false
        })
      );
      let fileType = inferUploadType(file.name, OA_TASK_SUBMISSION_TYPES);
      file.fileType = fileType ? fileType.value : 'others';
      file.icon = OA_TASK_SUBMISSION_TYPES.findBy('value', file.fileType).icon;
      component.set('task.isTaskSubmitted', false);
    },

    //Action triggered when click on save
    onSaveTask() {
      const component = this;
      component.set('isSubmittingTask', true);
      component.uploadFilesToS3().then(function() {
        component.set('isSubmittingTask', false);
        component.submitTaskDetails(component.createTaskSubmissionPayload());
        component.set('task.isTaskSubmitted', true);
        component.send('onToggleTask');
      });
    },

    //Action triggered when click on toggle task container
    onToggleTask() {
      const component = this;
      component.toggleProperty('isTaskExpanded');
      component.$('.task-details-container').slideToggle();
    },

    //Action triggered when click on remove selected file
    onRemoveFile(filePos) {
      this.removeFile(filePos);
    },

    //Action triggered when click on plus button in the url
    onAppendUrl() {
      this.get('task.urls').pushObject(
        Ember.Object.create({
          value: null,
          isSubmittedUrl: false
        })
      );
    },

    filePreview() {
      const component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_CA_ITEM_GRADE_OFFLINE_UPLOADS);
    },

    onUrls() {
      const component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_CA_ITEM_GRADE_OFFLINE_URLS);
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Array} studentTaskSubmissions
   * Property for list of student submission respective to task
   */
  studentTaskSubmissions: Ember.computed(
    'task.studentTaskSubmissions',
    function() {
      const component = this;
      const studentTaskSubmissions = component.get(
        'task.studentTaskSubmissions'
      );
      return studentTaskSubmissions ? studentTaskSubmissions : Ember.A([]);
    }
  ),

  /**
   * @property {Array} studentTaskUploadSubmission
   * Property for list of student task upload submissions
   */
  studentTaskUploadSubmission: Ember.computed.filter(
    'studentTaskSubmissions',
    function(taskSubmission) {
      return taskSubmission.submissionType === 'uploaded';
    }
  ),

  /**
   * @property {Array} studentTaskUrlSubmission
   * Property for list of student task url submissions
   */
  studentTaskUrlSubmission: Ember.computed.filter(
    'studentTaskSubmissions',
    function(taskSubmission) {
      return taskSubmission.submissionType === 'remote';
    }
  ),

  /**
   * @property {Array} oaTaskSubmissions
   * Property to capture student submissions
   */
  oaTaskSubmissions: Ember.computed.alias('task.oaTaskSubmissions'),

  /**
   * @property {Array} oaTaskUploadSubmissions
   * Property to capture student uploaded submissions
   */
  oaTaskUploadSubmissions: Ember.computed.filter('oaTaskSubmissions', function(
    submission
  ) {
    return submission.get('taskSubmissionType') === 'uploaded';
  }),

  /**
   * @property {Number} mandatoryUploads
   * Property for number of mandatory upload count
   */
  mandatoryUploads: Ember.computed('oaTaskSubmissions', function() {
    const component = this;
    const oaTaskSubmissions = component.get('oaTaskSubmissions');
    const uploadSubmissions = oaTaskSubmissions.filter(
      submission => submission.get('taskSubmissionType') === 'uploaded'
    );
    return uploadSubmissions.length;
  }),

  /**
   * @property {Number} pendingUploadSubmissions
   * Property for number of upload submissions pending
   */
  pendingUploadSubmissions: Ember.computed(
    'task.files.[]',
    'mandatoryUploads',
    'studentTaskUploadSubmission',
    function() {
      const component = this;
      const uploadedFilesCount = component.get('task.files.length');
      const mandatoryUploads = component.get('mandatoryUploads');
      const studentTaskUploadSubmission = component.get(
        'studentTaskUploadSubmission.length'
      );
      return mandatoryUploads > studentTaskUploadSubmission
        ? mandatoryUploads - (uploadedFilesCount + studentTaskUploadSubmission)
        : 0;
    }
  ),

  /**
   * @property {Number} savedUploadSubmissions
   * Property for number of upload submissions pending
   */
  savedUploadSubmissions: Ember.computed(
    'task.files.[]',
    'mandatoryUploads',
    'studentTaskUploadSubmission',
    function() {
      const component = this;

      const uploadedFilesCount = component.get('task.files.length');
      const mandatoryUploads = component.get('mandatoryUploads');
      const studentTaskUploadSubmission = component.get(
        'studentTaskUploadSubmission.length'
      );
      return mandatoryUploads > studentTaskUploadSubmission
        ? mandatoryUploads - (uploadedFilesCount + studentTaskUploadSubmission)
        : 0;
    }
  ),
  /**
   * @property {Array} oaTaskRemoteSubmissions
   * Property to capture student added url submissions
   */
  oaTaskRemoteSubmissions: Ember.computed.filter('oaTaskSubmissions', function(
    submission
  ) {
    return submission.get('taskSubmissionType') === 'remote';
  }),

  /**
   * @property {Number} mandatoryUrls
   * Property for number of mandatory url submissions
   */
  mandatoryUrls: Ember.computed('oaTaskRemoteSubmissions', function() {
    const component = this;
    return component.get('oaTaskRemoteSubmissions.length');
  }),

  /**
   * @property {Number} pendingUrlSubmissions
   * Property for number of url submissions pending
   */
  pendingUrlSubmissions: Ember.computed(
    'task.urls.@each.value',
    'mandatoryUrls',
    'studentTaskUrlSubmission',
    function() {
      const component = this;
      const taskUrls = component.get('task.urls');
      const mandatoryUrls = component.get('mandatoryUrls');
      const studentTaskUrlSubmission = component.get(
        'studentTaskUrlSubmission.length'
      );
      const uploadedUrls = taskUrls
        ? taskUrls.filter(url => url.value)
        : Ember.A([]);
      return mandatoryUrls > studentTaskUrlSubmission
        ? mandatoryUrls - (uploadedUrls.length + studentTaskUrlSubmission)
        : 0;
    }
  ),

  /**
   * @property {Boolean} isUploadedRequiredTaskFiles
   * Property to check is student uploaded required files
   */
  isUploadedRequiredTaskFiles: Ember.computed(
    'task.files.[]',
    'studentTaskUploadSubmission',
    function() {
      const component = this;
      let uploadedFiles = component.get('task.files');
      let mandatoryUploads = component.get('mandatoryUploads');
      let studentTaskUploadSubmission = component.get(
        'studentTaskUploadSubmission.length'
      );
      return uploadedFiles
        ? uploadedFiles.length + studentTaskUploadSubmission >= mandatoryUploads
        : false;
    }
  ),

  /**
   * @property {Boolean} isAddedRequiredTaskUrls
   * Property to check is student added required urls
   */
  isAddedRequiredTaskUrls: Ember.computed(
    'task.urls.@each.value',
    'studentTaskUrlSubmission',
    function() {
      const component = this;
      let taskUrls = component.get('task.urls');
      let mandatoryUrls = component.get('mandatoryUrls');
      let studentTaskUrlSubmission = component.get(
        'studentTaskUrlSubmission.length'
      );
      let uploadedUrls = taskUrls
        ? taskUrls.filter(url => url.value)
        : Ember.A([]);
      return uploadedUrls.length + studentTaskUrlSubmission >= mandatoryUrls;
    }
  ),

  /**
   * @property {Boolean} isEnableTaskSubmission
   * Property to check whether to enable or not save button
   */
  isEnableTaskSubmission: Ember.computed(
    'task.urls.@each.value',
    'task.files.[]',
    'task.submissionText',
    'isValidTimespent',
    function() {
      const component = this;
      let addedUrls = component.get('task.urls')
        ? component
          .get('task.urls')
          .filter(url => !url.get('isSubmittedUrl') && url.get('value'))
          .length
        : 0;
      let addedFiles = component.get('task.files')
        ? component.get('task.files').length
        : false;
      let addedAnswerText = component.get('task.submissionText');
      return addedUrls > 0 || addedFiles > 0 || addedAnswerText;
    }
  ),

  /**
   * @property {Array} typeBasedMandatoryUploads
   * Property for list of type based mandatory submission count
   */
  typeBasedMandatoryUploads: Ember.computed(function() {
    const component = this;
    const oaTaskUploadSubmissions = component.get('oaTaskSubmissions');
    let typeBasedMandatoryUploads = Ember.A([]);
    OA_TASK_SUBMISSION_TYPES.map(submissionType => {
      let type = submissionType.value;
      let typeBasedSubmission = oaTaskUploadSubmissions.filterBy(
        'taskSubmissionSubType',
        type
      );
      if (typeBasedSubmission.length) {
        let typeBasedSubmissionCount = Ember.Object.create({
          type,
          mandatorySubmissionCount: typeBasedSubmission.length,
          isUploaded: false,
          pendingCount: typeBasedSubmission.length
        });
        typeBasedMandatoryUploads.pushObject(typeBasedSubmissionCount);
      }
    });
    return typeBasedMandatoryUploads;
  }),

  /**
   * @property {Boolean} isTaskExpanded
   */
  isTaskExpanded: true,

  /**
   * @property {String} contentSource
   * Property for content source send to Analytics
   * TODO hardcoded due to currently support available at DCA
   */
  contentSource: 'dailyclassactivity',

  /**
   * @property {UUID} userId
   */
  userId: Ember.computed.alias('session.userId'),

  /**
   * @property {UUID} classId
   */
  classId: null,

  /**
   * @property {UUId} caContentId
   */
  caContentId: null,

  /**
   * @property {Array} listOfFilesUploads
   * Property to handle the visibility of number of files needs to be uploaded
   */
  listOfFilesUploads: Ember.computed('mandatoryUploads', function() {
    return Ember.A([
      Ember.Object.create({
        isFileAvailable: false,
        isUploaded: false
      })
    ]);
  }),

  /**
   * @property {Boolean} isStudentSubmitted
   * Property to check whether the student has submitted this task
   */
  isStudentSubmitted: Ember.computed.gte('studentTaskSubmissions.length', 1),

  /**
   * Maintains the mode the component view
   * @type {Boolean}
   */
  isReadOnly: false,

  /**
   * Maintains the value of show the submissions or not
   * @type {Boolean}
   */
  showSubmissions: false,

  /**
   * Maintains the value of show toggle or not
   * @type {Boolean}
   */
  showToggle: false,

  /*
   * @property {Number} timespentInMilliSec
   * Property for student submitted timespent in millisec
   */
  timespentInMilliSec: 0,

  /**
   * @property {String} timeZone
   */
  timeZone: Ember.computed(function() {
    return moment.tz.guess() || null;
  }),

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function uploadFilesToS3
   * Method to upload list of files into S3
   */
  uploadFilesToS3() {
    const component = this;
    let files = component.get('task.files').filter(file => !file.isUploaded);
    let uploadedFilesPromise = files.map(file => {
      return component.uploadFileIntoS3(file).then(function(fileObject) {
        return fileObject;
      });
    });
    return Ember.RSVP.allSettled(uploadedFilesPromise);
  },

  /**
   * @function uploadFileIntoS3
   * Method to upload given file into S3
   */
  uploadFileIntoS3(fileObject) {
    const component = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      return Ember.RSVP.hash({
        fileLocation: component
          .get('mediaService')
          .uploadContentFile(fileObject)
      }).then(({ fileLocation }) => {
        let cdnUrls = component.get('session.cdnUrls');
        let UUIDFileName = cleanFilename(fileLocation, cdnUrls);
        fileObject.UUIDFileName = UUIDFileName;
        fileObject.isUploaded = true;
        return resolve(fileObject);
      }, reject);
    });
  },

  /**
   * @function submitTaskDetails
   * Method to send student task submissions into Analytics
   */
  submitTaskDetails(taskSubmissionPayload) {
    const component = this;
    component
      .get('offlineActivityService')
      .oaTaskSubmissions(taskSubmissionPayload);
  },

  /**
   * @function createTaskSubmissionPayload
   * Method to create task submission request payload
   */
  createTaskSubmissionPayload() {
    const component = this;
    const task = component.get('task');
    const userId = component.get('userId');
    const contentSource = component.get('contentSource');
    const classId = component.get('classId');
    const caContentId = component.get('caContentId');
    let taskSubmissions = [];
    let uploadedFiles = task.get('files').filter(file => !file.isSubmitted);
    let timespentInMilliSec = component.get('timespentInMilliSec');
    uploadedFiles.map(uploadedFile => {
      let submissionContext = Ember.Object.create({
        submissionValue: uploadedFile.UUIDFileName,
        submissionType: 'uploaded',
        submissionSubType: uploadedFile.fileType,
        submissionOriginalName: uploadedFile.name
      });
      taskSubmissions.push(
        component.getTaskSubmissionContext(submissionContext)
      );
      uploadedFile.isSubmitted = true;
    });
    //fetch only newly added urls
    let submissionUrls = task
      .get('urls')
      .filter(
        taskUrl => taskUrl.get('value') && !taskUrl.get('isSubmittedUrl')
      );
    submissionUrls.map(submissionUrl => {
      let submissionContext = Ember.Object.create({
        submissionValue: submissionUrl.get('value'),
        submissionType: 'remote',
        submissionSubType: 'url'
      });
      taskSubmissions.push(
        component.getTaskSubmissionContext(submissionContext)
      );
      submissionUrl.set('isSubmittedUrl', true);
    });
    //Task free form text data
    let freeFormTextSubmissionContext = Ember.Object.create({
      submissionValue: task.get('submissionText'),
      submissionType: 'free-form-text',
      submissionSubType: 'free-form-text'
    });
    taskSubmissions.push(
      component.getTaskSubmissionContext(freeFormTextSubmissionContext)
    );
    let submissionPayload = {
      student_id: userId,
      class_id: classId,
      oa_id: task.get('oaId'),
      content_source: contentSource,
      submissions: taskSubmissions,
      time_spent: timespentInMilliSec
    };
    if (component.get('isStudyPlayer')) {
      submissionPayload.course_id = component.get('courseId');
      submissionPayload.unit_id = component.get('unitId');
      submissionPayload.lesson_id = component.get('lessonId');
    } else {
      submissionPayload.oa_dca_id = parseInt(caContentId);
    }
    return submissionPayload;
  },

  /**
   * @function getTaskSubmissionContext
   * Metho to create individual submission payload
   */
  getTaskSubmissionContext(submissionContext) {
    const component = this;
    const task = component.get('task');
    return {
      task_id: task.get('id'),
      submission_info: submissionContext.get('submissionValue'),
      submission_type: submissionContext.get('submissionType'),
      submission_subtype: submissionContext.get('submissionSubType'),
      submission_originalfilename: submissionContext.get(
        'submissionOriginalName'
      )
    };
  },

  /**
   * @function removeFile
   * Method to remove selected file
   */
  removeFile() {
    return true;
  },

  /**
   * @function setDefaultProperties
   * Method to set default values to properties
   */
  setDefaultProperties() {
    const component = this;
    component.set('task.files', Ember.A([]));
    component.set('task.urls', Ember.A([]));
    component.set('fileUploadErrors', Ember.A());
    if (component.get('isStudentSubmitted')) {
      let studentTaskUrlSubmission = component.get('studentTaskUrlSubmission');
      let taskUrls = component.get('task.urls');
      component.set('task.isTaskSubmitted', true);
      studentTaskUrlSubmission.forEach(function(taskUrlSubmission, urlIndex) {
        let taskUrl = taskUrls.objectAt(urlIndex);
        if (taskUrl) {
          taskUrl.set('value', taskUrlSubmission.submissionInfo);
          taskUrl.set('isSubmittedUrl', true);
        } else {
          taskUrls.pushObject(
            Ember.Object.create({
              value: taskUrlSubmission.submissionInfo,
              isSubmittedUrl: true
            })
          );
        }
      });
    }
    if (!component.get('isReadOnly')) {
      component.get('task.urls').pushObject(
        Ember.Object.create({
          value: null,
          isSubmittedUrl: false
        })
      );
    }
  },

  /**
   * Sets focus on last not submitted task
   */

  setFocusCurrentTask: function() {
    const component = this;
    const $component = this.$();
    if (component.get('task.focus', true)) {
      Ember.run.later(function() {
        $component.get(0).scrollIntoView();
        let rte = $component.find('.rich-editor');
        rte.focus();
      }, 1000);
    }
  }
  //})
});
