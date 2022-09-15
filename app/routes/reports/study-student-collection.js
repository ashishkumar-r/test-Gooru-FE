import Ember from 'ember';
import StudentCollection from 'gooru-web/routes/reports/student-collection';
import PrivateRouteMixin from 'gooru-web/mixins/private-route-mixin';
import {
  PLAYER_EVENT_MESSAGE,
  DIAGNOSTIC_LESSON_SUGGESTION_EVENTS,
  DEPENDENT_LESSON_SUGGESTION_EVENTS
} from 'gooru-web/config/config';

/**
 *
 * Analytics data for a student related to a collection of resources
 * Gathers and passes the necessary information to the controller
 *
 * @module
 * @augments ember/Route
 */
export default StudentCollection.extend(PrivateRouteMixin, {
  templateName: 'reports/study-student-collection',

  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @property {NavigateMapService}
   */
  navigateMapService: Ember.inject.service('api-sdk/navigate-map'),

  /**
   * @type {UnitService} Service to retrieve course information
   */
  courseService: Ember.inject.service('api-sdk/course'),

  /**
   * @type {UnitService} Service to retrieve unit information
   */
  unitService: Ember.inject.service('api-sdk/unit'),

  /**
   * @type {LessonService} Service to retrieve unit information
   */
  lessonService: Ember.inject.service('api-sdk/lesson'),

  taxonomyService: Ember.inject.service('api-sdk/taxonomy'),

  /**
   * provides route 0
   */
  route0Service: Ember.inject.service('api-sdk/route0'),

  /**
   * @type {reportService} Service to retrieve report information
   */
  reportService: Ember.inject.service('api-sdk/report'),

  session: Ember.inject.service(),

  /**
   * @requires service:api-sdk/course-map
   */
  courseMapService: Ember.inject.service('api-sdk/course-map'),

  /**
   * @requires service:api-sdk/unit0
   */
  unit0Service: Ember.inject.service('api-sdk/unit0'),

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @param {{ assessmentId: string, resourceId: string }} params
   */
  model(params, transition) {
    let route = this;
    let courseId = params.courseId;
    let unitId = params.unitId;
    let lessonId = params.lessonId;
    let navigateMapService = route.get('navigateMapService');
    let studentCollectionModel;
    const ctxPathType =
      params.ctxPathType || transition.queryParams.ctxPathType;
    let isLessonSuggestion = false;

    params.contextId = params.contextId === 'null' ? null : params.contextId;
    return Ember.RSVP.hash({
      mapLocation: navigateMapService.getMapLocation(params),
      collectionModel: route.studentCollectionModel(params)
    })
      .then(({ mapLocation, collectionModel }) => {
        studentCollectionModel = collectionModel;
        var unitPromise = null;
        var lessonPromise = null;
        var route0Promise = null;
        var suggestionLessonPromise = null;
        let dependentLessonPromise = null;
        let unit0Promise = null;

        const lessonSuggestionStates = [
          ...Object.values(DIAGNOSTIC_LESSON_SUGGESTION_EVENTS),
          ...Object.values(DEPENDENT_LESSON_SUGGESTION_EVENTS)
        ];
        isLessonSuggestion =
          lessonSuggestionStates.includes(mapLocation.get('context.status')) ||
          mapLocation.get('context.diagnostic') ||
          mapLocation.get('context.source');
        if (ctxPathType === 'route0') {
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
                }
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
              });
            });
            let unitmodeldata = Ember.Object.create(units);
            let lessonmodeldata = Ember.Object.create(lessono);
            unitPromise = Ember.RSVP.Promise.resolve(unitmodeldata);
            lessonPromise = Ember.RSVP.Promise.resolve(lessonmodeldata);
            route0Promise = Ember.RSVP.Promise.resolve(route0Model.milestones);
          }
        } else if (isLessonSuggestion || ctxPathType === 'unit0') {
          let milestoneId = params.milestoneId;
          let lessonObj = Ember.Object.create({
            id: lessonId
          });
          lessonPromise = Ember.RSVP.resolve(lessonObj);
          if (
            milestoneId &&
            milestoneId !== 'null' &&
            params.classId &&
            params.classId !== 'null'
          ) {
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
            ctxPathType === 'unit0' &&
            params.classId &&
            params.classId !== 'null'
          ) {
            const unit0Params = {
              classId: params.classId,
              courseId
            };
            unit0Promise = route.get('unit0Service').fetchUnit0(unit0Params);
          }
        } else {
          unitPromise = route.get('unitService').fetchById(courseId, unitId);
          lessonPromise = route
            .get('lessonService')
            .fetchById(courseId, unitId, lessonId);
        }
        let timeSpentPromise = Ember.RSVP.Promise.resolve([]);
        if (params.classId) {
          const myId = route.get('session.userId');
          const dataParam = {
            classId: params.classId,
            userId: myId,
            to: moment().format('YYYY-MM-DD')
          };
          timeSpentPromise = route
            .get('reportService')
            .fetchStudentTimespentReport(dataParam);
        }
        const preference = route.get('currentClass.preference');
        let gradesFilter = {
          subject: preference ? preference.get('subject') : null
        };
        if (preference && preference.framework) {
          gradesFilter.fw_code = preference.get('framework');
        }
        return Ember.RSVP.hash({
          course: route.get('courseService').fetchById(courseId),
          unit: unitPromise,
          lesson: lessonPromise,
          mapLocation: mapLocation,
          minScore: params.minScore,
          suggestionLessons: suggestionLessonPromise,
          dependentLessons: dependentLessonPromise,
          studentTimespentData: timeSpentPromise,
          source: params.source,
          milestones: route.fetchMilestoneDetails(),
          route0Milestone: route0Promise,
          unit0Items: unit0Promise,
          grades: preference
            ? route.get('taxonomyService').fetchGradesBySubject(gradesFilter)
            : null
        });
      })
      .then(function(hash) {
        if (hash.suggestionLessons && hash.suggestionLessons.length) {
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
              break;
            }
          }
        }
        if (hash.dependentLessons) {
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
          }
        }
        if (hash.unit0Items && hash.unit0Items.length) {
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

        if (params.contextId !== null) {
          studentCollectionModel.contextId = params.contextId;
          studentCollectionModel.hasSuggestion =
            transition.queryParams.hasSuggestion;
        }
        if (
          ctxPathType !== 'route0' &&
          !isLessonSuggestion &&
          ctxPathType !== 'unit0'
        ) {
          // Set the correct unit sequence number
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
        return Object.assign(studentCollectionModel, hash);
      });
  },

  setupController(controller, model) {
    window.parent.postMessage(PLAYER_EVENT_MESSAGE.GRU_LOADING_COMPLETED, '*');
    this._super(...arguments);
    controller.setProperties({
      course: model.course,
      unit: model.unit,
      lesson: model.lesson,
      mapLocation: model.mapLocation,
      profile: model.profile,
      minScore: model.minScore,
      contextId: model.contextId,
      hasSuggestion: model.hasSuggestion,
      source: model.source,
      collectionObj: this.get('collectionObj'),
      studentTimespentData: model.studentTimespentData,
      route0Milestone: model.route0Milestone,
      milestones: model.grades
        ? this.renderMilestonesBasedOnStudentGradeRange(
          model.grades,
          model.milestones,
          model.route0Milestone
        )
        : null,
      grades: model.grades ? model.grades : null
    });
    controller.confettiSetup();
    controller.initializer();
  },

  fetchMilestoneDetails() {
    let route = this;
    const currentClass = route.get('currentClass');
    const milestoneViewApplicable = currentClass.get('milestoneViewApplicable');
    const classId = currentClass.get('id');
    const courseId = currentClass.get('courseId');
    const fwCode = currentClass.get('preference.framework') || 'GUT';

    return milestoneViewApplicable
      ? route
        .get('courseService')
        .getCourseMilestones(
          courseId,
          fwCode,
          classId,
          route.get('session.userId')
        )
      : Ember.A([]);
  },

  /**
   * This Method is responsible for milestone display based on students class grade.
   * @return {Array}
   */
  renderMilestonesBasedOnStudentGradeRange(
    grades,
    milestones,
    route0Milestones
  ) {
    let route = this;
    let gradeBounds = route.get('currentClass.memberGradeBounds');
    let userUid = route.get('session.userId');
    let gradeBound = gradeBounds.findBy(userUid);
    let milestoneData = Ember.A([]);
    let studentGradeBound = Ember.Object.create(gradeBound.get(userUid));
    let classGradeId = route.get('currentClass.gradeCurrent');
    let isPublic = route.get('isPublic');
    let classGradeLowerBound = studentGradeBound.get('grade_lower_bound');
    let gradeUpperBound = studentGradeBound.get('grade_upper_bound');
    let startGrade = grades.findBy('id', classGradeLowerBound);
    let startGradeIndex = grades.indexOf(startGrade);
    let endGrade = grades.findBy('id', gradeUpperBound);
    let endGradeIndex = grades.indexOf(endGrade);
    let studentGrades = grades.slice(startGradeIndex, endGradeIndex + 1);

    milestones.forEach((milestone, index) => {
      let gradeId = milestone.get('grade_id');
      milestone.set('hasLessonFetched', false);
      milestone.set('prevMilestoneIsActive', false);
      milestone.set('isActive', false);
      milestone.set('prevMilestoneRescope', false);
      milestone.set('rescope', false);
      let grade = studentGrades.findBy('id', gradeId);
      if (grade) {
        if (gradeId === classGradeId && !isPublic) {
          milestone.set('isClassGrade', true);
        }
        let milestoneIndex = this.get('totalRoute0Milestones') + index + 1;
        milestone.set('milestoneIndex', milestoneIndex);
        milestoneData.pushObject(milestone);
      }
    });
    if (route0Milestones && route0Milestones.length) {
      return [...route0Milestones, ...milestoneData];
    }
    return milestoneData;
  },

  deactivate: function() {
    this.get('controller').resetValues();
  }
});
