import Ember from 'ember';
import { CONTENT_TYPES, SCREEN_SIZES } from 'gooru-web/config/config';
import {
  validateTimespent,
  generateUUID,
  formatTime as formatMilliseconds,
  isCompatibleVW
} from 'gooru-web/utils/utils';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['add-data', 'collection-performance-data'],

  // -------------------------------------------------------------------------
  // Serevices
  collectionService: Ember.inject.service('api-sdk/collection'),

  performanceService: Ember.inject.service('api-sdk/performance'),

  analyticsService: Ember.inject.service('api-sdk/analytics'),

  session: Ember.inject.service('session'),

  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  // -------------------------------------------------------------------------
  // Events
  didInsertElement() {
    const component = this;
    if (component.get('isCollection')) {
      component.loadCollectionData();
    } else {
      //pre populate external collection timespent
      const activityData = component.get('activityData');
      if (activityData.get('collection.performance')) {
        component.resetHourMinute(
          formatMilliseconds(
            activityData.get('collection.performance.timeSpent')
          )
        );
      }
    }
    if (component.get('isMobileView')) {
      component.set(
        'timeSpentElementContainer',
        component.$('.timespent-container')
      );
    }
  },

  didRender() {
    const component = this;
    if (component.get('isMobileView') && component.get('isCollection')) {
      component
        .$('.active-resource .resource-timespent-details')
        .append(component.get('timeSpentElementContainer'));
    }
    component.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
  },

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    //Action triggered when select a resource
    onSelectResource(resource) {
      const component = this;
      if (component.get('activeResource.id') !== resource.get('id')) {
        component.set('activeResource', resource);
        component.resetHourMinute(
          formatMilliseconds(resource.get('timeSpent'))
        );
      }
    },

    //Action triggered when save given timespent into active resource
    onSaveTimeSpent() {
      const component = this;
      let maxHour = parseInt(component.get('maxHour'));
      let maxMinute = parseInt(component.get('maxMinute'));
      maxHour = isNaN(maxHour) ? 0 : maxHour;
      maxMinute = isNaN(maxMinute) ? 0 : maxMinute;
      let timeSpentInmIlliSec = (maxHour * 60 * 60 + maxMinute * 60) * 1000;
      component.set('activeResource.timeSpent', timeSpentInmIlliSec);
      if (component.get('isLastResource')) {
        if (component.get('isOverwritePerformance')) {
          component.overwriteCollectionPerformance();
        } else {
          component.submitCollectionPerformanceData();
        }
        component
          .get('parseEventService')
          .postParseEvent(
            PARSE_EVENTS.CLICK_CA_ADD_DATA_CONFIR_UPDATE_TIMESPENT
          );
      } else {
        const resources = component.get('resources');
        let curResourceIndex = resources.indexOf(
          component.get('activeResource')
        );
        let nextResource = resources.objectAt(curResourceIndex + 1);
        component.set('activeResource', nextResource);
        component.resetHourMinute(
          formatMilliseconds(nextResource.get('timeSpent'))
        );
        component.clearFilteredResources();
      }
    },

    //Action triggered when search for a resource
    onSearchResource() {
      const component = this;
      let resourceSearchPattern = component
        .get('resourceSearchPattern')
        .toLowerCase();
      let resources = component.get('resources');
      let filteredResources = resources.filter(resource =>
        resource
          .get('title')
          .toLowerCase()
          .includes(resourceSearchPattern)
      );
      component.set('resourceList', filteredResources);
    },

    //Action triggered when clear search resources text pattern
    onClearSearchResources() {
      const component = this;
      component.clearFilteredResources();
    },

    //Action triggered when submit external collection timespent
    onSubmitExternalCollectionTimeSpent() {
      const component = this;
      component.submitExternalCollectionPerformanceData();
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  timeSpentElementContainer: null,

  /**
   * @property {Boolean} isMobileView
   */
  isMobileView: isCompatibleVW(SCREEN_SIZES.MEDIUM),

  /**
   * @property {Boolean} isCollection
   */
  isCollection: Ember.computed.equal(
    'collection.format',
    CONTENT_TYPES.COLLECTION
  ),

  /**
   * @property {String} resourceSearchPattern
   */
  resourceSearchPattern: '',

  /**
   * @property {Array} resources
   */
  resources: Ember.A([]),

  /**
   * @property {Array} resourceList
   */
  resourceList: Ember.computed('resources', function() {
    return this.get('resources');
  }),

  /**
   * @property {Object} activeResource
   */
  activeResource: Ember.computed('resources', function() {
    const component = this;
    return component.get('resources').objectAt(0);
  }),

  /**
   * @property {Number} maxHour
   */
  maxHour: 0,

  /**
   * @property {Number} maxMinute
   */
  maxMinute: 0,

  /**
   * @property {Boolean} isLastResource
   */
  isLastResource: Ember.computed('activeResource', function() {
    const component = this;
    const resources = component.get('resources');
    const activeResource = component.get('activeResource');
    return resources.indexOf(activeResource) === resources.length - 1;
  }),

  /**
   * @property {Boolean} isValidTimeSpent
   */
  isValidTimeSpent: Ember.computed('maxHour', 'maxMinute', function() {
    const component = this;
    const maxHour = parseInt(component.get('maxHour'));
    const maxMinute = parseInt(component.get('maxMinute'));
    return validateTimespent(maxHour, maxMinute);
  }),

  /**
   * @property {Number} timeSpentInmIlliSec
   */
  timeSpentInmIlliSec: 0,

  /**
   * @property {Boolean} isShowClearSearchResources
   */
  isShowClearSearchResources: Ember.computed(
    'resourceSearchPattern',
    function() {
      const component = this;
      return component.get('resourceSearchPattern.length') > 0;
    }
  ),

  /**
   * @property {String} contentSource
   */
  contentSource: 'dailyclassactivity',

  /**
   * @property {String} timeZone
   */
  timeZone: Ember.computed(function() {
    return moment.tz.guess() || null;
  }),

  /**
   * @property {Boolean} isOverwritePerformance
   */
  isOverwritePerformance: Ember.computed.alias(
    'activityData.isUpdatePerformance'
  ),

  // -------------------------------------------------------------------------
  // Functions

  clearFilteredResources() {
    const component = this;
    component.set('resourceSearchPattern', '');
    component.set('resourceList', component.get('resources'));
  },

  /**
   * @function resetHourMinute
   * Method to reset active maxHour and maxMinute
   */
  resetHourMinute(timeString) {
    const component = this;
    let maxHour = 0;
    let maxMinute = 0;
    if (timeString) {
      let splittedTime = timeString.split(' ');
      let firstHalfString = splittedTime[0];
      let secodHalfString = splittedTime[1];
      if (firstHalfString && firstHalfString.includes('h')) {
        maxHour = firstHalfString.slice(0, -1);
      } else if (firstHalfString && firstHalfString.includes('m')) {
        maxMinute = firstHalfString.slice(0, -1);
      }
      if (secodHalfString && secodHalfString.includes('m')) {
        maxMinute = secodHalfString.slice(0, -1);
      }
    }
    component.set('maxHour', parseInt(maxHour));
    component.set('maxMinute', parseInt(maxMinute));
  },

  /**
   * @function loadCollectionData
   * Method to load collection data
   */
  loadCollectionData() {
    const component = this;
    let collection = component.get('collection');
    component
      .fetchCollectionData(collection.get('id'))
      .then(function(collectionData) {
        component.set('resources', collectionData.get('children'));
        if (component.get('isOverwritePerformance')) {
          component.loadStudentsActivityPerformance();
        }
      });
  },

  /**
   * @function loadStudentsActivityPerformance
   * Method to load students activity performance
   */
  loadStudentsActivityPerformance() {
    const component = this;
    const analyticsService = component.get('analyticsService');
    const activityData = component.get('activityData');
    const activityDate = activityData.get('activation_date')
      ? activityData.get('activation_date')
      : moment().format('YYYY-MM-DD');
    const collectionId = activityData.get('collection.id');
    const collectionType = 'collection';
    const classId = component.get('classId');
    const endDate = activityData.get('end_date');
    return Ember.RSVP.hash({
      studentsActivityPerformance: analyticsService.getDCAPerformance(
        classId,
        collectionId,
        collectionType,
        activityDate,
        endDate
      )
    }).then(({ studentsActivityPerformance }) => {
      component.parseStudentsActivityPerformanceData(
        studentsActivityPerformance
      );
    });
  },

  /**
   * @function fetchCollectionData
   * Method to fetch collection data
   */
  fetchCollectionData(collectionId) {
    const component = this;
    const collectionService = component.get('collectionService');
    return collectionService.readCollection(collectionId);
  },

  /**
   * @function submitCollectionPerformanceData
   * Method to submit student collection timespent data
   */
  submitCollectionPerformanceData() {
    const component = this;
    const students = component.get('students');
    let studentCollectionPerformanceData = component.getCollectionDataParams();
    let studentPerformanceData = students.map(student => {
      studentCollectionPerformanceData.session_id = generateUUID();
      studentCollectionPerformanceData.student_id = student.get('id');
      return component.saveStudentCollectionPerformanceData(
        studentCollectionPerformanceData
      );
    });
    Ember.RSVP.Promise.all(studentPerformanceData).then(() => {
      component.sendAction('onClosePullUp');
    });
  },

  /**
   * @function submitExternalCollectionPerformanceData
   * Method to submit external collection performance data
   */
  submitExternalCollectionPerformanceData() {
    const component = this;
    component
      .saveStudentCollectionPerformanceData(
        component.getExternalCollectionDataParams()
      )
      .then(() => {
        component.sendAction('onClosePullUp');
      });
  },

  /**
   * @function overwriteCollectionPerformance
   * Method to overwrite collection performance
   */
  overwriteCollectionPerformance() {
    const component = this;
    const students = component.get('students');
    const activityData = component.get('activityData');
    let studentCollectionPerformanceData = component.getCollectionDataParams();
    let requestBodyKeysToRest = [
      'conducted_on',
      'path_id',
      'path_type',
      'tenant_id',
      'course_id',
      'additionalContext'
    ];
    studentCollectionPerformanceData = component.resetRequestBodyByKeys(
      studentCollectionPerformanceData,
      requestBodyKeysToRest
    );
    let overwriteSpecifcParams = {
      activity_date: activityData.get('activation_date'),
      additional_context: btoa(
        JSON.stringify({
          dcaContentId: activityData.get('id')
        })
      )
    };
    studentCollectionPerformanceData = Object.assign(
      studentCollectionPerformanceData,
      overwriteSpecifcParams
    );
    students.map(student => {
      studentCollectionPerformanceData.student_id = student.get('id');
      component.overwriteStudentCollectionPerformance(
        studentCollectionPerformanceData
      );
    });
    component.sendAction('onClosePullUp');
  },

  /**
   * @function saveStudentCollectionPerformanceData
   * Method to save student collection performance data
   */
  saveStudentCollectionPerformanceData(collectionParams) {
    const component = this;
    const performanceService = component.get('performanceService');
    return performanceService.updateCollectionOfflinePerformance(
      collectionParams
    );
  },

  /**
   * @function overwriteStudentCollectionPerformance
   * Method to overwrite student collection performance
   */
  overwriteStudentCollectionPerformance(collectionParams) {
    const component = this;
    const performanceService = component.get('performanceService');
    return performanceService.overwriteCollectionPerformance(collectionParams);
  },

  /**
   * @function getCollectionDataParams
   * Method to generate collection data params
   */
  getCollectionDataParams() {
    const component = this;
    let resources = component.get('resources');
    let collectionResources = Ember.A([]);
    resources.forEach(function(resource) {
      collectionResources.push(component.getResourceRequestBody(resource));
    });
    let studentPerformanceData = {
      collection_type: 'collection',
      resources: collectionResources
    };
    return Object.assign(
      studentPerformanceData,
      component.getCollectionRequestBody()
    );
  },

  /**
   * @function getExternalCollectionDataParams
   * Method to generate external collection data params
   */
  getExternalCollectionDataParams() {
    const component = this;
    const collection = component.get('collection');
    let studentIds = component.get('students').mapBy('id');
    let maxHour = parseInt(component.get('maxHour'));
    let maxMinute = parseInt(component.get('maxMinute'));
    maxHour = isNaN(maxHour) ? 0 : maxHour;
    maxMinute = isNaN(maxMinute) ? 0 : maxMinute;
    let timeSpentInmIlliSec = (maxHour * 60 * 60 + maxMinute * 60) * 1000;
    let studentPerformanceData = {
      student_id: studentIds,
      unit_id: collection.get('unitId'),
      lesson_id: collection.get('lessonId'),
      collection_type: 'collection-external',
      time_spent: timeSpentInmIlliSec,
      session_id: generateUUID()
    };
    return Object.assign(
      studentPerformanceData,
      component.getCollectionRequestBody()
    );
  },

  /**
   * @function parseStudentsActivityPerformanceData
   * Method to parse students activity performance data
   */
  parseStudentsActivityPerformanceData(studentsActivityPerformance) {
    const component = this;
    let students = component.get('students');
    let resources = component.get('resources');
    let resourcesPerformance = studentsActivityPerformance
      .objectAt(0)
      .get('resourceResults');
    students.map(student => {
      let studentActivityPerformance = studentsActivityPerformance.findBy(
        'user',
        student.get('id')
      );
      student.set(
        'performance',
        studentActivityPerformance
          ? studentActivityPerformance.get('collection')
          : null
      );
    });
    resources.map(resource => {
      let resourcePerformance = resourcesPerformance.findBy(
        'resourceId',
        resource.get('id')
      );
      resource.set('performance', resourcePerformance);
      resource.set('timeSpent', resourcePerformance.get('timeSpent'));
    });
    //First resource active by default
    component.resetHourMinute(
      formatMilliseconds(resources.objectAt(0).get('timeSpent'))
    );
  },

  /**
   * @function getResourceRequestBody
   * Method to get resource request body
   */
  getResourceRequestBody(resource) {
    return {
      resource_id: resource.get('id'),
      resource_type: resource.get('content_format'),
      time_spent: resource.get('timeSpent'),
      question_type: resource.get('type')
    };
  },

  /**
   * @function getCollectionRequestBody
   * Method to get collection requestion body param
   */
  getCollectionRequestBody() {
    const component = this;
    const collection = component.get('collection');
    const conductedOn = component.get('activityData.activation_date')
      ? new Date(component.get('activityData.activation_date'))
      : new Date();
    const classId = component.get('classId');
    const activityId = component.get('activityData.id');
    const courseId = component.get('course')
      ? component.get('course.id')
      : null;
    return {
      tenant_id: component.get('session.tenantId') || null,
      class_id: classId,
      collection_id: collection.get('id'),
      content_source: component.get('contentSource'),
      time_zone: component.get('timeZone'),
      conducted_on: conductedOn.toISOString(),
      path_id: 0,
      path_type: null,
      course_id: courseId,
      additionalContext: btoa(
        JSON.stringify({
          dcaContentId: activityId
        })
      )
    };
  },

  /**
   * @function resetRequestBodyByKeys
   * Method to reset request body keys
   */
  resetRequestBodyByKeys(dataToRest, jsonKeys) {
    jsonKeys.map(key => {
      dataToRest[`${key}`] = undefined;
    });
    return dataToRest;
  }
});
