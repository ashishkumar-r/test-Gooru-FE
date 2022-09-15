import Ember from 'ember';
import PrivateRouteMixin from 'gooru-web/mixins/private-route-mixin';
import visibilitySettings from 'gooru-web/mixins/visibility-settings';
import { ROLES, PLAYER_EVENT_SOURCE } from 'gooru-web/config/config';
import {
  hasSuggestions,
  createStudyPlayerQueryParams,
  currentLocationToMapContext
} from 'gooru-web/utils/navigation-util';
import {
  flattenGutToFwCompetency,
  flattenGutToFwDomain
} from 'gooru-web/utils/taxonomy';
export default Ember.Route.extend(visibilitySettings, PrivateRouteMixin, {
  queryParams: {
    refresh: {
      refreshModel: true
    },
    subProgramId: null
  },

  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @type {ClassService} Service to retrieve class information
   */
  classService: Ember.inject.service('api-sdk/class'),

  /**
   * @type {PerformanceService} Service to retrieve class performance summary
   */
  performanceService: Ember.inject.service('api-sdk/performance'),

  /**
   * @type {CourseService} Service to retrieve course information
   */
  courseService: Ember.inject.service('api-sdk/course'),

  /**
   * @type {UnitService} Service to retrieve unit information
   */
  unitService: Ember.inject.service('api-sdk/unit'),

  /**
   * taxonomy service dependency injection
   * @type {Object}
   */
  taxonomyService: Ember.inject.service('taxonomy'),

  analyticsService: Ember.inject.service('api-sdk/analytics'),

  /**
   * @property {NavigateMapService}
   */
  navigateMapService: Ember.inject.service('api-sdk/navigate-map'),

  /**
   * @type {i18nService} Service to retrieve translations information
   */
  i18n: Ember.inject.service(),

  /**
   * @type {SkylineInitialService} Service to retrieve skyline initial service
   */
  skylineInitialService: Ember.inject.service('api-sdk/skyline-initial'),

  /**
   * @requires service:api-sdk/competency
   */
  competencyService: Ember.inject.service('api-sdk/competency'),

  /**
   * @type {reportService} Service to retrieve report information
   */
  reportService: Ember.inject.service('api-sdk/report'),

  /**
   * @requires service:api-sdk/unit0Service
   */
  unit0Service: Ember.inject.service('api-sdk/unit0'),

  lookupService: Ember.inject.service('api-sdk/lookup'),

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Triggered when a class menu item is selected
     * @param {string} item
     */
    selectMenuItem: function(item) {
      const route = this;
      const controller = route.get('controller');
      const currentItem = controller.get('menuItem');
      controller.set('isNotAbleToStartPlayer', false);
      if (item !== currentItem) {
        controller.selectMenuItem(item);
        const queryParams = {
          queryParams: {
            filterBy: 'assessment'
          }
        };

        if (item === 'performance') {
          route.transitionTo('student.class.performance', queryParams);
        } else if (item === 'course-map') {
          route.transitionTo('student.class.course-map');
        } else if (item === 'class-activities') {
          route.transitionTo('student.class.class-activities');
        } else if (item === 'study-player') {
          route.studyPlayer(controller.get('classmodel').currentLocation);
        } else if (item === 'profile-prof') {
          let userId = this.get('session.userId');
          controller.transitionToRoute(
            'student.class.student-learner-proficiency',
            {
              queryParams: {
                userId: userId,
                classId: controller.get('class').id,
                courseId: controller.get('course').id,
                role: 'student'
              }
            }
          );
        } else if (item === 'dashboard') {
          route.transitionTo('student.class.dashboard');
        }
      }
    }
  },
  /**
   * Open the player with the specific currentLocation
   *
   * @function actions:playItem
   * @param {string} currentLocation - All the params for the currentLocation
   * @summary
   * 1.  Current location null or Empty > Next call with 'continue' (continue on courseId, classId ) > Study player
   * 1.1 Handle suggestions when 'continue' and there is a teacher suggestion > Send suggestion to study player (should prompt for start dialog )
   * 2.  Current location with status not complete > NO next call, launch study player directly
   * 3.  Current location with status complete. Next call with 'content-served' (start on courseId, classId, pathId, pathType, ...  +SCORE) > Study Player
   * 3.1 Handle suggestions when 'content-served' and there is a suggestion > Send suggestion to Study Player (should prompt for accept/ignore dialog )
   */
  studyPlayer: function(currentLocation) {
    const route = this;
    const controller = route.get('controller');
    const navMapServc = route.get('navigateMapService');
    let locationContext = currentLocation
      ? currentLocationToMapContext(currentLocation)
      : null;
    controller.set('locationContext', locationContext);
    let options = {
        role: ROLES.STUDENT,
        source: PLAYER_EVENT_SOURCE.COURSE_MAP,
        courseId: controller.get('course').id,
        classId: controller.get('class').id
      },
      nextPromise = null;
    if (currentLocation == null || currentLocation === '') {
      nextPromise = navMapServc.continueCourse(
        options.courseId,
        options.classId
      ); //Complete
    } else if (currentLocation.get('status') === 'complete') {
      //content_served
      nextPromise = navMapServc.contentServedResource(locationContext);
    } else {
      // Next not required, get the params from current location when in-progress
      // in-progress case- when in progress score is null by location api
      nextPromise = route.nextPromiseHandler(locationContext);
    }

    nextPromise
      .then(route.nextPromiseHandler)
      .then(parsedOptions => {
        let content = Ember.Object.create({
          title: currentLocation.get('collectionTitle'),
          format: currentLocation.get('collectionType')
        });
        return route.launchStudyPlayer(parsedOptions, content);
      })
      .catch(() => {
        controller.set('isNotAbleToStartPlayer', true);
      });
  },

  /** returns options promise chain resolving response
   * @param
   */
  nextPromiseHandler(resp) {
    let queryParams = {
      role: ROLES.STUDENT,
      source: PLAYER_EVENT_SOURCE.COURSE_MAP,
      courseId: hasSuggestions(resp) ? resp.context.courseId : resp.courseId, // Only in case of suggestions we dont have courseId in suggestion
      classId: hasSuggestions(resp) ? resp.context.classId : resp.classId // Only in case of suggestions we dont have classId in suggestion
    };
    queryParams = createStudyPlayerQueryParams(
      hasSuggestions(resp) ? resp.suggestions[0] : resp.context || resp,
      queryParams
    );
    let isContentMapped = true;
    var respctx = hasSuggestions(resp) || resp.context ? resp.context : resp;
    queryParams.lessonId = respctx.lessonId;
    queryParams.courseId = respctx.courseId;
    queryParams.collectionId = respctx.collectionId;
    queryParams.unitId = respctx.unitId;
    queryParams.collectionType = resp.type || respctx.type;
    queryParams.type = respctx.itemType;
    queryParams.role = ROLES.STUDENT;
    queryParams.source = PLAYER_EVENT_SOURCE.COURSE_MAP;
    if (hasSuggestions(resp)) {
      queryParams.hasSuggestion = resp.suggestions[0].id;
    }
    isContentMapped = !!queryParams.collectionId;
    if (isContentMapped) {
      return Ember.RSVP.resolve(queryParams);
    } else {
      return Ember.RSVP.reject(null);
    }
  },

  /**
   * launches study player
   * @param options {object} is the queryParams required to launch study-player
   */
  launchStudyPlayer(queryParams, content) {
    const route = this;
    const controller = route.get('controller');
    if (queryParams.hasSuggestion) {
      route.transitionTo('reports.study-student-collection', {
        queryParams
      });
    } else {
      queryParams.isIframeMode = true;
      controller.set(
        'playerUrl',
        route
          .get('router')
          .generate('study-player', queryParams.courseId, { queryParams })
      );
      controller.set('isOpenPlayer', true);
      controller.set('playerContent', content);
    }
  },

  // -------------------------------------------------------------------------
  // Methods

  /**
   * Get model for the controller
   */
  model: function(params) {
    const route = this;
    const myId = route.get('session.userId');
    const classId = params.classId;
    const classPromise = route.get('classService').readClassInfo(classId);
    const membersPromise = route.get('classService').readClassMembers(classId);

    return classPromise.then(function(classData) {
      let classCourseId = null;
      if (classData.courseId) {
        classCourseId = Ember.A([
          {
            classId: params.classId,
            courseId: classData.courseId
          }
        ]);
      }
      const performanceSummaryPromise = classCourseId
        ? route
          .get('performanceService')
          .findClassPerformanceSummaryByStudentAndClassIds(
            myId,
            classCourseId
          )
        : null;
      let caClassPerfSummaryPromise = route
        .get('performanceService')
        .getCAPerformanceData([classId], myId);
      return Ember.RSVP.hash({
        class: classPromise,
        members: membersPromise,
        classPerformanceSummaryItems: performanceSummaryPromise,
        performanceSummaryForDCA: caClassPerfSummaryPromise
      }).then(function(hash) {
        const aClass = hash.class;
        const members = hash.members;
        const preference = aClass.get('preference');
        const classPerformanceSummaryItems = hash.classPerformanceSummaryItems;
        let classPerformanceSummary = classPerformanceSummaryItems
          ? classPerformanceSummaryItems.findBy('classId', classId)
          : null;
        aClass.set('performanceSummary', classPerformanceSummary);
        const performanceSummaryForDCA = hash.performanceSummaryForDCA
          ? hash.performanceSummaryForDCA.objectAt(0)
          : null;
        aClass.set('performanceSummaryForDCA', performanceSummaryForDCA);
        const courseId = aClass.get('courseId');
        let visibilityPromise = Ember.RSVP.resolve([]);
        let coursePromise = Ember.RSVP.resolve(Ember.Object.create({}));
        let unit0Promise = Ember.RSVP.resolve(Ember.A([]));
        let skylineInitialStatePromise = Ember.RSVP.resolve(
          Ember.Object.create({})
        );
        let isPremiumCourse = route.findClassIsPermium(aClass);
        let isPublicClass = aClass.get('isPublic');
        if (courseId) {
          visibilityPromise = route
            .get('classService')
            .readClassContentVisibility(classId);
          coursePromise = route.get('courseService').fetchById(courseId);
          unit0Promise = route
            .get('unit0Service')
            .fetchUnit0({ classId, courseId });
          if (isPremiumCourse) {
            if (isPublicClass) {
              let memberGradeBounds = members.get('memberGradeBounds');
              let gradeBounds = memberGradeBounds.findBy(myId);
              let studentGradeBound = Ember.Object.create(
                gradeBounds.get(myId)
              );
              if (
                studentGradeBound.get('grade_lower_bound') &&
                studentGradeBound.get('grade_upper_bound')
              ) {
                skylineInitialStatePromise = route
                  .get('skylineInitialService')
                  .fetchState(classId);
              }
            } else {
              skylineInitialStatePromise = route
                .get('skylineInitialService')
                .fetchState(classId);
            }
          }
        }
        const competencyCompletionStats =
          isPremiumCourse && preference
            ? route
              .get('competencyService')
              .getCompetencyCompletionStats(
                [{ classId: classId, subjectCode: preference.subject }],
                myId
              )
            : Ember.RSVP.resolve(Ember.A());

        //Pass courseId as query param for student current location
        let locationQueryParam = {
          courseId
        };

        if (
          aClass.milestoneViewApplicable &&
          aClass.milestoneViewApplicable === true &&
          aClass.preference &&
          aClass.preference.framework
        ) {
          locationQueryParam.fwCode = aClass.preference.framework;
        }

        const frameworkId = aClass.get('preference.framework');
        const subjectId = aClass.get('preference.subject');
        let crossWalkFWCPromise = null;
        if (frameworkId && subjectId) {
          crossWalkFWCPromise = route
            .get('taxonomyService')
            .fetchCrossWalkFWC(frameworkId, subjectId);
        }
        var userLocationPromise = route
          .get('analyticsService')
          .getUserCurrentLocation(classId, myId, locationQueryParam);
        var shareData = route.getTenantSetting();
        const dataParam = {
          classId: classId,
          userId: myId,
          to: moment().format('YYYY-MM-DD')
        };
        const timeSpentPromise = route
          .get('reportService')
          .fetchStudentTimespentReport(dataParam);

        const navigatorSubProgram = params.subProgramId
          ? route.get('lookupService').readNavigatorSubPrograms()
          : null;

        return Ember.RSVP.hash({
          contentVisibility: visibilityPromise,
          course: coursePromise,
          skylineInitialState: skylineInitialStatePromise,
          currentLocation: userLocationPromise,
          competencyStats: competencyCompletionStats,
          crossWalkFWC: crossWalkFWCPromise,
          shareData: shareData,
          studentTimespentData: timeSpentPromise,
          unit0Content: unit0Promise,
          navigatorSubProgram: navigatorSubProgram
        }).then(function(hash) {
          const contentVisibility = hash.contentVisibility;
          const studentTimespentData = hash.studentTimespentData;
          const course = hash.course;
          course.set('unit0Content', hash.unit0Content);
          const crossWalkFWC = hash.crossWalkFWC || [];
          let currentLocation = hash.currentLocation;
          const skylineInitialState = hash.skylineInitialState;
          const tenantSetting = hash.shareData;
          aClass.set(
            'isShareData',
            tenantSetting.enable_learners_data_visibilty_pref === 'on' &&
              !aClass.isPublic
          );
          aClass.set('owner', members.get('owner'));
          aClass.set('invitees', members.get('invitees'));
          aClass.set('details', members.get('details'));
          aClass.set('collaborators', members.get('collaborators'));
          aClass.set('members', members.get('members'));
          aClass.set('memberGradeBounds', members.get('memberGradeBounds'));
          aClass.set('currentLocation', currentLocation);
          aClass.set(
            'competencyStats',
            hash.competencyStats.findBy('classId', classId)
          );
          return Ember.RSVP.hash({
            class: aClass,
            course: course,
            members: members,
            units: course.get('children') || [],
            contentVisibility: contentVisibility,
            currentLocation: currentLocation,
            skylineInitialState: skylineInitialState,
            isPremiumCourse: isPremiumCourse,
            tenantSetting: tenantSetting,
            crossWalkFWC,
            studentTimespentData: studentTimespentData,
            unit0Content: hash.unit0Content,
            navigatorSubProgram: hash.navigatorSubProgram,
            subProgramId: params.subProgramId
          });
        });
      });
    });
  },

  /**
   * Set all controller properties from the model
   * @param controller
   * @param model
   */
  setupController: function(controller, model) {
    controller.set('class', model.class);
    controller.set('course', model.course);
    controller.set('units', model.units);
    controller.set('contentVisibility', model.contentVisibility);
    controller.set('skylineInitialState', model.skylineInitialState);
    controller.set('isPremiumCourse', model.isPremiumCourse);
    controller.set('tenantSetting', model.tenantSetting);
    controller.set('classmodel', model);
    controller.set('studentTimespentData', model.studentTimespentData);
    if (model.navigatorSubProgram) {
      let activeSubPrograme = model.navigatorSubProgram.find(
        item => item.id === parseInt(model.subProgramId, 0)
      );
      controller.set('activeSubPrograme', activeSubPrograme);
    }
    if (model.crossWalkFWC) {
      controller.set(
        'fwCompetencies',
        flattenGutToFwCompetency(model.crossWalkFWC)
      );
      controller.set('fwDomains', flattenGutToFwDomain(model.crossWalkFWC));
      if (model.isDisableNavbar) {
        controller.set('isDisableNavbar', model.isDisableNavbar);
      }
    }
  },

  resetController(controller) {
    controller.set('isNotAbleToStartPlayer', false);
    controller.set('isDisableNavbar', false);
    controller.set('activeSubPrograme', null);
  },

  /**
   * Method used to identify course is permium or not
   * @return {Boolean}
   */
  findClassIsPermium(aClass) {
    let setting = aClass.get('setting');
    let isPremiumCourse = setting ? setting['course.premium'] : false;
    return isPremiumCourse;
  }
});
