import Ember from 'ember';
import PrivateRouteMixin from 'gooru-web/mixins/private-route-mixin';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
import {
  ROLES,
  PLAYER_EVENT_SOURCE,
  CLASS_SKYLINE_INITIAL_DESTINATION,
  STUDENT_GUEST_TOP_CLASSES
} from 'gooru-web/config/config';
import {
  currentLocationToMapContext,
  createStudyPlayerQueryParams,
  hasSuggestions
} from 'gooru-web/utils/navigation-util';
import AccessibilitySettingsMixin from 'gooru-web/mixins/accessibility-settings-mixin';
import UIHelperMixin from 'gooru-web/mixins/ui-helper-mixin';
import { isEmptyValue } from 'gooru-web/utils/utils';

/**
 * Student home route
 *
 * @module
 * @augments Ember.Route
 */
export default Ember.Route.extend(
  PrivateRouteMixin,
  ConfigurationMixin,
  AccessibilitySettingsMixin,
  UIHelperMixin,
  {
    // -------------------------------------------------------------------------
    // Dependencies
    analyticsService: Ember.inject.service('api-sdk/analytics'),

    performanceService: Ember.inject.service('api-sdk/performance'),

    lookupService: Ember.inject.service('api-sdk/lookup'),

    /**
     * @requires service:session
     */
    session: Ember.inject.service('session'),

    /**
     * @type {CourseService} Service to retrieve course information
     */
    courseService: Ember.inject.service('api-sdk/course'),

    /**
     * @type {FeaturedCourseService} Service to retrieve Featured Courses Service information
     */
    featuredCourseService: Ember.inject.service('api-sdk/featured-courses'),

    /**
     * @type {TimeService} Service to retrieve timespent Service information
     */
    dashboardService: Ember.inject.service('api-sdk/dashboard'),

    /**
     * @property {NavigateMapService}
     */
    navigateMapService: Ember.inject.service('api-sdk/navigate-map'),

    /**
     * @dependency {i18nService} Service to retrieve translations information
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
     * @property {Service} Profile service
     */
    profileService: Ember.inject.service('api-sdk/profile'),

    programId: null,

    // -------------------------------------------------------------------------
    // Actions

    actions: {
      /**
       * Open the player with the specific currentLocation
       *
       * @function actions:playItem
       * @param {string} currentLocation - All the params for the currentLocation
       */
      studyPlayer: function(currentLocation, classData) {
        const route = this;
        let classId = currentLocation
          ? currentLocation.get('classId')
          : classData.get('id');
        let courseId = currentLocation
          ? currentLocation.get('courseId')
          : classData.get('courseId');
        if (route.findClassIsPermium(classData)) {
          route.doCheckClassDestination(
            classData,
            classId,
            courseId,
            currentLocation
          );
        } else {
          route.playContent(classData, classId, courseId, currentLocation);
        }
      },

      /**
       * Triggered when a student card menu item is selected
       * @param {string} item
       * @param {string} classId
       */
      selectMenuItem: function(item, classId, courseId) {
        const route = this;
        let queryParams = {
          queryParams: {
            tab: 'report'
          }
        };
        if (item === 'cm-report') {
          route.transitionTo('student.class.course-map', classId, queryParams);
        } else if (item === 'ca-report') {
          route.transitionTo(
            'student.class.class-activities',
            classId,
            queryParams
          );
        } else if (item === 'profile-prof') {
          let userId = this.get('session.userId');
          route.transitionTo(
            'student.class.student-learner-proficiency',
            classId,
            {
              queryParams: {
                userId: userId,
                classId: classId,
                courseId: courseId,
                role: 'student'
              }
            }
          );
        } else if (item === 'course-map') {
          route.transitionTo('student.class.course-map', classId);
        } else if (item === 'class-activities') {
          route.transitionTo('student.class.class-activities', classId);
        } else {
          route.transitionTo('student-home');
        }
      }
    },

    // -------------------------------------------------------------------------
    // Methods
    model: function() {
      let route = this;
      route.setTitle('Student Home', null);
      const configuration = this.get('configurationService.configuration');
      let localStorage = this.getLocalStorage();
      const userId = this.get('session.userId');
      const localStorageLogins = `${userId}_logins`;
      let loginCount = localStorage.getItem(localStorageLogins);
      loginCount = loginCount ? 0 + loginCount : 0;

      let firstCoursePromise = Ember.RSVP.resolve(Ember.Object.create({}));
      let secondCoursePromise = Ember.RSVP.resolve(Ember.Object.create({}));
      let thirdCoursePromise = Ember.RSVP.resolve(Ember.Object.create({}));
      let fourthCoursePromise = Ember.RSVP.resolve(Ember.Object.create({}));
      var featuredCourses = Ember.A([]);

      this.get('profileService')
        .getProfilePreference()
        .then(data => {
          route.setAccessibilitySettingsAPI(data);
        });

      const firstCourseId = configuration.get(
        'exploreFeaturedCourses.firstCourseId'
      );
      const secondCourseId = configuration.get(
        'exploreFeaturedCourses.secondCourseId'
      );
      const thirdCourseId = configuration.get(
        'exploreFeaturedCourses.thirdCourseId'
      );
      const fourthCourseId = configuration.get(
        'exploreFeaturedCourses.fourthCourseId'
      );

      if (firstCourseId && loginCount <= 5) {
        firstCoursePromise = route
          .get('courseService')
          .fetchById(firstCourseId);
      }
      if (secondCourseId && loginCount <= 5) {
        secondCoursePromise = route
          .get('courseService')
          .fetchById(secondCourseId);
      }
      if (thirdCourseId && loginCount <= 5) {
        thirdCoursePromise = route
          .get('courseService')
          .fetchById(thirdCourseId);
      }
      if (fourthCourseId && loginCount <= 5) {
        fourthCoursePromise = route
          .get('courseService')
          .fetchById(fourthCourseId);
      }

      const navigatorQueryParams = {
        filterOutJoinedCourses: false
      };
      let fetchIndependentCourses = route
        .get('featuredCourseService')
        .getIndependentCourseList(navigatorQueryParams);

      let navigatorPrograms = route
        .get('lookupService')
        .readNavigatorPrograms();

      const navigatorSubProgram = route
        .get('lookupService')
        .readNavigatorSubPrograms();

      const myId = route.get('session.userId');
      let myClasses =
        route.controllerFor('application').get('myClasses') || // after login the variable is refreshed at the controller
        route.modelFor('application').myClasses; // when refreshing the page the variable is accessible at the route

      return Ember.RSVP.hash({
        firstCourse: firstCoursePromise,
        secondCourse: secondCoursePromise,
        thirdCourse: thirdCoursePromise,
        fourthCourse: fourthCoursePromise,
        myClasses: myClasses,
        fetchIndependentCourses: fetchIndependentCourses,
        navigatorPrograms: navigatorPrograms,
        navigatorSubProgram: navigatorSubProgram
      }).then(function(hash) {
        const firstFeaturedCourse = hash.firstCourse;
        const secondFeaturedCourse = hash.secondCourse;
        const thirdFeaturedCourse = hash.thirdCourse;
        const fourthFeaturedCourse = hash.fourthCourse;
        featuredCourses.push(firstFeaturedCourse);
        featuredCourses.push(secondFeaturedCourse);
        featuredCourses.push(thirdFeaturedCourse);
        featuredCourses.push(fourthFeaturedCourse);
        let navigatorPrograms = hash.navigatorPrograms.navigatorPrograms;
        let activeClasses = hash.myClasses.getStudentActiveClasses(myId);
        let navigatorSubProgram = hash.navigatorSubProgram;

        /**
         * Note: Condition help to show Grade 8 Math class have to shown on top.
         */
        if (route.get('session.isGuest')) {
          let topClasses = activeClasses.filter(
            item => STUDENT_GUEST_TOP_CLASSES.indexOf(item.id) !== -1
          );
          let nonTopClasses = activeClasses.filter(
            item => STUDENT_GUEST_TOP_CLASSES.indexOf(item.id) === -1
          );
          activeClasses = [...topClasses, ...nonTopClasses];
        }

        const fetchIndependentCourses = hash.fetchIndependentCourses;
        let archivedClasses = hash.myClasses.classes.filterBy('isArchived');

        let classID = Ember.A([]);
        fetchIndependentCourses.map(data => {
          if (data.hasJoined) {
            classID.push(data.id);
          }
        });

        if (activeClasses.length) {
          classID = classID.concat(activeClasses.mapBy('id'));
          let timeSpentValues = Ember.A([]);
          let timeEta;
          return route
            .get('dashboardService')
            .fetchDashboardPerformance({
              classIds: classID,
              userId: userId
            })
            .then(timeSpent => {
              if (timeSpent.length) {
                timeSpentValues = timeSpent;
                fetchIndependentCourses.forEach(data => {
                  let timespentdata = timeSpentValues.filterBy(
                    'classId',
                    data.id
                  );
                  data.set('timeSpentValues', timespentdata[0]);
                  timeEta = timeSpentValues.destinationETA / 60;
                });
              }
              route.fetchClassStats(activeClasses, timeSpentValues);
              let CourseCompletion = Ember.A([]);

              return {
                activeClasses,
                featuredCourses,
                loginCount,
                fetchIndependentCourses,
                archivedClasses,
                timeSpentValues,
                CourseCompletion,
                timeEta,
                navigatorPrograms,
                navigatorSubProgram
              };
            });
        } else {
          return {
            activeClasses,
            featuredCourses,
            loginCount,
            fetchIndependentCourses,
            navigatorPrograms,
            navigatorSubProgram
          };
        }
      });
    },

    afterModel(resolvedModel) {
      this.loadClassCardsData(
        resolvedModel.activeClasses,
        resolvedModel.fetchIndependentCourses
      );
    },

    loadClassCardsData(activeClasses, independentCourses) {
      let route = this;
      let classCourseIdsFwCode = route.getListOfClassCourseIdsFwCode(
        activeClasses
      );
      let courseIDs = route.getListOfCourseIds(activeClasses);
      let myId = route.get('session.userId');
      let nonPremiumClassCourseIds = route.getListOfClassCourseIds(
        activeClasses
      );
      let nonPremiumClassIds = activeClasses.map(classData => {
        return classData.get('id');
      });
      let premiumClassIds = activeClasses
        .filter(classData => {
          let preference = classData.get('preference');
          return (
            preference !== null && preference.subject && !classData.isArchived
          );
        })
        .map(classData => {
          const preference = classData.get('preference');
          return {
            classId: classData.get('id'),
            subjectCode: preference.subject
          };
        });

      let independentCourseIds = independentCourses.map(independentCourse => {
        let classDatas = activeClasses.filter(classData => {
          return (
            classData.courseId === independentCourse.get('id') &&
            classData.isPublic
          );
        });

        if (classDatas && classDatas.length) {
          independentCourse.set('classId', classDatas[0].id);
          return {
            classId: classDatas[0].id,
            subjectCode: independentCourse.get('subject')
          };
        } else {
          return null;
        }
      });

      let dataValue = independentCourseIds.filter(data => {
        return data !== null;
      });

      let totalIds =
        dataValue && dataValue.length
          ? [...premiumClassIds, ...dataValue]
          : premiumClassIds;

      const classIds = totalIds.filter(data => {
        return !isEmptyValue(data.subjectCode);
      });

      let courseCardsPromise = route
        .get('courseService')
        .fetchCoursesCardData(courseIDs);
      let perfPromise = route
        .get('performanceService')
        .findClassPerformanceSummaryByStudentAndClassIds(
          myId,
          nonPremiumClassCourseIds
        );
      let locationPromise = route
        .get('analyticsService')
        .getUserCurrentLocationByClassIds(classCourseIdsFwCode, myId);
      let competencyCompletionStats =
        premiumClassIds.length > 0
          ? route
            .get('competencyService')
            .getCompetencyCompletionStats(classIds, myId)
          : Ember.RSVP.resolve([]);
      let caClassPerfSummaryPromise =
        nonPremiumClassIds.length > 0
          ? route
            .get('performanceService')
            .getCAPerformanceData(nonPremiumClassIds, myId)
          : Ember.RSVP.resolve([]);
      Ember.RSVP.hash({
        classPerformanceSummaryItems: perfPromise,
        classesLocation: locationPromise,
        courseCards: courseCardsPromise,
        caClassPerfSummary: caClassPerfSummaryPromise,
        competencyStats: competencyCompletionStats
      }).then(function(hash) {
        const classPerformanceSummaryItems = hash.classPerformanceSummaryItems;
        const classesLocation = hash.classesLocation;
        const courseCards = hash.courseCards;
        activeClasses.forEach(function(activeClass) {
          const classId = activeClass.get('id');
          const courseId = activeClass.get('courseId');

          activeClass.set(
            'currentLocation',
            classesLocation.findBy('classId', classId)
          );
          activeClass.set(
            'performanceSummary',
            classPerformanceSummaryItems.findBy('classId', classId)
          );
          activeClass.set(
            'performanceSummaryForDCA',
            hash.caClassPerfSummary.findBy('classId', classId)
          );
          activeClass.set(
            'competencyStats',
            hash.competencyStats.findBy('classId', classId)
          );

          if (courseId) {
            let course = courseCards.findBy('id', activeClass.get('courseId'));
            activeClass.set('course', course);
          }
        });
        independentCourses.forEach(function(independentCourse) {
          let classId = independentCourse.get('classId');
          let competencyStats = hash.competencyStats.findBy('classId', classId);
          let total =
            competencyStats && competencyStats.totalCompetencies !== 0
              ? Math.round(
                ((competencyStats.completedCompetencies +
                    competencyStats.masteredCompetencies) /
                    competencyStats.totalCompetencies) *
                    100
              )
              : 0;
          let competency = competencyStats
            ? competencyStats.completedCompetencies +
              competencyStats.masteredCompetencies
            : 0;
          independentCourse.set('competencyStats', competencyStats);
          independentCourse.set('totalCompetencyStats', competency);
          independentCourse.set('totalPercentage', total);
        });
      });
    },

    /**
     * @function getListOfClassCourseIds
     * Method to fetch class and course ids from the list of classes
     */
    getListOfClassCourseIds(activeClasses) {
      let listOfActiveClassCourseIds = Ember.A([]);
      activeClasses.map(activeClass => {
        if (activeClass.courseId) {
          let classCourseId = {
            classId: activeClass.id,
            courseId: activeClass.courseId
          };
          listOfActiveClassCourseIds.push(classCourseId);
        }
      });
      return listOfActiveClassCourseIds;
    },

    /**
     * @function getListOfClassCourseIdsFwCode
     * Method to fetch class, course ids and fwCode from the list of classes
     */
    getListOfClassCourseIdsFwCode(activeClasses) {
      let listOfActiveClassCourseIdsFwCode = Ember.A([]);
      activeClasses.map(activeClass => {
        if (activeClass.courseId) {
          let classCourseId = {
            classId: activeClass.id,
            courseId: activeClass.courseId
          };
          if (
            activeClass.milestoneViewApplicable &&
            activeClass.milestoneViewApplicable === true &&
            activeClass.preference &&
            activeClass.preference.framework
          ) {
            classCourseId.fwCode = activeClass.preference.framework;
          }
          listOfActiveClassCourseIdsFwCode.push(classCourseId);
        }
      });
      return listOfActiveClassCourseIdsFwCode;
    },
    /**
     * @function getListOfCourseIds
     * Method to fetch course ids from the list of classess
     */
    getListOfCourseIds(activeClasses) {
      let listOfActiveCourseIds = Ember.A([]);
      activeClasses.map(activeClass => {
        if (activeClass.courseId) {
          listOfActiveCourseIds.push(activeClass.courseId);
        }
      });
      return listOfActiveCourseIds;
    },

    setupController: function(controller, model) {
      let classGradeList = Ember.A([]);
      let tempGradeList = Ember.A([]);
      let studyCourseGradeList = Ember.A([]);

      let gradeCourseList = Ember.A([]);
      let totGradeCourseList = Ember.A([]);

      let coursesList = model.fetchIndependentCourses;

      controller.set('navigatorPrograms', model.navigatorPrograms);
      controller.set('navigatorSubProgram', model.navigatorSubProgram);
      if (controller.get('isEnableNavigatorPrograms')) {
        controller.fetchProgramCourses();
      }
      this.get('parseEventService')
        .getParseConfig()
        .then(data => {
          if (data.length) {
            let gradeList = data[0].value;

            coursesList.forEach(grade => {
              var courseItem = grade.settings.framework;
              gradeCourseList.pushObject(courseItem);
            });

            let uniqueGradeCourse = [...new Set(gradeCourseList)];

            uniqueGradeCourse.forEach(data => {
              let grade = gradeList[data];
              if (grade !== undefined) {
                totGradeCourseList.pushObject(grade);
              }
            });

            var totalGradeCourseList = [].concat.apply([], totGradeCourseList);

            const sessionId = this.get('session.userId');
            this.get('profileService')
              .readUserProfile(sessionId)
              .then(function(userProfile) {
                let dateOfBirth = userProfile.dateOfBirth;

                var tempDateOfBirth = moment(dateOfBirth).format('YYYY-MM-DD');

                var birthDate = new Date(tempDateOfBirth);

                var difference = Date.now() - birthDate.getTime();
                var ageDate = new Date(difference);
                var calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970);

                let gradeUnderName = totalGradeCourseList
                  .filter(grade => {
                    return grade.ageBefore <= calculatedAge;
                  })
                  .sortBy('ageBefore')
                  .reverse();

                let gradeUpperName = totalGradeCourseList
                  .filter(grade => {
                    return grade.ageBefore > calculatedAge;
                  })
                  .sortBy('ageBefore');

                classGradeList = [...gradeUnderName, ...gradeUpperName];
                if (classGradeList && classGradeList.length > 0) {
                  classGradeList.forEach(data => {
                    coursesList.forEach(course => {
                      if (
                        data.gradeId === course.settings.gradeCurrent &&
                        course.hasJoined === true
                      ) {
                        return tempGradeList.pushObject(course);
                      }
                    });
                  });
                } else {
                  coursesList.forEach(course => {
                    if (course.hasJoined === true) {
                      return tempGradeList.pushObject(course);
                    }
                  });
                }
                controller.set('independedCourses', tempGradeList);
              });
          } else {
            coursesList.forEach(course => {
              if (course.hasJoined === true) {
                return tempGradeList.pushObject(course);
              }
            });

            controller.set('independedCourses', tempGradeList);
          }
        });

      model.fetchIndependentCourses.forEach(data => {
        if (data.hasJoined === false) {
          studyCourseGradeList.pushObject(data);
        }
      });

      controller.set('independedCoursesMath', studyCourseGradeList);
      controller.set('courses', coursesList);
      controller.set('steps', model.tourSteps);
      controller.set('featuredCourses', model.featuredCourses);
      controller.set('activeClasses', model.activeClasses);
      controller.set('loginCount', model.loginCount);
      controller.set('archivedClasses', model.archivedClasses);
      controller.set('timeSpent', model.timeSpentValues);
      controller.set('totalCompletion', model.CourseCompletion);
      controller.set('coursePercentage', model.CoursePercentage);
      controller.set('timeDuration', model.timeEta);
      controller.changeLanguage();
      controller.setIsShowIndependentStudy(false);
    },

    resetController(controller) {
      controller.set('isOpenPlayer', false);
    },

    /**
     * Before leaving the route
     */
    deactivate: function() {
      this.controller.set('isLoading', false);
    },

    /** returns options promise chain resolving response
     * @param
     */
    nextPromiseHandler(resp) {
      let queryParams = {
        role: ROLES.STUDENT,
        source: PLAYER_EVENT_SOURCE.COURSE_MAP,
        courseId: hasSuggestions(resp) ? resp.context.courseId : resp.courseId // Only in case of suggestions we dont have courseId in suggestion
      };
      let isContentMapped = true;
      queryParams = createStudyPlayerQueryParams(
        hasSuggestions(resp) ? resp.suggestions[0] : resp.context || resp,
        queryParams
      );
      isContentMapped = !!(queryParams.collectionId || queryParams.id);
      if (isContentMapped) {
        return Ember.RSVP.resolve(queryParams);
      } else {
        return Ember.RSVP.reject(null);
      }
    },

    playContent(classData, classId, courseId, currentLocation) {
      const route = this;
      const controller = route.get('controller');
      let activeClasses = controller.get('activeClasses');
      let navigateMapService = route.get('navigateMapService');
      let options = {
          role: ROLES.STUDENT,
          source: PLAYER_EVENT_SOURCE.COURSE_MAP,
          courseId,
          classId
        },
        nextPromise = null;
      //start studying
      if (currentLocation == null || currentLocation === '') {
        nextPromise = navigateMapService.continueCourse(
          options.courseId,
          options.classId
        );
      } else if (currentLocation.get('status') === 'complete') {
        //completed
        nextPromise = navigateMapService.contentServedResource(
          currentLocationToMapContext(currentLocation)
        );
      } else {
        //in-progress
        // Next not required, get the params from current location
        nextPromise = route.nextPromiseHandler(
          currentLocationToMapContext(currentLocation)
        );
        // Remove next item from localstorage when playing different item from stored next
        if (!route.isResumeSameActivity(currentLocation)) {
          navigateMapService
            .getLocalStorage()
            .removeItem(navigateMapService.generateKey());
        }
      }
      nextPromise
        .then(route.nextPromiseHandler)
        .then(queryParams => {
          queryParams.isIframeMode = true;
          route.controller.set(
            'playerUrl',
            route.get('router').generate('study-player', courseId, {
              queryParams
            })
          );
          let playerContent = Ember.Object.create({
            title: currentLocation
              ? currentLocation.get('collectionTitle')
              : null,
            format: currentLocation
              ? currentLocation.get('collectionType')
              : null,
            classId
          });
          route.controller.set('playerContent', playerContent);
          route.controller.set('isOpenPlayer', true);
        })
        .catch(() => {
          let selectedClass = activeClasses.findBy('id', classData.get('id'));
          selectedClass.set('isNotAbleToStartPlayer', true);
          // Below logic is used to clear the left over state of study player,
          // in order to avoid the conflict.
          navigateMapService
            .getLocalStorage()
            .removeItem(navigateMapService.generateKey());
        });
    },

    doCheckClassDestination(classData, classId, courseId, currentLocation) {
      const route = this;
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
            destination === CLASS_SKYLINE_INITIAL_DESTINATION.showDirections ||
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
          } else {
            route.playContent(classData, classId, courseId, currentLocation);
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
     * @function isResumeSameActivity
     * @param {Object} currentLocation
     * Method to check whether playing same activity which is stored next
     */
    isResumeSameActivity(currentLocation) {
      const navigateMapService = this.get('navigateMapService');
      const storedNext = JSON.parse(
        navigateMapService
          .getLocalStorage()
          .getItem(navigateMapService.generateKey())
      );
      return (
        storedNext &&
        storedNext.context.course_id === currentLocation.courseId &&
        storedNext.context.collection_id === currentLocation.collectionId
      );
    },

    fetchClassStats(activeClasses, performanceStats) {
      if (performanceStats.length) {
        activeClasses.forEach(classData => {
          let performanceStat = performanceStats.findBy(
            'classId',
            classData.id
          );
          classData.setProperties({ performanceStat });
        });
      }
    }
  }
);
