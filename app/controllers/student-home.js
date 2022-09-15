import Ember from 'ember';
import ModalMixin from 'gooru-web/mixins/modal';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';
import Language from 'gooru-web/mixins/language';
import { TOUR_PAGES_ENUM } from 'gooru-web/config/config';
import UIHelperMixin from 'gooru-web/mixins/ui-helper-mixin';
import { isEmptyValue } from 'gooru-web/utils/utils';
import tenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';

export default Ember.Controller.extend(
  ModalMixin,
  ConfigurationMixin,
  Language,
  UIHelperMixin,
  tenantSettingsMixin,
  {
    // -------------------------------------------------------------------------
    // Dependencies

    applicationController: Ember.inject.controller('application'),

    /**
     * @property {Service} Session service
     */
    session: Ember.inject.service('session'),

    featuredCourseService: Ember.inject.service('api-sdk/featured-courses'),

    /**
     * @type {ProfileService} Service to retrieve profile information
     */
    classService: Ember.inject.service('api-sdk/class'),

    /**
     * @property {Service} Notifications service
     */
    notifications: Ember.inject.service(),

    /**
     * @property {Service} parseEvent service
     */
    parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

    tourService: Ember.inject.service('tours'),

    /**
     * @property {Service} tenant service
     */
    tenantService: Ember.inject.service('api-sdk/tenant'),
    // -------------------------------------------------------------------------
    // Actions

    actions: {
      /**
       * Join class event
       * @param {string} code
       */
      joinClass: function(code) {
        const controller = this;
        controller.set('allowedCode', true);
        controller.set('validCode', true);
        controller.set('notMember', true);

        controller
          .get('classService')
          .joinClass(code)
          .then(
            function(classId) {
              if (!classId) {
                //no class is provided when is already joined to that class
                controller.set('isLoading', false);
                controller.set('notMember', null);
              } else {
                controller.send('updateUserClasses'); // Triggers the refresh of user classes in top header
                controller.transitionToRoute(
                  'student.class.course-map',
                  classId
                );
              }
            },
            function(error) {
              controller.set('isLoading', false);
              if (error.code === 'restricted') {
                controller.set('allowedCode', null);
              } else if (error.code === 'not-found') {
                controller.set('validCode', null);
              } else {
                let message = controller
                  .get('i18n')
                  .t('common.errors.can-not-join-class').string;
                controller.get('notifications').error(message);
              }
            }
          );
      },

      closePullUp() {
        const component = this;
        component.set('isOpenPlayer', false);
      },

      showAll() {
        this.toggleProperty('isShowAllClassRooms');
        Ember.$('.student-landing').scrollTop();
        let parseEvent;
        if (this.get('isShowAllClassRooms')) {
          parseEvent = PARSE_EVENTS.SHOW_MORE_CLASSROOM;
        } else {
          parseEvent = PARSE_EVENTS.SHOW_LESS_CLASSROOM;
        }
        this.get('parseEventService').postParseEvent(parseEvent);
      },

      onShowAll(contentItem) {
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.CLICK_STUDY_HOME_SEE_ALL_COURSE
        );
        this.set('isShowAllCourses', true);
        this.set('contentItem', contentItem);
      },

      goBack() {
        this.toggleProperty('isShowJumpStartCourse');
      },

      onClosePopup() {
        this.set('isShowRecentlyLaunchedPopup', false);
      },

      onChangeTab(value) {
        const component = this;
        if (component.get('isEnableNavigatorPrograms')) {
          component.checkProgramLandingPage();
        }
        component.set('activeTab', value);
        switch (value) {
        case 'independent':
          component.tourShowAfterRender(true);
          component
            .get('parseEventService')
            .postParseEvent(PARSE_EVENTS.CLICK_JUMP_START);
          break;
        case 'navigator':
          component.tourShowAfterRender(true);
          component
            .get('parseEventService')
            .postParseEvent(PARSE_EVENTS.CLICK_STUDENT_HOME_MY_NAVIGATOR);
          break;
        default:
          component.tourShowAfterRender(false);
          component
            .get('parseEventService')
            .postParseEvent(PARSE_EVENTS.CLICK_STUDENT_HOME_CLASSROOMS);
          break;
        }
      },

      showAllFeatured(subject) {
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.CLICK_STUDY_HOME_SEE_ALL_COURSE
        );
        this.set('isShowAllCourses', true);
        this.set('contentItem', subject.title);
        this.set('activeBucket', subject);
      },

      feedback: function(value) {
        const component = this;
        if (value) {
          let page = component.get('isShowIndependentStudy')
            ? TOUR_PAGES_ENUM.studentHomeIndependentClass
            : TOUR_PAGES_ENUM.studentHomeClasses;
          component.saveTourWalkThrough(page, value);
        }
      },

      onSelectProgram(program) {
        this.toggleProperty('isShowJumpStartCourse');
        this.set('selectedProgram', program);
        this.set('notStartedProgramCourse', program.courseList);
        this.set('independedCoursesMath', []);
      }
    },

    // -------------------------------------------------------------------------
    // Events
    init: function() {
      const component = this;
      this.set('isLoaded', false);
      let localStorage = this.get('applicationController').getLocalStorage();
      const userId = this.get('session.userId');
      const localStorageLogins = `${userId}_logins`;
      let loginCount = localStorage.getItem(localStorageLogins);
      if (loginCount) {
        this.set('loginCount', +loginCount);
      }

      this.get('parseEventService').getParseConfig();
      component.set(
        'studentHomeSettingSteps',
        component.get('tourService').getStudentHomePageTourSteps()
      );
      if (component.get('profile.enableForcePasswordChange')) {
        component.transitionToRoute('force-change-password');
      }
    },

    onToggleTabTourChange(isShowIndependentStudy) {
      const component = this;
      let isIndependentTabHide = false;
      let courses = this.get('courses');
      if (courses.length === 0) {
        isIndependentTabHide = true;
      }
      if (isShowIndependentStudy) {
        if (component.get('isShowJumpStartInfo')) {
          if (component.get('startedProgramCourse').length) {
            component.set(
              'studentHomeSettingSteps',
              component
                .get('tourService')
                .getStudentHomePageMyNavigatorCurrentlyStudyingSteps()
            );
            component.goForTour(
              TOUR_PAGES_ENUM.studentHomeIndependentClass,
              '.tour-student-home'
            );
          } else {
            component.set(
              'studentHomeSettingSteps',
              component.get('tourService').getStudentHomePageMyNavigatorSteps()
            );
            component.goForTour(
              TOUR_PAGES_ENUM.studentHomeIndependentClass,
              '.tour-student-home'
            );
          }
        } else {
          component.set(
            'studentHomeSettingSteps',
            component
              .get('tourService')
              .getStudentHomePageIndependentTourSteps()
          );
          component.goForTour(
            TOUR_PAGES_ENUM.studentHomeIndependentClass,
            '.tour-student-home'
          );
        }
      } else if (!isShowIndependentStudy) {
        if (isIndependentTabHide) {
          component.set(
            'studentHomeSettingSteps',
            component
              .get('tourService')
              .getStudentHomePageTourNoIndependentTabSteps()
          );
        } else {
          component.set(
            'studentHomeSettingSteps',
            component.get('tourService').getStudentHomePageTourSteps()
          );
        }
        component.goForTour(
          TOUR_PAGES_ENUM.studentHomeClasses,
          '.tour-student-home'
        );
      }
    },

    tourShowAfterRender(value) {
      const component = this;
      Ember.run.scheduleOnce('afterRender', function() {
        setTimeout(() => {
          component.onToggleTabTourChange(value);
        }, 1000);
      });
    },

    setIsShowIndependentStudy(value) {
      const component = this;
      setTimeout(() => {
        component.set('isShowIndependentStudy', value);
        let activeClass =
          this.get('activeClasses').filterBy('isArchived', false) &&
          this.get('activeClasses').filterBy('isPublic', false);
        component.set('isLoaded', true);
        if (
          activeClass &&
          activeClass.length === 0 &&
          component.get('courses').length > 0
        ) {
          if (component.get('isShowJumpStartInfo')) {
            component.set('activeTab', 'navigator');
          } else {
            component.set('activeTab', 'independent');
          }
          component.set('isShowIndependentStudy', true);
          component.tourShowAfterRender(true);
        } else {
          component.tourShowAfterRender(value);
        }
      }, 2000);
    },

    changeLanguage() {
      const controller = this;
      controller.changeLanguageHomePage();
    },

    // -------------------------------------------------------------------------
    // Properties

    /**
     * @property {Profile}
     */
    profile: Ember.computed.alias('applicationController.profile'),

    /**
     * @property {Number} Total of joined classes
     */
    totalJoinedClasses: Ember.computed.alias('activeClasses.length'),

    /**
     * @property {Boolean} Indicate if the student has classes
     */
    hasClasses: Ember.computed('totalJoinedClasses', function() {
      return this.get('totalJoinedClasses') > 0;
    }),

    isShowIndependentStudy: false,

    isShowJumpStartCourse: false,

    activeTab: 'classroom',

    isLoaded: false,

    isShowRecentlyLaunchedPopup: true,

    activeClassList: Ember.computed('activeClasses', function() {
      const component = this;
      if (this.get('activeClasses')) {
        let localStorage = window.localStorage;
        let userId = this.get('session.userId');
        let lastAccessedClassIdList = JSON.parse(
          localStorage.getItem(`lastAccessedClassId_${userId}`)
        );

        let activeClass =
          this.get('activeClasses').filterBy('isArchived', false) &&
          this.get('activeClasses').filterBy('isPublic', false);
        component.tourShowAfterRender(component.get('isShowIndependentStudy'));

        if (lastAccessedClassIdList) {
          lastAccessedClassIdList.forEach(function(classId) {
            if (classId) {
              let lastAccessClass = activeClass.filterBy('id', classId);
              activeClass.splice(
                activeClass.findIndex(
                  lastAccessedClass => lastAccessedClass.id === classId
                ),
                1
              );
              activeClass.unshift(...lastAccessClass);
            }
          });
        }

        return activeClass;
      }
    }),

    archivedClassList: Ember.computed('archivedClasses', function() {
      return this.get('archivedClasses');
    }),

    independedCoursesList: Ember.computed('independedCourses', function() {
      if (
        this.get('independedCourses') !== undefined &&
        this.get('independedCourses') !== null
      ) {
        return this.get('independedCourses');
      }
    }),

    isShowJumpStartInfo: Ember.computed(function() {
      let tenantSettings = JSON.parse(
        this.get('tenantService').getStoredTenantSetting()
      );
      const isShowJumpStartInfo =
        tenantSettings &&
        tenantSettings.ui_element_visibility_settings &&
        tenantSettings.ui_element_visibility_settings.enable_navigator_programs
          ? tenantSettings.ui_element_visibility_settings
            .enable_navigator_programs
          : false;
      return isShowJumpStartInfo;
    }),

    isShowJoinClassCard: Ember.computed(function() {
      const controller = this;
      let showJoinClass = true;
      controller
        .get('tenantService')
        .getActiveTenantSetting()
        .then(tenantSettings => {
          if (
            tenantSettings &&
            tenantSettings.ui_element_visibility_settings &&
            !isEmptyValue(
              tenantSettings.ui_element_visibility_settings.show_join_class_card
            )
          ) {
            showJoinClass =
              tenantSettings.ui_element_visibility_settings
                .show_join_class_card;
          }
          controller.set('isShowJoinClassCard', showJoinClass);
        });
    }),

    coursesList: Ember.computed('courses', function() {
      return this.get('courses');
    }),

    coursePercentageList: Ember.computed('coursePercentage', function() {
      return this.get('coursePercentage');
    }),

    totalDurationList: Ember.computed('timeDuration', function() {
      return this.get('timeDuration');
    }),

    /**
     * @property {Array[]} - featuredCourses
     */
    featuredCourses: null,

    navigatorProgramList: Ember.computed('navigatorPrograms', function() {
      return this.get('navigatorPrograms');
    }),

    /**
     * @property {Number} - Amount of logins by the user
     */
    loginCount: null,

    /**
     * Indicates if the code is valid, false when the class is not found
     * @property {boolean}
     */
    validCode: true,

    /**
     * Indicates if the code is allowed, false if the user can't join that class
     * @property {boolean}
     */
    allowedCode: true,

    /**
     * Indicates if user is not a member of this class
     * @property {boolean}
     */
    notMember: true,

    /**
     * Indicate if it's waiting for join class callback
     */
    isLoading: false,

    isShowAllCourses: false,

    isShowAllClassRooms: Ember.computed('independedCoursesMath', function() {
      let courses = this.get('independedCoursesMath');
      return !(courses && courses.length);
    }),

    contentItem: 'activeClassList',

    activeBucket: null,

    selectedProgram: null,

    navigatorSubProgram: Ember.A([]),

    notStartedProgramCourse: Ember.A([]),

    startedProgramCourse: Ember.A(),

    subjectBucket: Ember.computed('independedCoursesMath', function() {
      let courses = this.get('independedCoursesMath');
      let bucketItems = Ember.A([]);
      let subjectCodeList = [...new Set(courses.mapBy('subject'))];
      let subjectList = courses.mapBy('additionalInfo.subject');
      subjectList = subjectList.filter(item => item);
      if (subjectCodeList !== undefined && subjectCodeList !== null) {
        subjectCodeList.forEach(item => {
          if (item) {
            let subjectCode = item;
            let splitCode = item.split('.');
            if (splitCode.length > 2) {
              subjectCode = splitCode.slice(1, 3).join('.');
            }
            let activeSubject = subjectList.findBy('id', subjectCode);
            let filteredSubject = courses.filterBy('subject', item);
            if (activeSubject && filteredSubject.length) {
              activeSubject.courseList = filteredSubject;
              bucketItems.pushObject(Ember.Object.create(activeSubject));
            }
          } else {
            let filteredSubject = courses.filterBy('subject', '');
            let activeSubject = Ember.Object.create();
            activeSubject.title = 'Others';
            activeSubject.courseList = filteredSubject;
            bucketItems.pushObject(activeSubject);
          }
        });
        return bucketItems;
      }
    }),

    /**
     * help to handled featured course
     * @property {boolean}
     */
    isShowFeaturedCourses: Ember.computed.alias(
      'configuration.GRU_FEATURE_FLAG.isShowFeaturedCourses'
    ),

    checkProgramLandingPage() {
      this.set('isShowJumpStartCourse', false);
      if (
        this.get('navigatorPrograms') &&
        this.get('navigatorPrograms').length === 1 &&
        !this.get('startedProgramCourse').length
      ) {
        this.set('isShowJumpStartCourse', true);
        this.set('selectedProgram', this.get('navigatorPrograms')[0]);
      }
    },

    fetchProgramCourses() {
      const navigatorSubProgram = this.get('navigatorSubProgram');
      const navigatorProgramList = this.get('navigatorPrograms');
      const navigatorQueryParams = {
        filterOutJoinedCourses: false,
        navigatorProgram: true
      };
      this.get('featuredCourseService')
        .getIndependentCourseList(navigatorQueryParams)
        .then(programCourses => {
          programCourses.forEach(item => {
            const program = this.get('activeClasses').findBy(
              'courseId',
              item.id
            );
            item.performance =
              program && program.performanceSummary
                ? program.performanceSummary
                : null;
          });

          const startedCourse = Ember.A();
          const notStartedCourses = Ember.A();
          navigatorSubProgram.forEach(subProgram => {
            const programCourse = programCourses.findBy(
              'subProgramId',
              subProgram.id
            );
            if (programCourse) {
              subProgram.set('programCourse', programCourse);
              if (programCourse.hasJoined) {
                startedCourse.pushObject(subProgram);
              } else {
                notStartedCourses.pushObject(subProgram);
              }
            }
          });
          this.set('startedProgramCourse', startedCourse);
          navigatorProgramList.forEach(programItem => {
            Ember.set(
              programItem,
              'courseList',
              notStartedCourses.filterBy('navigatorProgramId', programItem.id)
            );
          });
          if (navigatorProgramList.length === 1) {
            this.set(
              'notStartedProgramCourse',
              navigatorProgramList[0].courseList
            );
          }
          this.checkProgramLandingPage();
        });
    }
  }
);
