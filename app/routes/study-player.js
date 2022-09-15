import Ember from 'ember';
import PlayerRoute from 'gooru-web/routes/player';
import PrivateRouteMixin from 'gooru-web/mixins/private-route-mixin';
import {
  CONTENT_TYPES,
  CLASS_SKYLINE_INITIAL_DESTINATION,
  PLAYER_EVENT_SOURCE,
  DIAGNOSTIC_LESSON_SUGGESTION_EVENTS,
  DEPENDENT_LESSON_SUGGESTION_EVENTS
} from 'gooru-web/config/config';

/**
 * Study Player Route
 *
 * The context player route extends the player route to provide the study player
 * controller with additional information available only to signed-in users
 *
 * @module
 * @extends PlayerRoute
 */
export default PlayerRoute.extend(PrivateRouteMixin, {
  templateName: 'study-player',
  queryParams: {
    collectionId: {
      refreshModel: true
    }
  },

  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @type {SessionService} Service to retrieve session information
   */
  session: Ember.inject.service('session'),

  /**
   * @property {NavigateMapService}
   */
  navigateMapService: Ember.inject.service('api-sdk/navigate-map'),

  /**
   * @type {suggestService} Service to retrieve suggest resources
   */
  suggestService: Ember.inject.service('api-sdk/suggest'),

  /**
   * @property {route0Service}
   */
  route0Service: Ember.inject.service('api-sdk/route0'),

  /**
   * @type {ClassService} Service to retrieve class information
   */
  classService: Ember.inject.service('api-sdk/class'),

  /**
   * @type {SkylineInitialService} Service to retrieve skyline initial service
   */
  skylineInitialService: Ember.inject.service('api-sdk/skyline-initial'),

  /**
   * @property {courseService}
   */
  courseService: Ember.inject.service('api-sdk/course'),

  /**
   * @requires service:api-sdk/course-map
   */
  courseMapService: Ember.inject.service('api-sdk/course-map'),

  /**
   * @requires service:api-sdk/unit0
   */
  unit0Service: Ember.inject.service('api-sdk/unit0'),

  // ------------------------------------------------------------------------
  // Properties

  isDiagnosticPlayer: false,

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    didTransition() {
      /*
       * Pre load timeline data and set that data to model.
       */
      return true; // Bubble the didTransition event
    },
    /**
     * When the submission is complete
     */
    onFinish: function() {
      let controller = this.get('controller');
      let contextId = controller.get('contextResult.contextId');
      let classId = controller.get('classId');
      let milestoneId = controller.get('milestoneId');
      let queryParams = {
        courseId: controller.get('course.id'),
        collectionId: controller.get('collection.id'),
        type: controller.get('type'),
        role: controller.get('role'),
        lessonId: controller.get('lessonId'),
        unitId: controller.get('unitId'),
        contextId,
        source: controller.get('source'),
        minScore: controller.get('minScore'),
        pathType: controller.get('pathType') || '',
        ctxPathType: controller.get('ctxPathType') || '',
        isIframeMode: controller.get('isIframeMode')
      };
      if (classId) {
        queryParams.classId = classId;
      }

      if (milestoneId) {
        queryParams.milestoneId = milestoneId;
      }

      /**@description { next calls moves from on finish and goes into report next }
       * @see study-student-collection > next
       */
      this.transitionTo('reports.study-student-collection', {
        queryParams
      });
    },

    onRefreshModel() {
      // this.set('isDiagnosticPlayer', true);
      this.refresh();
    },

    updateModelM(option) {
      var mdl = this.modelFor(this.routeName);
      Object.assign(mdl, option);
    }
  },
  /**
   *
   * @param {mapcontext} params
   * @description set local storage such  study player gets value from local store when item is being played
   */
  setStudyPlayerForTeacherNotifications(params) {
    const route = this;
    const mapSerializer = route.get('navigateMapService').get('serializer');
    let normDataModel = Ember.Object.create(params);
    let serDataCtx = {};
    serDataCtx.context = mapSerializer.serializeMapContext(normDataModel);
    route
      .get('navigateMapService')
      .getLocalStorage()
      .setItem(
        route.get('navigateMapService').generateKey(),
        JSON.stringify(serDataCtx)
      );
  },

  // -------------------------------------------------------------------------
  // Methods

  beforeModel(transition) {
    this._super(...arguments);
    if (!this.get('session.isAnonymous')) {
      const queryParams = transition.queryParams;
      if (queryParams && queryParams.classId) {
        return this.doCheckClassDestination(queryParams.classId);
      }
    }
  },

  model: function(params) {
    const route = this;
    window.currentlyPlayingClass = null;
    if (params.isNotification) {
      route.setStudyPlayerForTeacherNotifications(params);
    }

    if (
      params.type &&
      (params.type === CONTENT_TYPES.EXTERNAL_ASSESSMENT ||
        params.type === CONTENT_TYPES.EXTERNAL_COLLECTION ||
        params.type === CONTENT_TYPES.OFFLINE_ACTIVITY)
    ) {
      return route.routeToExternalPlayer(params);
    } else {
      return route
        .get('navigateMapService')
        .getMapLocation(params)
        .then(function(mapLocation) {
          const courseId = mapLocation.get('context.courseId');
          const unitId = mapLocation.get('context.unitId');
          const milestoneId = mapLocation.get('context.milestoneId');
          const lessonId = mapLocation.get('context.lessonId');
          const collectionId =
            mapLocation.get('context.itemId') ||
            mapLocation.get('context.collectionId');
          params.type =
            mapLocation.get('context.itemType') ||
            mapLocation.get('context.collectionType') ||
            params.type;
          params.classId = params.classId || mapLocation.get('context.classId');
          params.collectionId =
            params.collectionId || mapLocation.get('context.collectionId');
          params.courseId =
            params.courseId || mapLocation.get('context.courseId');
          const lessonSuggestionStates = [
            ...Object.values(DIAGNOSTIC_LESSON_SUGGESTION_EVENTS),
            ...Object.values(DEPENDENT_LESSON_SUGGESTION_EVENTS)
          ];
          const parmsToPass = {
            courseId,
            unitId,
            lessonId,
            collectionId,
            classId: params.classId
          };
          route.passSourceDetailsNoteTool(parmsToPass);
          const isLessonSuggestion =
            lessonSuggestionStates.includes(
              mapLocation.get('context.status')
            ) ||
            mapLocation.get('context.diagnostic') ||
            mapLocation.get('context.source');

          if (
            mapLocation.get('context') &&
            mapLocation.get('context.diagnostic') &&
            mapLocation.get('context.itemSubType') === 'diagnostic'
          ) {
            params.source = PLAYER_EVENT_SOURCE.DOMAIN_DIAGNOSTIC;
            params.pathType = mapLocation.get('context.pathType');
            if (mapLocation.get('context.pathId')) {
              params.pathId = mapLocation.get('context.pathId');
            }
          }
          if (
            params.type &&
            (params.type === CONTENT_TYPES.EXTERNAL_ASSESSMENT ||
              params.type === CONTENT_TYPES.EXTERNAL_COLLECTION ||
              params.type === CONTENT_TYPES.OFFLINE_ACTIVITY)
          ) {
            return route.routeToExternalPlayer(params);
          }

          var unitPromise = null;
          var lessonPromise = null;
          var notificationNextPromise = null;
          let suggestionLessonPromise = null;
          let dependentLessonPromise = null;
          let unit0Promise = null;
          //Milestone info is required to show breadcrumb
          let milestoneLessonsPromise =
            params.ctxPathType !== 'route0' &&
            params.ctxPathType !== 'unit0' &&
            milestoneId
              ? route
                .get('courseService')
                .getCourseMilestoneLessons(courseId, milestoneId)
              : null;
          if (params.ctxPathType === 'route0') {
            let route0Model = route.get('route0Service').getRoute0({
              classId: params.classId,
              courseId: courseId
            });
            if (route0Model) {
              let units = Ember.Object.create(),
                lessono = Ember.Object.create();
              route0Model.milestones.forEach(function(milestone) {
                milestone.lessons.forEach(function(lesson) {
                  if (lesson.unit_id === unitId) {
                    units = Ember.Object.create({
                      id: lesson.unit_id,
                      title: lesson.unitTitle,
                      sequence: lesson.unitSequence
                    });
                    if (lesson.lesson_id === lessonId) {
                      let cols = [];
                      lesson.collections.forEach(function(col) {
                        cols.push(
                          Ember.Object.create({
                            id: col.id,
                            title: col.collectionTitle,
                            sequence: col.collectionSequence
                          })
                        );
                      });
                      let colobj = Ember.A(cols);
                      lessono = Ember.Object.create({
                        id: lessonId,
                        title: lesson.lesson_title,
                        sequence: lesson.lessonSequence,
                        children: colobj
                      });
                    }
                  }
                });
              });
              let unitmodeldata = Ember.Object.create(units);
              let lessonmodeldata = Ember.Object.create(lessono);
              unitPromise = Ember.RSVP.Promise.resolve(unitmodeldata);
              lessonPromise = Ember.RSVP.Promise.resolve(lessonmodeldata);
            }
          } else if (isLessonSuggestion || params.ctxPathType === 'unit0') {
            let lessonObj = Ember.Object.create({
              id: lessonId
            });
            lessonPromise = Ember.RSVP.Promise.resolve(lessonObj);
          } else {
            unitPromise = route.get('unitService').fetchById(courseId, unitId);
            lessonPromise = route
              .get('lessonService')
              .fetchById(courseId, unitId, lessonId);
          }
          if (params.isNotification) {
            notificationNextPromise = route
              .get('navigateMapService')
              .startCollection(
                courseId,
                unitId,
                lessonId,
                collectionId,
                params.type,
                params.classId,
                +params.pathId,
                params.pathType,
                milestoneId,
                +params.ctxPathId,
                params.ctxPathType
              );
          }

          if (milestoneId && params.classId && params.classId !== 'null') {
            let pathParams = {
              userId: route.get('session.userId'),
              classId: params.classId
            };
            suggestionLessonPromise = route
              .get('courseMapService')
              .fetchMilestoneAlternatePath(milestoneId, pathParams);
            dependentLessonPromise = route
              .get('courseMapService')
              .fetchMilestoneDependentPath(milestoneId, pathParams);
          }

          if (
            params.ctxPathType === 'unit0' &&
            params.classId &&
            params.classId !== 'null'
          ) {
            const unit0Params = {
              classId: params.classId,
              courseId
            };
            unit0Promise = route.get('unit0Service').fetchUnit0(unit0Params);
          }

          return Ember.RSVP.hash({
            course: route.get('courseService').fetchById(courseId),
            unit: unitPromise,
            lesson: lessonPromise,
            suggestionLessons: suggestionLessonPromise,
            dependentLessons: dependentLessonPromise,
            suggestedResources:
              collectionId != null &&
              params &&
              params.type === CONTENT_TYPES.COLLECTION
                ? route
                  .get('suggestService')
                  .suggestResourcesForCollection(
                    route.get('session.userId'),
                    collectionId
                  )
                : null,
            notificationNextStarted: notificationNextPromise,
            milestoneLessons: milestoneLessonsPromise,
            unit0Items: unit0Promise
          }).then(function(hash) {
            //setting query params using the map location
            params.collectionId = collectionId;
            //override the context if next API return's any collection suggestions
            if (
              mapLocation.get('suggestions') &&
              mapLocation.get('suggestions').length > 0
            ) {
              const suggestions = mapLocation.get('suggestions')[0];
              params.collectionId = suggestions.get('id');
              params.type = suggestions.get('type');
            }
            //params.classId = params.classId || mapLocation.get('context.classId');
            params.unitId = params.unitId || mapLocation.get('context.unitId');
            params.lessonId =
              params.lessonId || mapLocation.get('context.lessonId');
            params.pathId = params.pathId || mapLocation.get('context.pathId');
            params.ctxPathId =
              params.ctxPathId || mapLocation.get('context.ctxPathId');
            params.collectionSubType =
              params.subtype || mapLocation.get('context.collectionSubType');
            if (hash.milestoneLessons && hash.milestoneLessons.length) {
              let milestoneLesson = hash.milestoneLessons.findBy(
                'lesson_id',
                hash.lesson.get('id')
              );
              if (
                !milestoneLesson &&
                hash.suggestionLessons &&
                hash.suggestionLessons.length
              ) {
                for (let suggestionLesson of hash.suggestionLessons) {
                  let currentSuggLesson = suggestionLesson.lessonSuggestions.findBy(
                    'lesson_id',
                    hash.lesson.get('id')
                  );
                  if (currentSuggLesson) {
                    hash.lesson.setProperties({
                      title: currentSuggLesson.title,
                      sequence: currentSuggLesson.sequence_id,
                      children: currentSuggLesson.collections
                    });
                    milestoneLesson = hash.milestoneLessons.find(lesson => {
                      let context = suggestionLesson.context;
                      return lesson.tx_domain_code === context.domainCode;
                    });
                    break;
                  }
                }
              }
              if (!milestoneLesson && hash.dependentLessons) {
                let currentDepentLesson = hash.dependentLessons.findBy(
                  'lesson_id',
                  hash.lesson.get('id')
                );

                if (currentDepentLesson) {
                  hash.lesson.setProperties({
                    title: currentDepentLesson.lesson_title,
                    sequence: currentDepentLesson.sequence_id,
                    children: currentDepentLesson.collections
                  });
                  milestoneLesson = hash.milestoneLessons.find(lesson => {
                    return lesson.lesson_id === currentDepentLesson.cxtLessonId;
                  });
                  if (!milestoneLesson) {
                    milestoneLesson = hash.dependentLessons.findBy(
                      'lesson_id',
                      currentDepentLesson.lesson_id
                    );
                  }
                }
              }
              route.parseMilestoneLesson(milestoneLesson, hash.lesson);
            }
            if (
              params.ctxPathType === 'unit0' &&
              hash.unit0Items &&
              hash.unit0Items.length
            ) {
              const unit0Item = hash.unit0Items.findBy(
                'milestone_id',
                `${unitId}-unit0`
              );
              const unit0Lesson = unit0Item
                ? unit0Item.lessons.findBy('lesson_id', hash.lesson.get('id'))
                : null;
              if (unit0Lesson) {
                hash.lesson.setProperties({
                  title: unit0Lesson.lesson_title,
                  sequence: unit0Lesson.lessonSequence,
                  children: unit0Lesson.collections
                });
              }
            }

            // Set the correct unit sequence number
            if (
              params.ctxPathType !== 'route0' &&
              !isLessonSuggestion &&
              params.ctxPathType !== 'unit0'
            ) {
              hash.course.children.find((child, index) => {
                let found = false;
                if (child.get('id') === hash.unit.get('id')) {
                  found = true;
                  hash.unit.set('sequence', index + 1);
                }
                return found;
              });

              // Set the correct lesson sequence number
              hash.unit.children.find((child, index) => {
                let found = false;
                if (child.get('id') === hash.lesson.get('id')) {
                  found = true;
                  hash.lesson.set('sequence', index + 1);
                }
                return found;
              });
            }
            //loads the player model if it has no suggestions
            return route.playerModel(params).then(function(model) {
              return Object.assign(model, {
                course: hash.course,
                unit: hash.unit,
                lesson: hash.lesson,
                mapLocation,
                collectionId: params.collectionId,
                type: params.type,
                minScore: params.minScore,
                suggestedResources: hash.suggestedResources,
                collectionSource: params.collectionSource,
                collectionSubType: params.collectionSubType
              });
            });
          });
        });
    }
  },

  setupController(controller, model) {
    this._super(...arguments);
    window.currentlyPlayingClass = this.get('class');
    const isAnonymous = model.isAnonymous;
    const mapLocation = model.mapLocation;
    controller.setProperties({
      course: model.course,
      unit: model.unit,
      lesson: model.lesson,
      showConfirmation:
        model.collection &&
        !isAnonymous &&
        !controller.get('isDiagnosticPlayer'),
      mapLocation: model.mapLocation,
      classId: mapLocation.get('context.classId'),
      //setting query params variables using the map location
      unitId: mapLocation.get('context.unitId'),
      lessonId: mapLocation.get('context.lessonId'),
      collectionId: model.collectionId,
      courseId: mapLocation.get('context.courseId'),
      type: model.type,
      minScore: model.minScore,
      suggestedResources: model.suggestedResources,
      collectionSource: model.collectionSource,
      collectionSubType: model.collectionSubType,
      isStudyPlayer: true,
      class: this.get('class')
    });
    if (controller.get('isDiagnosticPlayer')) {
      controller.set(
        'isInitiated',
        mapLocation.get('context.diagnostic') || true
      );
      controller.set('isDiagnosticPlayer', false);
    }
  },

  selectMenuItem: function(item) {
    const route = this;
    const controller = route.get('controller');
    const currentItem = controller.get('menuItem');

    if (item !== currentItem) {
      controller.selectMenuItem(item);
      if (item === 'class-management') {
        route.transitionTo('teacher.class.class-management');
      } else if (item === 'course-map') {
        route.transitionTo('teacher.class.course-map');
      } else if (item === 'performance') {
        route.transitionTo('teacher.class.performance');
      } else if (item === 'class-activities') {
        route.transitionTo('teacher.class.class-activities');
      } else if (item === 'close') {
        let backurl = this.get('backUrls');
        backurl = backurl || controller.get('backUrls');
        if (backurl) {
          route.transitionTo(backurl);
        } else {
          if (controller.class.isArchived) {
            route.transitionTo('teacher-home'); //, (query - params showArchivedClasses = "true" showActiveClasses = "false") class="back-to" } }
          } else {
            route.transitionTo('teacher-home');
          }
        }
      }
    }
  },

  deactivate: function() {
    this.get('controller').resetValues();
  },

  doCheckClassDestination(classId) {
    const route = this;
    const classPromise = classId
      ? route.get('classService').readClassInfo(classId)
      : Ember.RSVP.resolve({});
    return classPromise.then(function(classData) {
      route.set('class', classData);
      if (route.findClassIsPermium(classData)) {
        return route
          .get('skylineInitialService')
          .fetchState(classId)
          .then(skylineInitialState => {
            let destination = skylineInitialState.get('destination');
            if (
              destination ===
              CLASS_SKYLINE_INITIAL_DESTINATION.classSetupInComplete
            ) {
              return route.transitionTo(
                'student.class.setup-in-complete',
                classId
              );
            } else if (
              destination ===
                CLASS_SKYLINE_INITIAL_DESTINATION.showDirections ||
              destination === CLASS_SKYLINE_INITIAL_DESTINATION.ILPInProgress
            ) {
              return route.transitionTo('student.class.proficiency', classId);
            } else if (
              destination === CLASS_SKYLINE_INITIAL_DESTINATION.diagnosticPlay
            ) {
              return route.transitionTo(
                'student.class.diagnosis-of-knowledge',
                classId
              );
            }
          });
      }
    });
  },

  /**
   * Method used to identify course is permium or not
   * @return {Boolean}
   */
  findClassIsPermium(aClass) {
    let setting = aClass.get('setting');
    let isPremiumCourse = setting ? setting['course.premium'] : false;
    return isPremiumCourse;
  },

  /**
   * @function parseMilestoneLesson
   * Method to set milestone info into the lessondata to show breadcrumb
   */
  parseMilestoneLesson(milestoneLesson, lessonData) {
    lessonData.set('isMilestoneLesson', true);
    lessonData.set('gradeName', milestoneLesson.get('grade_name'));
    lessonData.set('domainName', milestoneLesson.get('tx_domain_name'));
    lessonData.set('subjectCode', milestoneLesson.get('tx_subject_code'));
  },

  routeToExternalPlayer(params) {
    let queryParams = {
      role: params.role,
      type: params.type,
      sourceId: params.sourceId,
      classId: params.classId,
      courseId: params.courseId,
      unitId: params.unitId,
      lessonId: params.lessonId,
      milestoneId: params.milestoneId,
      collectionId: params.collectionId,
      source: params.source,
      isIframeMode: params.isIframeMode
    };
    return this.transitionTo('study-player-external', {
      queryParams
    });
  },

  passSourceDetailsNoteTool(queryParams) {
    window.sourceDetailsNoteTool = {};
    if (queryParams.classId) {
      window.sourceDetailsNoteTool.class_id = queryParams.classId;
    }
    if (queryParams.courseId) {
      window.sourceDetailsNoteTool.course_id = queryParams.courseId;
    }
    if (queryParams.unitId) {
      window.sourceDetailsNoteTool.unit_id = queryParams.unitId;
    }
    if (queryParams.lessonId) {
      window.sourceDetailsNoteTool.lesson_id = queryParams.lessonId;
    }
    if (queryParams.collectionId) {
      window.sourceDetailsNoteTool.collection_id = queryParams.collectionId;
    }
  }
});
