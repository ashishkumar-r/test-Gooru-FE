import Ember from 'ember';
import {
  ROLES,
  PLAYER_EVENT_SOURCE,
  CLASS_SKYLINE_INITIAL_DESTINATION
} from 'gooru-web/config/config';
import {
  createStudyPlayerQueryParams,
  hasSuggestions
} from 'gooru-web/utils/navigation-util';
import tenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';

export default Ember.Controller.extend(tenantSettingsMixin, {
  queryParams: ['proficiencyType', 'isNavigatePrograme'],

  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @type {SkylineInitialService} Service to retrieve skyline initial service
   */
  skylineInitialService: Ember.inject.service('api-sdk/skyline-initial'),

  classController: Ember.inject.controller('student.class'),

  /**
   * @property {NavigateMapService}
   */
  navigateMapService: Ember.inject.service('api-sdk/navigate-map'),

  /**
   * @type {ClassService} Service to retrieve class information
   */
  classService: Ember.inject.service('api-sdk/class'),

  /**
   * @property {Service} I18N service
   */
  i18n: Ember.inject.service(),

  /**
   * @property {Service} Notifications service
   */
  notifications: Ember.inject.service(),

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * Action triggered when select next action
     */
    onMoveNext(curStep) {
      let controller = this;
      if (curStep === 'playNext') {
        controller.startPlaying();
      } else if (curStep === 'route') {
        let classId = controller.get('classId');
        controller.get('classService').updateProfileBaseline(classId);
      }
    },

    closePullUp() {
      const component = this;
      let classId = component.get('classId');
      const queryParam = {
        queryParams: {
          isProficiencyValue: true
        }
      };
      component.set('isOpenPlayer', false);
      component.transitionToRoute(
        'student.class.course-map',
        classId,
        queryParam
      );
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Boolean} isShowRoute0Destination
   */
  isShowRoute0Destination: false,

  /**
   * @property {Boolean} isShowInspectDestination
   */
  isShowInspectDestination: false,

  /**
   * @property {Boolean} isRoute0Applicable
   */
  isRoute0Applicable: Ember.computed('class', function() {
    let controller = this;
    let classData = controller.get('class');
    return classData.get('route0Applicable');
  }),

  activeSubPrograme: null,

  /**
   * @property {Number} classGrade
   */
  classGrade: Ember.computed('class', function() {
    let controller = this;
    let classData = controller.get('class');
    let classGrade = classData.get('gradeCurrent');
    return classGrade ? parseInt(classGrade) : null;
  }),

  /**
   * @property {UUID} classId
   */
  classId: Ember.computed.alias('class.id'),

  /**
   * @property {UUID} courseId
   */
  courseId: Ember.computed.alias('class.courseId'),

  /**
   * @property {String} subjectCode
   */
  subjectCode: Ember.computed.alias('class.preference.subject'),

  /**
   * Property used to identify destination.
   * @type {String}
   */
  destination: Ember.computed.alias('skylineInitialState.destination'),

  /**
   * Property used to identify the status of LP computation
   * @type {Boolean}
   */
  isLPComputeInprogress: Ember.computed.equal(
    'destination',
    CLASS_SKYLINE_INITIAL_DESTINATION.ILPInProgress
  ),

  /**
   * Maintains the status check interval value
   * @return {Number}
   */
  pollingStatusCheckInterval: 5000,

  /**
   * Maintains state of chart needs to redraw or not.
   * @type {Boolean}
   */
  reDrawChart: false,

  /**
   * Maintains the state check interval object
   */
  stateCheckInterval: null,

  /**
   * Prop to check whether the public class contain any study material or not
   * @type {Boolean}
   */
  isNoStudyMaterial: false,

  // -------------------------------------------------------------------------
  // Methods

  initialize() {
    let controller = this;
    controller._super(...arguments);
    Ember.run.scheduleOnce('afterRender', controller, function() {
      controller.checkStateOfSkylineInitial();
    });
  },

  /**
   * Method used to check the status of  skyline initial.
   */
  checkStateOfSkylineInitial() {
    let controller = this;
    let isLPComputeInprogress = controller.get('isLPComputeInprogress');
    if (isLPComputeInprogress) {
      let pollingStatusCheckInterval = controller.get(
        'pollingStatusCheckInterval'
      );
      let stateCheckInterval = Ember.run.later(function() {
        controller.loadSkylineIntialState();
      }, pollingStatusCheckInterval);
      controller.set('stateCheckInterval', stateCheckInterval);
    }
  },

  /**
   * Method used to load the skyline intial state data
   */
  loadSkylineIntialState() {
    let controller = this;
    let classId = controller.get('classId');
    controller
      .get('skylineInitialService')
      .fetchState(classId)
      .then(skylineInitialStateRes => {
        if (!controller.get('isDestroyed')) {
          let skylineInitialState = controller.get('skylineInitialState');
          skylineInitialState.set(
            'destination',
            skylineInitialStateRes.get('destination')
          );
          skylineInitialState.set(
            'context',
            skylineInitialStateRes.get('context')
          );
          let isLPComputeInprogress = controller.get('isLPComputeInprogress');
          if (isLPComputeInprogress) {
            controller.checkStateOfSkylineInitial();
          } else {
            controller.set('reDrawChart', true);
          }
        }
      });
  },

  /**
   * @function startPlaying
   * Method to play first item that needs to be played
   */
  startPlaying() {
    const controller = this;
    let classData = controller.get('class');
    let navigateMapService = controller.get('navigateMapService');
    let classId = classData.get('id');
    let courseId = classData.get('courseId');
    let options = {
        role: ROLES.STUDENT,
        source: PLAYER_EVENT_SOURCE.COURSE_MAP,
        courseId,
        classId
      },
      nextPromise = null;
    //start studying
    nextPromise = navigateMapService.continueCourse(
      options.courseId,
      options.classId
    );

    controller.get('notifications').clear();
    controller.get('notifications').setOptions({
      positionClass: 'toast-top-full-width student-class-proficiency'
    });
    nextPromise
      .then(controller.nextPromiseHandler)
      .then(queryParams => {
        if (queryParams.collectionId) {
          queryParams.isIframeMode = true;
          let playerContent = Ember.Object.create({
            format: queryParams.type
          });
          controller.set(
            'playerUrl',
            controller.target.get('router').generate('study-player', courseId, {
              queryParams
            })
          );
          controller.set('isOpenPlayer', true);
          controller.set('playerContent', playerContent);
        } else {
          controller.handleNoContent();
        }
      })
      .catch(() => {
        controller.handleNoContent();
      });
  },

  /**
   * @function handleNoContent
   * Method to show the error message for no studymaterial in content
   */
  handleNoContent() {
    const controller = this;
    let navigateMapService = controller.get('navigateMapService');
    if (controller.get('class.isPublic')) {
      controller.set('isNoStudyMaterial', true);
    } else {
      controller.set('isNoStudyMaterial', true);
      navigateMapService
        .getLocalStorage()
        .removeItem(navigateMapService.generateKey());
    }
  },

  /**
   * @function nextPromiseHandler
   */
  nextPromiseHandler(resp) {
    let queryParams = {
      role: ROLES.STUDENT,
      source: PLAYER_EVENT_SOURCE.COURSE_MAP,
      courseId: hasSuggestions(resp) ? resp.context.courseId : resp.courseId, // Only in case of suggestions we dont have courseId in suggestion
      type: resp.context.current_item_type || null
    };
    queryParams = createStudyPlayerQueryParams(
      hasSuggestions(resp) ? resp.suggestions[0] : resp.context || resp,
      queryParams
    );
    return Ember.RSVP.resolve(queryParams);
  }
});
