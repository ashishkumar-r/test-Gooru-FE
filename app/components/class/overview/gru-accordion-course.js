import Ember from 'ember';
import AccordionMixin from '../../../mixins/gru-accordion';
import { CONTENT_TYPES } from 'gooru-web/config/config';
import ClassroomMixin from 'gooru-web/mixins/classroom-mixin';

/**
 * Accordion Course
 *
 * Component responsible for behaving as an accordion and listing a set of units
 * and the users participating in each unit.
 *
 * @module
 * @augments Ember/Component
 * @mixes mixins/gru-accordion
 */
export default Ember.Component.extend(AccordionMixin, ClassroomMixin, {
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @requires service:session
   */
  session: Ember.inject.service('session'),

  /**
   * @requires service:api-sdk/unit
   */
  unitService: Ember.inject.service('api-sdk/unit'),

  /**
   * @requires service:api-sdk/performance
   */
  performanceService: Ember.inject.service('api-sdk/performance'),

  /**
   * @requires service:api-sdk/analytics
   */
  analyticsService: Ember.inject.service('api-sdk/analytics'),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['gru-accordion', 'gru-accordion-course'],

  /**
   * Indicates the status of the spinner
   * @property {Boolean}
   */
  loading: false,

  /**
   * Indicates which unit is selected
   * @property {selectedUnit}
   */
  selectedUnit: '',

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * Action triggered when the user click outside of pullup.
     **/
    onClosePullUp() {
      this.set('showLessonReportPullUp', false);
      this.set('showReportPullUp', false);
      this.set('showUnitReportPullUp', false);
      this.set('showCollectionReportPullUp', false);
      this.set('isShowStudentExternalAssessmentReport', false);
      this.set('isShowStudentOfflineActivityReport', false);
    },

    /**
     * @function goLive
     */
    goLive: function(collectionId) {
      this.sendAction('onGoLive', collectionId);
    },

    /**
     * Launch an assessment on-air
     *
     * @function actions:launchOnAir
     */
    launchOnAir: function(collectionId) {
      // Send the action so that it bubbles up to the route
      this.sendAction('onLaunchOnAir', collectionId);
    },

    /**
     * @function actions:selectItem
     * @param {string} collection - collection or assessment
     * @see module:app/components/class/overview/gru-accordion-lesson
     */
    selectResource: function(unitId, lessonId, collection) {
      // Send the action so that it bubbles up to the route
      this.sendAction('onSelectResource', unitId, lessonId, collection);
    },

    /**
     * @function studyNow
     * @param {string} type - collection or assessment
     * @param {string} lessonId - lesson id
     * @param {string} unitId - lesson id
     * @param {string} item - collection, assessment, lesson or resource
     * @see components/class/overview/gru-accordion-lesson
     */
    studyNow: function(type, unitId, lessonId, item) {
      this.sendAction('onStudyNow', type, unitId, lessonId, item);
    },
    /**
     * Trigger the 'onLocationUpdate' event handler
     *
     * @function actions:updateLocation
     * @param {string} newLocation - String of the form 'unitId[+lessonId[+resourceId]]'
     */
    updateLocation: function(newLocation) {
      if (this.get('onLocationUpdate')) {
        this.get('onLocationUpdate')(newLocation);
      }
    },

    /**
     * Trigger action to update content visibility list
     */
    updateContentVisibility: function(contentId, visible) {
      this.sendAction('onUpdateContentVisibility', contentId, visible);
    },

    onSelectItem() {
      this.sendAction('onSelectItem');
    },

    /**
     * Trigger when unit level  report clicked
     */
    onOpenUnitLevelReport(params) {
      params.units = this.get('items');
      this.sendAction('onOpenUnitLevelReport', params);
    },
    /**
     * Trigger when lesson level  report clicked
     */
    onOpenLessonReport(params) {
      this.sendAction('onOpenLessonReport', params);
    },

    /**
     * Trigger when collection level student report clicked
     */
    onOpenStudentReport(params) {
      let component = this;
      let reportType = params.type;
      if (reportType === CONTENT_TYPES.EXTERNAL_ASSESSMENT) {
        component.set('isShowStudentExternalAssessmentReport', true);
        component.set('isShowStudentReport', false);
      } else if (reportType === CONTENT_TYPES.OFFLINE_ACTIVITY) {
        params.performance = params.collection.performance;
        component.set('isShowStudentOfflineActivityReport', true);
      } else if (reportType === CONTENT_TYPES.EXTERNAL_COLLECTION) {
        component.set('isShowStudentExternalCollectionReport', true);
      } else {
        component.set('isShowStudentExternalAssessmentReport', false);
        component.set('isShowStudentReport', true);
      }
      component.set('studentReportData', params);
    },

    /**
     * Trigger when collection level teacher report clicked
     */
    teacherCollectionReport(params) {
      this.sendAction('teacherCollectionReport', params);
    },

    /**
     * Trigger when student unit level  report clicked
     */
    onOpenStudentUnitLevelReport(params) {
      this.set('showStudentUnitReport', true);
      params.isStudent = this.get('isStudent');
      params.isTeacher = this.get('isTeacher');
      this.set('studentUnitReportContext', params);
    },

    /**
     * Trigger when student lesson   report clicked
     */
    onOpenStudentLessonReport(params) {
      this.set('showStudentLessonReport', true);
      params.isStudent = this.get('isStudent');
      params.isTeacher = this.get('isTeacher');
      this.set('studentLessonReportContext', params);
    }
  },

  // -------------------------------------------------------------------------
  // Events
  /**
   * Load the units and users in the course when the component is instantiated
   */
  initAccordionCourse: Ember.on('init', function() {
    if (this.get('currentClass')) {
      this.setupAccordionCourse();
    } else {
      this.set('loading', false);
      this.set('items', this.get('units'));
    }
    this.fetchClassList();
  }),

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @prop {String} currentResource - Id of the resource in 'userLocation'
   * This value is not expected to change while on the page so it is put into its own
   * property and sent down to the child accordions. This way, each child accordion is
   * not responsible for extracting the value from 'userLocation'.
   */
  currentResource: Ember.computed('userLocation', function() {
    const userLocation = this.get('userLocation');

    if (!userLocation) {
      return;
    }

    var parsedLocation = userLocation.split('+');
    var currentResource = null;

    if (parsedLocation.length === 3) {
      currentResource = parsedLocation[2];
    } else {
      Ember.Logger.warn(
        'The user location does not specify a current resource'
      );
    }
    return currentResource;
  }),

  /**
   * @prop {String} location - Current location that the user has navigated to
   * Combination of unit, lesson and/or resource (collection or assessment) separated by a plus sign
   * @example
   * 'uId001+lId002+cId003'
   */
  location: null,

  /**
   * @prop {Function} onLocationUpdate - Event handler
   */
  onLocationUpdate: null,

  /**
   * @prop {String[]} parsedLocation - Location the user has navigated to
   * parsedLocation[0] - unitId
   * parsedLocation[1] - lessonId
   * parsedLocation[2] - resourceId
   */
  parsedLocation: Ember.computed('location', function() {
    return this.get('location') ? this.get('location').split('+') : [];
  }),

  /**
   * @property {string} go live action name
   */
  onGoLive: 'goLive',

  /**
   * @prop {String} userLocation - Location of a user in a course
   */
  userLocation: null,

  /**
   * Contains only visible units
   * @property {Unit[]} units
   */
  units: null,

  /**
   * Indicates if the current user is a student
   * @property {Boolean}
   */
  isStudent: null,

  /**
   * @prop {Ember.RSVP.Promise} usersLocation - Users enrolled in the course
   * Will resolve to {Location[]}
   */
  usersLocation: Ember.A([]),

  /**
   * Indicates if it is from daily class activities
   * @property {Boolean}
   */
  isFromDCA: null,

  /**
   * Maintains the state of collection report pull up
   * @type {Boolean}
   */
  showCollectionReportPullUp: false,

  /**
   * Maintains the state of student collection  report pull up
   * @type {Boolean}
   */
  showReportPullUp: false,

  /**
   * @property {Boolean} isShowStudentOfflineActivityReport
   * Property to show/hide student offline activity report
   */
  isShowStudentOfflineActivityReport: false,

  /**
   * Help to know is is this loaded from student dashboard
   * @type {Boolean}
   */
  isStudentDashboard: false,

  /**
   * Help to hold the dashboard location
   * @type {Object}
   */
  dashboardLocation: null,

  // -------------------------------------------------------------------------
  // Observers

  /**
   * Observe when the 'items' promise has resolved and proceed to add the
   * corresponding users information (coming from a separate service) to each
   * one of the items so they are resolved in one single loop in the template.
   */
  addUsersToItems: Ember.observer('items', 'usersLocation', function() {
    if (this.get('items.length')) {
      let component = this;
      let visibleItems = this.get('items');
      let usersLocation = component.get('usersLocation');
      visibleItems.forEach(item => {
        // Get the users for a specific unit
        let entity = usersLocation.findBy('unit', item.get('id'));
        if (entity) {
          entity.get('locationUsers').then(locationUsers => {
            item.set('users', locationUsers);
          });
        }
      });
    }
  }),

  /**
   * Observe when the 'currentClass.id' has changed and setup the units accordion
   */
  updateAccordionCourse: Ember.observer('currentClass.id', function() {
    this.setupAccordionCourse();
  }),

  // -------------------------------------------------------------------------
  // Methods

  /**
   * Load the units and users in the course when the component is instantiated or the currentClass id changes
   */
  setupAccordionCourse: function() {
    const component = this;
    component.set('loading', true);

    const classId = component.get('currentClass.id');
    const courseId = component.get('currentClass.courseId');
    const units = component.get('units');

    component
      .get('analyticsService')
      .getCoursePeers(classId, courseId)
      .then(function(coursePeers) {
        Ember.run(function() {
          units.forEach(function(unit) {
            if (!unit.isUnit0) {
              Ember.RSVP.hash({
                tempUnit: component
                  .get('unitService')
                  .fetchById(courseId, unit.id)
              }).then(({ tempUnit }) => {
                tempUnit.children.forEach(function(children) {
                  unit.incrementProperty(
                    'assessmentCount',
                    children.assessmentCount
                  );
                });
              });
            }
            const peer = coursePeers.findBy('id', unit.get('id'));
            if (peer) {
              unit.set('membersCount', peer.get('peerCount'));
            }
          });
          if (
            !(component.get('isDestroyed') || component.get('isDestroying'))
          ) {
            component.set('loading', false);
            component.set('items', units);
          }
        });
      });
  }
});
