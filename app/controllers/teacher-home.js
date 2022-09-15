import Ember from 'ember';
import Env from 'gooru-web/config/environment';
import ModalMixin from 'gooru-web/mixins/modal';
import { getBarGradeColor } from 'gooru-web/utils/utils';
import Language from 'gooru-web/mixins/language';
import TenantSettingMixin from 'gooru-web/mixins/tenant-settings-mixin';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Controller.extend(
  ModalMixin,
  Language,
  TenantSettingMixin,
  {
    queryParams: [
      'showArchivedClasses',
      'showActiveClasses',
      'showIncompleteClasses',
      'isDeepLink'
    ],

    // -------------------------------------------------------------------------
    // Dependencies

    /**
     * @property {Ember.Service} Service to configuration properties
     */
    configurationService: Ember.inject.service('configuration'),

    /**
     * @property {*} application configuration properties
     */
    configuration: Ember.computed.alias('configurationService.configuration'),

    /**
     * @property {*} application feature properties
     */
    isShowDemoClass: Ember.computed.alias('configuration.SHOW_DEMO_CLASS'),

    /**
     * @type {AnalyticsService} Service to retrieve class performance summary
     */
    analyticsService: Ember.inject.service('api-sdk/analytics'),

    /**
     * @requires service:api-sdk/class
     */

    classService: Ember.inject.service('api-sdk/class'),
    /**
     * @requires service:api-sdk/application
     */

    applicationController: Ember.inject.controller('application'),

    /**
     * @requires controller:teacher/class
     */
    teacherClassController: Ember.inject.controller('teacher/class'),

    /**
     * @requires service:api-sdk/performance
     */

    performanceService: Ember.inject.service('api-sdk/performance'),

    /**
     * @requires service:api-sdk/course
     */
    courseService: Ember.inject.service('api-sdk/course'),

    /**
     * @property {Service} Session service
     */
    session: Ember.inject.service('session'),

    /**
     * @requires service:api-sdk/competency
     */
    competencyService: Ember.inject.service('api-sdk/competency'),

    /**
     * @property {Service} taxonomy service API SDK
     */
    taxonomyService: Ember.inject.service('api-sdk/taxonomy'),

    /**
     * @property {Service} parseEvent service
     */
    parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

    /**
     * @type {libraryService} Library service object
     */
    libraryService: Ember.inject.service('api-sdk/library'),

    /**
     * @property {Service} LookupService service
     */
    lookupService: Ember.inject.service('api-sdk/lookup'),

    isSelectedBox: false,

    // -------------------------------------------------------------------------
    // Methods

    /**
     * @function getLastAccessedClassData
     * Method to get last accessed class data from localStorage/first class
     */
    getLastAccessedClassData() {
      const controller = this;
      let userId = controller.get('session.userId');
      let lastAccessedClassData =
        JSON.parse(localStorage.getItem(`${userId}_recent_class`)) || null;
      let isLastAccessedClassAvailable = lastAccessedClassData
        ? Object.keys(lastAccessedClassData).length
        : null;
      //If last accessed class available in the local storage
      if (!isLastAccessedClassAvailable) {
        let activeClasses = controller.get('activeClasses');
        lastAccessedClassData = activeClasses
          ? activeClasses.objectAt(0)
          : null;
        let courseId = lastAccessedClassData
          ? lastAccessedClassData.courseId
          : null;
        if (courseId) {
          Ember.RSVP.hash({
            courseData: controller
              .get('courseService')
              .fetchByIdWithOutProfile(courseId)
          }).then(({ courseData }) => {
            lastAccessedClassData.course = courseData;
            if (lastAccessedClassData) {
              lastAccessedClassData = controller.updateLastAccessedClass(
                lastAccessedClassData
              );
              controller.set('lastAccessedClassData', lastAccessedClassData);
            }
          });
        }
      }
      controller.set('lastAccessedClassData', lastAccessedClassData);
      return lastAccessedClassData;
    },

    loadPerformance() {
      let controller = this;
      if (controller.get('showArchivedClasses')) {
        let archivedClasses = controller.get('archivedClasses');
        controller.loadClassPerformance(archivedClasses);
        controller.set('isArchivedClassPerformanceLoaded', true);
      } else if (controller.get('showIncompleteClasses')) {
        let incompleteClasses = controller.get('incompleteClasses');
        controller.loadClassPerformance(incompleteClasses);
        controller.set('isIncompleteClassPerformanceLoaded', true);
      } else {
        let activeClasses = controller.get('activeClasses');
        controller.loadClassPerformance(activeClasses);
        controller.set('isActiveClassPerformanceLoaded', true);
      }
    },

    loadClassPerformance(classes) {
      let route = this;

      let nonPremiumClasses = classes.filter(classData => {
        let setting = classData.get('setting');
        return setting === null || !setting['course.premium'];
      });
      let nonPremiumClassIds = nonPremiumClasses.map(classData => {
        return classData.get('id');
      });
      let premiumClassIds = classes
        .filter(classData => {
          let setting = classData.get('setting');
          return setting !== null && setting['course.premium'];
        })
        .map(classData => {
          const preference = classData.get('preference');
          if (preference) {
            return {
              classId: classData.get('id'),
              subjectCode: preference.subject
            };
          }
        });

      let classCourseIds = route.getListOfClassCourseIds(nonPremiumClasses);
      let courseIDs = route.getListOfCourseIds(classes);
      let courseCardsPromise = route
        .get('courseService')
        .fetchCoursesCardData(courseIDs);
      let perfSummaryPromise = route
        .get('performanceService')
        .findClassPerformanceSummaryByClassIds(classCourseIds);
      let competencyCompletionStats =
        premiumClassIds.length > 0
          ? route
            .get('competencyService')
            .getCompetencyCompletionStats(premiumClassIds)
          : Ember.RSVP.resolve([]);
      let caClassPerfSummaryPromise =
        nonPremiumClassIds.length > 0
          ? route
            .get('performanceService')
            .getCAPerformanceData(nonPremiumClassIds)
          : Ember.RSVP.resolve([]);

      Ember.RSVP.hash({
        courseCards: courseCardsPromise,
        perfSummary: perfSummaryPromise,
        caClassPerfSummary: caClassPerfSummaryPromise,
        classes: classes,
        competencyStats: competencyCompletionStats
      }).then(function(hash) {
        hash.classes.forEach(function(activeclass) {
          let classId = activeclass.get('id');
          let courseId = activeclass.get('courseId');

          if (courseId) {
            let course = hash.courseCards.findBy(
              'id',
              activeclass.get('courseId')
            );
            activeclass.set('course', course);
          }
          activeclass.set(
            'performanceSummaryForDCA',
            hash.caClassPerfSummary.findBy('classId', classId)
          );
          activeclass.set(
            'performanceSummary',
            hash.perfSummary.findBy('classId', classId)
          );
          activeclass.set(
            'competencyStats',
            hash.competencyStats.findBy('classId', classId)
          );
        });
      });
    },

    /**
     * @function getSequencedActiveClass
     * Method to get next/previous class by given sequence number
     */
    getSequencedActiveClass(classSeq) {
      const controller = this;
      let activeClasses = controller.get('activeClasses');
      let sequencedActiveClass = activeClasses.objectAt(classSeq) || null;
      if (sequencedActiveClass) {
        sequencedActiveClass = controller.updateLastAccessedClass(
          sequencedActiveClass
        );
      }
      return sequencedActiveClass;
    },

    /**
     * @function updateLastAccessedClass
     * Method to update last accessed class data into the localStorage
     */
    updateLastAccessedClass(classData) {
      const controller = this;
      controller.updateLastAccessedClassPosition(classData.id);
      return controller
        .get('teacherClassController')
        .updateLastAccessedClass(classData);
    },

    /**
     * @function updateLastAccessedClassPosition
     * Method to update last accessed class position
     */
    updateLastAccessedClassPosition(classId) {
      let controller = this;
      let activeClasses = controller.get('activeClasses');
      let classPosition = activeClasses.findIndex(function(classData) {
        return classData.id === classId;
      });
      controller.set('currentClassPosition', classPosition);
      return classPosition;
    },

    /**
     * @function checkIsPartOfPremiumClass
     * Method to check is the teacher part of any premium class
     */
    checkIsPartOfPremiumClass(activeClasses) {
      let isPartOfPremiumClass = false;
      activeClasses.some(function(classData) {
        let setting = classData.get('setting');
        isPartOfPremiumClass = setting ? setting['course.premium'] : false;
        return isPartOfPremiumClass;
      });
      return isPartOfPremiumClass;
    },

    /**
     * @function getListOfClassCourseIds
     * Method to fetch class and course ids from the list of classess
     */
    getListOfClassCourseIds(classes) {
      let listOfActiveClassCourseIds = Ember.A([]);
      classes.map(clas => {
        if (clas.get('courseId')) {
          let classCourseId = {
            classId: clas.get('id'),
            courseId: clas.get('courseId')
          };
          listOfActiveClassCourseIds.push(classCourseId);
        }
      });
      return listOfActiveClassCourseIds;
    },

    /**
     * @function getListOfCourseIds
     * Method to fetch course ids from the list of classess
     */
    getListOfCourseIds(classes) {
      let listOfActiveClassCourseIds = Ember.A([]);
      classes.map(activeClass => {
        if (activeClass.get('courseId')) {
          listOfActiveClassCourseIds.push(activeClass.get('courseId'));
        }
      });
      return listOfActiveClassCourseIds;
    },

    clearLastAccessedClassCard() {
      let userId = this.get('session.userId');
      window.localStorage.removeItem(`lastAccessedClassId_${userId}`);
    },

    // -------------------------------------------------------------------------
    // Actions

    actions: {
      /**
       * Action triggered when close collection report pull up
       */
      onClosePullUp() {
        let controller = this;
        controller.set('isShowArchiveClassReport', false);
        controller.set('isShowUnitReportPullUp', false);
        controller.set('isShowLessonReportPullUp', false);
        controller.set('isShowCollectionReportPullUp', false);
      },

      /**
       * Action triggered when click on the archived class report
       */
      onShowArchivedClassReport(classData) {
        const controller = this;
        let classReportParams = {
          course: classData.get('course'),
          class: classData,
          classId: classData.get('id'),
          courseId: classData.get('courseId'),
          classMembers: classData.get('members')
        };
        controller.set('classReportParams', classReportParams);
        controller.set('isShowArchiveClassReport', true);
      },

      /**
       * Action triggered when click on the archived class unit report
       */
      onOpenUnitReport(params) {
        let controller = this;
        controller.set('isShowUnitReportPullUp', true);
        controller.set('unitReportData', params);
      },

      /**
       * Action triggered when click on the archived class lesson report
       */
      onOpenLessonReport(params) {
        let controller = this;
        controller.set('isShowLessonReportPullUp', true);
        controller.set('lessonReportData', params);
      },

      /**
       * Action triggered when click on the archived class collection report
       */
      teacherCollectionReport(params) {
        let controller = this;
        controller.set('isShowCollectionReportPullUp', true);
        controller.set('teacherCollectionReportData', params);
      },
      /**
       *Filter by most recent
       */
      filterByDate: function() {
        this.clearLastAccessedClassCard();
        if (this.get('sortOn') === 'title') {
          this.set('order', 'desc');
          this.set('sortOn', 'startDate');
        } else {
          this.set('order', this.get('order') === 'asc' ? 'desc' : 'asc');
        }
      },
      /**
     *Filter by alphanumeric

     */
      filterByTitle: function() {
        this.clearLastAccessedClassCard();
        if (this.get('sortOn') === 'startDate') {
          this.set('order', 'asc');
          this.set('sortOn', 'title');
        } else {
          this.set('order', this.get('order') === 'desc' ? 'asc' : 'desc');
        }
      },

      showClasses: function(type) {
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.CLICK_CURRENTLY_TEACHING
        );
        this.set('showActiveClasses', type === 'active');
        this.set('showArchivedClasses', type === 'archived');
        this.set('showIncompleteClasses', type === 'incomplete');
        if (!this.get('isActiveClassPerformanceLoaded')) {
          this.loadPerformance();
        }
      },

      archivedClass: function(type) {
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.CLICK_ARCHIVED_CLASSROOMS
        );
        this.set('showArchivedClasses', type === 'archived');
        this.set('showActiveClasses', type === 'active');
        this.set('showIncompleteClasses', type === 'incomplete');
        if (!this.get('isArchivedClassPerformanceLoaded')) {
          this.loadPerformance();
        }
      },

      incompleteClass: function(type) {
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.CLICK_INCOMPLETE_SETUP
        );
        this.set('showArchivedClasses', type === 'archived');
        this.set('showActiveClasses', type === 'active');
        this.set('showIncompleteClasses', type === 'incomplete');
        if (!this.get('isIncompleteClassPerformanceLoaded')) {
          this.loadPerformance();
        }
      },

      updateClass: function(classId) {
        const controller = this;
        controller.send('updateUserClasses'); // Triggers the refresh of user classes in top header
        controller.transitionToRoute('teacher.class.course-map', classId);
      },

      /**
       * Action triggered when user move to next/previous class
       */
      onChangeAtcClass(actionSequence) {
        const controller = this;
        let currentClassPosition = controller.get('currentClassPosition');
        let classSeq =
          actionSequence === 'previous'
            ? currentClassPosition - 1
            : currentClassPosition + 1;
        controller.set(
          'lastAccessedClassData',
          controller.getSequencedActiveClass(classSeq)
        );
      },

      //Action trigger when proceeding class setup process
      onShowCompleteSetup(classData) {
        this.set('isShowClassSetup', true);
        this.set('classSetupData', classData);
      },

      //Action triggered when class setup is done
      classSetupDone(classData) {
        const classRoomData = this.get('activeClassesList').findBy(
          'id',
          classData.get('id')
        );
        const classRoomDataSetting = classRoomData.get('setting') || {};
        classRoomDataSetting['class.setup.complete'] = true;
        classRoomData.set('setting', classRoomDataSetting);
        classRoomData.set('isPendingSetup', false);
        this.set('isShowClassSetup', false);
      },

      onCreateClass(newClass) {
        this.set('newClass', newClass);
        this.set('isShowCreateClassPop', true);
      },

      onDeleteClass(classdata) {
        let sortedIncompleteClasses = this.get('sortedIncompleteClasses');
        sortedIncompleteClasses.removeObject(classdata);
      },

      onRefreshClass(classId) {
        alert(classId);
      },

      selectBox() {
        const controller = this;
        controller.set('isSelectedBox', !controller.get('isSelectedBox'));
        let checkBox = controller.get('isSelectedBox');
        let activeClassesList = controller.get('activeClassesList');

        if (activeClassesList) {
          activeClassesList.forEach(function(activeClasses) {
            activeClasses.set('isCheckBoxChecked', checkBox);
          });
          controller.set(
            'selectedCount',
            checkBox ? activeClassesList.length : 0
          );
        }
      },

      onSubmit() {
        const controller = this;
        let activeClassesList = controller.get('activeClassesList');

        let filterData = activeClassesList.filter(searchResult => {
          return searchResult.isCheckBoxChecked;
        });

        if (filterData) {
          let listData = Ember.A([]);
          let baseUrl = `${window.location.origin}`;
          filterData.forEach(function(result) {
            const list = {
              launchTarget: 'Class',
              url: `${baseUrl}/api/nucleus-lti/v1/lti/v1p3/launch`,
              classId: result.id,
              contentTitle: result.title
            };
            listData.pushObject(list);
          });
          controller.get('libraryService').postLtiData(listData);
          activeClassesList.forEach(function(searchResult) {
            searchResult.set('isCheckBoxChecked', false);
          });
          controller.set('selectedCount', 0);
        }
      },

      onSelectSingleBox(item) {
        const controller = this;
        let activeClassesList = controller.get('activeClassesList');
        let selectedClass = activeClassesList.findBy('id', item.id);

        if (selectedClass) {
          selectedClass.set(
            'isCheckBoxChecked',
            !selectedClass.isCheckBoxChecked
          );
        }

        let filterData = activeClassesList.filter(activeClassesList => {
          return activeClassesList.isCheckBoxChecked;
        });

        if (filterData) {
          controller.set('selectedCount', filterData.length);
        } else {
          controller.set('selectedCount', 0);
        }
      }
    },

    // -------------------------------------------------------------------------
    // Events

    init() {
      const controller = this;
      controller._super(...arguments);
      //Functionality to integrate bootstrap tooltip
      Ember.run.scheduleOnce('afterRender', controller, function() {
        $('[data-toggle="tooltip"]').tooltip({
          trigger: 'hover'
        });
      });
      if (controller.get('profile.enableForcePasswordChange')) {
        controller.transitionToRoute('force-change-password');
      }
    },

    changeLanguage() {
      const controller = this;
      controller.changeLanguageHomePage();
    },

    // -------------------------------------------------------------------------
    // Properties

    /**
     * @property {Boolean} isShowSortOptions
     */
    isShowSortOptions: Ember.computed(
      'showActiveClasses',
      'showArchivedClasses',
      'showIncompleteClasses',
      function() {
        const controller = this;
        let isShowActiveClassess = controller.get('showActiveClasses');
        let isShowArchiveClassess = controller.get('showArchivedClasses');
        let isShowIncompleteClassess = controller.get('showIncompleteClasses');
        let activeClassesCount = controller.get('activeClassesList.length');
        let incompleteClassesCount = controller.get('sortedIncompleteClasses');
        let archivedClassesCount = controller.get(
          'sortedArchivedClassrooms.length'
        );
        return (
          (isShowActiveClassess && activeClassesCount) ||
          (isShowArchiveClassess && archivedClassesCount) ||
          (isShowIncompleteClassess && incompleteClassesCount)
        );
      }
    ),

    /**
     * Indicates when then active classes are visible
     * @property {boolean}
     */
    showActiveClasses: true,

    /**
     * Indicates when then archived classes are visible
     * @property {boolean}
     */
    showArchivedClasses: false,

    /**
     * Indicates when then archived classes are visible
     * @property {boolean}
     */
    showIncompleteClasses: false,

    /**
     * Maintains the state of Active class performance loaded ot not
     * @type {Boolean}
     */
    isActiveClassPerformanceLoaded: false,

    /**
     * Maintains the state of Archived class performance loaded ot not
     * @type {Boolean}
     */
    isArchivedClassPerformanceLoaded: false,

    /**
     * Maintains the state of Incomplete class performance loaded ot not
     * @type {Boolean}
     */
    isIncompleteClassPerformanceLoaded: false,

    /**
     * @property {Profile}
     */
    profile: Ember.computed.alias('applicationController.profile'),

    /**
     * @property {Number} Total of teaching classes
     */
    totalTeachingClasses: Ember.computed.alias('activeClasses.length'),

    /**
     * @property {boolean} Indicates if there are classes
     */
    hasClasses: Ember.computed.bool('totalTeachingClasses'),

    /**
     * @property {string} Indicates the order of the sorting
     */
    order: Ember.computed('preferenceSetting', function() {
      var preference = this.get('preferenceSetting');
      return preference &&
        preference.class_sort_preference &&
        preference.class_sort_preference === 'recently_updated'
        ? 'desc'
        : 'asc';
    }),

    preferenceSetting: null,

    /**
     * @property {string} Indicates the sorting criteria
     */
    sortOn: Ember.computed('preferenceSetting', function() {
      var preference = this.get('preferenceSetting');
      return preference &&
        preference.class_sort_preference &&
        preference.class_sort_preference === 'recently_updated'
        ? 'startDate'
        : 'title';
    }),
    /**
     * @property {[Class]} Sorted archived classrooms
     */
    sortedArchivedClassrooms: Ember.computed.sort(
      'archivedClasses',
      'sortDefinition'
    ),

    /**
     * @property {[Class]} Sorted incomplete classrooms
     */
    sortedIncompleteClasses: Ember.computed.sort(
      'incompleteClasses',
      'sortDefinition'
    ),

    /**
     * @property {[Class]} sortedActiveClasses
     */
    sortedActiveClasses: Ember.computed.sort('activeClasses', 'sortDefinition'),

    activeClassesList: Ember.computed('sortedActiveClasses', function() {
      var sortedActiveClasses = this.get('sortedActiveClasses');
      let localStorage = window.localStorage;
      let userId = this.get('session.userId');
      let lastAccessedClassIdList = JSON.parse(
        localStorage.getItem(`lastAccessedClassId_${userId}`)
      );

      if (lastAccessedClassIdList) {
        lastAccessedClassIdList.forEach(function(classId) {
          if (classId) {
            let lastAccessClass = sortedActiveClasses.filterBy('id', classId);
            sortedActiveClasses.splice(
              sortedActiveClasses.findIndex(
                lastAccessedClass => lastAccessedClass.id === classId
              ),
              1
            );
            sortedActiveClasses.unshift(...lastAccessClass);
          }
        });
      }
      return sortedActiveClasses;
    }),

    /**
     * sort Definition
     */
    sortDefinition: Ember.computed('sortOn', 'order', function() {
      return [`${this.get('sortOn')}:${this.get('order')}`];
    }),

    /**
     * Toolkit site url
     * @property {string}
     */
    toolkitSiteUrl: Ember.computed(function() {
      return Env.toolkitSiteUrl;
    }),

    isDeepLinks: Ember.computed(function() {
      return this.get('isDeepLink') === 'true';
    }),

    /**
     * @property {JSON}
     * Property to store last accessed class data
     */
    lastAccessedClassData: null,

    /**
     * @property {Boolean}
     * Property to show/hide ATC view
     */
    isShowAtcView: false,

    /**
     * @property {Number}
     * Property to store last accessed class position
     */
    currentClassPosition: 0,

    /**
     * @property {String}
     * Property to hold class performance color based on score value
     */
    classPerformanceColor: Ember.computed('lastAccessedClassData', function() {
      let controller = this;
      let classPerformance = controller.get(
        'lastAccessedClassData.performance'
      );
      return classPerformance ? getBarGradeColor(classPerformance.score) : null;
    }),

    isShowNavigatorBanner: Ember.computed('activeClasses', function() {
      let controller = this;
      let activeClasses = controller.get('activeClasses');
      return !controller.checkIsPartOfPremiumClass(activeClasses);
    }),

    /**
     * @property {Boolean} isShowClassSetup
     * Property to show/hide class setup pullup
     */
    isShowClassSetup: false,

    /**
     * @property {Object} classSetupData
     * Property for class object which needs to be verified
     */
    classSetupData: Ember.Object.create({}),

    /**
     * @property {Object} newClass
     * Property to hold new create class Name
     */
    newClass: null,

    /**
     * @property {Boolean} isShowCreateClassPop
     * Property help to show hide create class pop
     */
    isShowCreateClassPop: false,

    /**
     * @property {Boolean} isEnableCreateClass
     * Property help to show hide create class card
     */
    isEnableCreateClass: Ember.computed('tenantSettingsObj', function() {
      let tenantSetting = this.get('tenantSettingsObj');
      return tenantSetting &&
        tenantSetting.ui_element_visibility_settings &&
        tenantSetting.ui_element_visibility_settings.enable_create_class ===
          false
        ? tenantSetting.ui_element_visibility_settings.enable_create_class
        : true;
    }),

    /**
     * @property {Boolean} isEnableCreateSubjectCard
     * Property help to show hide create subject class card
     */
    isEnableCreateSubjectCard: Ember.computed('tenantSettingsObj', function() {
      let tenantSetting = this.get('tenantSettingsObj');
      return tenantSetting &&
        tenantSetting.ui_element_visibility_settings &&
        tenantSetting.ui_element_visibility_settings
          .class_create_show_subject_cards === false
        ? tenantSetting.ui_element_visibility_settings
          .class_create_show_subject_cards
        : true;
    }),

    /**
     * Subject list
     * @property {Ember.Array}
     */
    subjectList: Ember.computed(function() {
      let listOfSubs = Ember.A([]);

      this.get('lookupService')
        .getFeatureSubjects()
        .then(subjects => {
          if (subjects) {
            subjects.forEach(function(subject) {
              let list = {
                name: subject.tx_subject_name,
                publisherName: subject.publisher_name,
                subjectCode: subject.tx_subject_code,
                fwCode: subject.fw_code,
                courses: subject.courses
              };
              listOfSubs.pushObject(list);
            });
          }
        });

      return listOfSubs;
    })
  }
);
