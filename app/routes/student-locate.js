import Ember from 'ember';

export default Ember.Route.extend({
  queryParams: {
    classId: {
      refreshModel: true
    },
    courseId: {
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
   * @type {ClassService} Service to retrieve class information
   */
  classService: Ember.inject.service('api-sdk/class'),
  /**
   * @type {ChronoPerformanceService} Service to retrieve student activities information
   */
  chronoPerformanceService: Ember.inject.service('api-sdk/chrono-performance'),
  /**
   * @type {PerformanceService} Service to retrieve class performance summary
   */
  performanceService: Ember.inject.service('api-sdk/performance'),

  /**
   * competency service dependency injection
   * @type {Object}
   */
  competencyService: Ember.inject.service('api-sdk/competency'),

  /**
   * @type {CourseService} Service to retrieve course information
   */
  courseService: Ember.inject.service('api-sdk/course'),

  limit: 30,

  model: function(params) {
    let route = this;
    route._super(...arguments);
    const userId = route.get('session.userId');
    const classId = params.classId;
    const courseId = params.courseId;
    const classPromise = classId
      ? route.get('classService').readClassInfo(classId)
      : null;
    const coursePromise = route.get('courseService').fetchById(courseId);
    return coursePromise.then(function(courseData) {
      let classCourseId = null;
      if (classId) {
        classCourseId = Ember.A([
          {
            classId: classId,
            courseId: courseId
          }
        ]);
      }
      const performanceSummaryPromise = classCourseId
        ? route
          .get('performanceService')
          .findClassPerformanceSummaryByStudentAndClassIds(
            userId,
            classCourseId
          )
        : null;
      let subjectId = courseData.subject;
      if (courseData.version !== 'premium') {
        subjectId = subjectId.substring(subjectId.indexOf('.') + 1);
      }
      const studentActivityPromise = route.getStudentActivities(
        userId,
        classId,
        courseId
      );
      const competencyMatrixPromise = route
        .get('competencyService')
        .getCompetencyMatrixDomain(userId, subjectId);
      return Ember.RSVP.hash({
        class: classPromise,
        classPerformanceSummaryItems: performanceSummaryPromise,
        course: coursePromise,
        studentActivity: studentActivityPromise,
        competencyMatrix: competencyMatrixPromise
      }).then(function(hash) {
        const aClass = hash.class;
        const course = hash.course;
        const classPerformanceSummaryItems = hash.classPerformanceSummaryItems;
        const studentActivities = hash.studentActivity;
        const competencyMatrix = route.getCompletion(hash.competencyMatrix);
        let classPerformanceSummary =
          classPerformanceSummaryItems && classId
            ? classPerformanceSummaryItems.findBy('classId', classId)
            : null;
        if (classPerformanceSummary) {
          aClass.set('performanceSummary', classPerformanceSummary);
        }
        return Ember.Object.create({
          class: aClass,
          course: course,
          competencyMatrix: competencyMatrix,
          studentActivities: studentActivities
        });
      });
    });
  },

  setupController(controller, model) {
    controller.set('class', model.get('class'));
    controller.set('course', model.get('course'));
    controller.set('competencyMatrix', model.get('competencyMatrix'));
    controller.set('studentActivities', model.get('studentActivities'));
  },

  getStudentActivities(userId, classId, courseId) {
    let filterOption = {
      userId: userId,
      courseId: courseId,
      classId: classId,
      limit: this.get('limit')
    };
    return classId
      ? this.get(
        'chronoPerformanceService'
      ).getStudentPerformanceOfAllItemsInClass(filterOption)
      : this.get(
        'chronoPerformanceService'
      ).getStudentPerformanceOfIndepedentLearning(filterOption);
  },

  getCompletion(competencyMatrixs) {
    var score = {
        total: 100,
        completed: 0,
        inprogress: 0,
        notstarted: 0
      },
      scoremap = {
        2: 'completed',
        3: 'completed',
        4: 'completed',
        1: 'inprogress',
        0: 'notstarted'
      };
    competencyMatrixs.domains.map(cm => {
      cm.competencies.map(citm => {
        score[scoremap[citm.status]] += 1;
      });
    });
    return score;
  },

  resetController(controller) {
    var queryParams = controller.get('queryParams');
    queryParams.forEach(function(param) {
      controller.set(param, undefined);
    });

    controller.set('isShowCompetencyContentReport', false);
  }
});
