import Ember from 'ember';
import { DEFAULT_IMAGES } from 'gooru-web/config/config';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
import { isNumeric } from 'gooru-web/utils/math';
export default Ember.Component.extend(ConfigurationMixin, {
  // ---------------------------------------------------------------
  // Attributes

  /**
   * @requires service:i18n
   */
  i18n: Ember.inject.service(),

  /**
   * @type {CourseService} Service to retrieve course information
   */
  courseService: Ember.inject.service('api-sdk/course'),

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  session: Ember.inject.service('session'),

  classNames: ['gru-student-class-current-card'],

  // ------------------------------------------------------------
  // Dependencies

  // ------------------------------------------------------------
  // Properties

  classData: null,
  /**
   * @property {Course} course information
   */
  course: null,

  thumbnailUrl: Ember.computed('classData.course', function() {
    const appRootPath = this.get('appRootPath');
    const course = this.get('classData.course');
    let randomNumber = parseInt(Math.random() * 3, 0);
    const thumbnail = course
      ? course.thumbnailUrl
      : DEFAULT_IMAGES[`CLASS_DEFAULT_${randomNumber}`];
    let thumbnailImage =
      appRootPath + DEFAULT_IMAGES[`CLASS_DEFAULT_${randomNumber}`];
    if (thumbnail) {
      thumbnailImage =
        thumbnail === `/${DEFAULT_IMAGES.COURSE}`
          ? appRootPath + DEFAULT_IMAGES[`CLASS_DEFAULT_${randomNumber}`]
          : thumbnail;
    }
    return thumbnailImage;
  }),

  performanceScore: Ember.computed('classData.performanceSummary', function() {
    let overallScore = null;
    let performanceSummary = this.get('classData.performanceSummary');
    let performanceSummaryForDCA = this.get(
      'classData.performanceSummaryForDCA'
    );
    let caTotalScore = performanceSummaryForDCA
      ? performanceSummaryForDCA.totalScore
      : 0;
    let ljTotalScore = performanceSummary ? performanceSummary.totalScore : 0;
    let caCompletedCount = performanceSummaryForDCA
      ? performanceSummaryForDCA.completedCount
      : 0;
    let ljCompletedCount = performanceSummary
      ? performanceSummary.totalCompleted
      : 0;
    let totalScore = ljTotalScore + caTotalScore;
    let totalCompletedCount = ljCompletedCount + caCompletedCount;
    if (totalCompletedCount > 0) {
      let overallScores = totalScore / totalCompletedCount;
      overallScore = Math.round(overallScores);
    }
    return overallScore;
  }),

  timespent: Ember.computed('classData.performanceStat', function() {
    let performanceStat = this.get('classData.performanceStat');
    return performanceStat ? performanceStat.totalTimespent : null;
  }),

  totalLessons: Ember.computed('classData.lessonStat', function() {
    let lessonStat = this.get('classData.lessonStat');
    return lessonStat ? lessonStat.totalLessons : null;
  }),

  completedLesson: Ember.computed('classData.lessonStat', function() {
    let lessonStat = this.get('classData.lessonStat');
    return lessonStat ? lessonStat.completedLessons : null;
  }),

  /**
   * The class is premium
   * @property {String}
   */
  isPremiumClass: Ember.computed('classData', function() {
    const controller = this;
    let currentClass = controller.get('classData');
    let classSetting = currentClass.get('setting');
    return classSetting ? classSetting['course.premium'] : false;
  }),

  /**
   * @property {Boolean} isCompleted
   */
  isCompleted: Ember.computed('showCurrentLocation', function() {
    let controller = this;
    let showCurrentLocation = controller.get('showCurrentLocation');
    let currentLocation = controller.get('classData.currentLocation');
    return showCurrentLocation && currentLocation.get('status') === 'complete';
  }),

  /**
   * @property {String} current location title
   * Computed property for current Location Title
   */
  currentLocationTitle: Ember.computed('classData.currentLocation', function() {
    const currentLocation = this.get('classData.currentLocation');
    let pathType = currentLocation.get('pathType');
    let prepandText = pathType === 'route0' ? 'Pre-study: ' : '';
    return currentLocation
      ? `${prepandText}${currentLocation.get('collectionTitle')}`
      : '';
  }),

  collectionType: Ember.computed('classData.currentLocation', function() {
    let component = this;
    let currentLocation = component.get('classData.currentLocation');
    let collectionType = currentLocation.get('collectionType');
    return collectionType === 'collection' ? 'collection' : 'assessment';
  }),

  /**
   * @property {Boolean}
   * Computed property  to identify class  CM is started or not
   */
  hasCMStarted: Ember.computed('classData.performanceSummary', function() {
    const scorePercentage = this.get('classData.performanceSummary.score');
    return scorePercentage !== null && isNumeric(scorePercentage);
  }),

  /**
   * @property {Boolean}
   * Computed property  to identify class CA is started or not
   */
  hasCAStarted: Ember.computed(
    'classData.performanceSummaryForDCA',
    function() {
      const scorePercentage = this.get(
        'classData.performanceSummaryForDCA.scoreInPercentage'
      );
      return scorePercentage !== null && isNumeric(scorePercentage);
    }
  ),

  /**
   * @property {Boolean} cardBackgroundImage
   * Property help to maintain card images
   */
  cardBackgroundImage: Ember.computed('course', function() {
    const appRootPath = this.get('appRootPath');
    const coverImage = this.get('class.coverImage');
    const thumbnail = coverImage ? coverImage : this.get('course.thumbnailUrl');
    let thumbnailImage = appRootPath + DEFAULT_IMAGES.CLASS_DEFAULT;
    if (thumbnail) {
      thumbnailImage =
        thumbnail === `/${DEFAULT_IMAGES.COURSE}`
          ? appRootPath + DEFAULT_IMAGES.CLASS_DEFAULT
          : thumbnail;
    }
    return thumbnailImage;
  }),

  lessonProgress: Ember.computed('classData.competencyStats', function() {
    let competencyStats = this.get('classData.competencyStats');
    let avgScore = 0;
    if (competencyStats) {
      let masteredCompetencies = competencyStats.masteredCompetencies || 0;
      let completedCompetencies = competencyStats.completedCompetencies || 0;
      let totalCompetencies = competencyStats.totalCompetencies || 0;
      avgScore =
        totalCompetencies > 0
          ? ((masteredCompetencies + completedCompetencies) /
              totalCompetencies) *
            100
          : 0;
    }
    return avgScore;
  }),

  // ------------------------------------------------------------
  // Hooks

  didInsertElement() {
    this._super(...arguments);
  },

  // ----------------------------------------------------------------------
  // Actions

  actions: {
    onGoDashboardPage() {
      this.get('router').transitionTo(
        'student.class.dashboard',
        this.get('classData.id')
      );

      let localStorage = window.localStorage;
      const userId = this.get('session.userId');
      let lastSelectedClassId = this.get('classData.id');

      let lastAccessedClassIdList = JSON.parse(
        localStorage.getItem(`lastAccessedClassId_${userId}`)
      );

      if (!lastAccessedClassIdList || lastAccessedClassIdList === null) {
        let lastSelectedClassIdList = [];
        lastSelectedClassIdList.push(lastSelectedClassId);
        localStorage.setItem(
          `lastAccessedClassId_${userId}`,
          JSON.stringify(lastSelectedClassIdList)
        );
      } else {
        lastAccessedClassIdList.push(lastSelectedClassId);
        localStorage.setItem(
          `lastAccessedClassId_${userId}`,
          JSON.stringify(lastAccessedClassIdList)
        );
      }

      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_STUDENT_CLASS_ROOM_CARD
      );
    },

    onProficiencyPage(event) {
      event.stopPropagation();
      this.get('router').transitionTo(
        'student.class.student-learner-proficiency',
        this.get('classData.id'),
        {
          queryParams: {
            userId: this.get('session.userId'),
            classId: this.get('classData.id'),
            courseId: this.get('classData.courseId'),
            role: 'student'
          }
        }
      );
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.VIEW_YOUR_SKYLINE
      );
    },

    /**
     * Action triggered when clear alert message
     */
    onClearAlert() {
      let component = this;
      let classData = component.get('class');
      classData.set('isNotAbleToStartPlayer', false);
    },

    /**
     * Opens the study player
     *
     * @function actions:playCollection
     * @param {string} type - collection or assessment
     * @param {string} item - collection, assessment, lesson or resource
     */
    playCollection: function() {
      const component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_STUDY_HOME_START_STUDYING);
      const currentLocation = component.get('classData.currentLocation');
      let classData = component.get('classData');
      let course = component.get('classData.course');
      let setting = classData.get('setting');

      let isPremiumCourse = setting
        ? setting['course.premium'] && setting['course.premium'] === true
        : false;
      let isGradeAdded = classData.get('gradeCurrent');
      if (course) {
        if (isPremiumCourse && !currentLocation && isGradeAdded) {
          component
            .get('router')
            .transitionTo('student.class.course-map', classData.get('id'));
        } else {
          component.sendAction('onPlayCollection', currentLocation, classData);
        }
      } else {
        component
          .get('router')
          .transitionTo('student.class.class-activities', classData.get('id'));
      }

      let localStorage = window.localStorage;
      let lastSelectedClassId = component.get('classData.id');
      const userId = this.get('session.userId');

      let lastAccessedClassIdList = JSON.parse(
        localStorage.getItem(`lastAccessedClassId_${userId}`)
      );

      if (!lastAccessedClassIdList || lastAccessedClassIdList === null) {
        let lastSelectedClassIdList = [];
        lastSelectedClassIdList.push(lastSelectedClassId);
        localStorage.setItem(
          `lastAccessedClassId_${userId}`,
          JSON.stringify(lastSelectedClassIdList)
        );
      } else {
        lastAccessedClassIdList.push(lastSelectedClassId);
        localStorage.setItem(
          `lastAccessedClassId_${userId}`,
          JSON.stringify(lastAccessedClassIdList)
        );
      }
    },

    selectItem: function(item) {
      const classId = this.get('classData.id');
      const courseId = this.get('course.id');
      if (this.get('onItemSelected')) {
        this.sendAction('onItemSelected', item, classId, courseId);
        // Trigger parse event
        let parseValue, context;
        if (item === 'classData-activities') {
          parseValue = PARSE_EVENTS.CLASS_ACTIVITY;
          context = {
            classId: classId,
            courseId: courseId,
            gradeLevel: this.get('classData.grade')
          };
        }
        if (item === 'course-map') {
          parseValue = PARSE_EVENTS.LEARNING_JOURNEY;
        }
        if (item === 'profile-prof') {
          parseValue = PARSE_EVENTS.MY_PROFICIENCY;
        }

        this.get('parseEventService').postParseEvent(parseValue, context);
      }
    },

    showCompentency(classId) {
      event.stopPropagation();
      this.set('selectedClassId', classId);
      if (this.get('selectedClassId') === undefined) {
        this.set('toggleBox', true);
      } else if (classId !== this.get('selectedClassId')) {
        this.set('toggleBox', false);
      } else if (classId === this.get('selectedClassId')) {
        this.toggleProperty('toggleBox');
      }
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.COMPLETION_MASTER_COUNT
      );
    }
  },

  didRender() {
    var component = this;
    component.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
  }
});
